import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface ProcessRequest {
  client_id: string
  type: 'risk_map' | 'brand_book' | 'editorial_line'
}

const SYSTEM_PROMPTS: Record<string, string> = {
  risk_map: `Você é um especialista em diagnóstico estratégico de negócios digitais e posicionamento de autoridade.

Analise o documento Markdown fornecido e gere um diagnóstico estruturado em EXATAMENTE 5 dimensões de risco/oportunidade. Escolha as 5 dimensões mais relevantes para o negócio/perfil descrito no documento. Exemplos de dimensões: Posicionamento, Audiência, Oferta, Autoridade, Operação, Crescimento, Presença Digital, Maturidade Comercial — use as que fizerem mais sentido para o contexto.

Para cada dimensão, atribua um score de 1.0 a 5.0 (use decimais como 2.5, 3.5):
- 1.0–2.4 = Crítico (risco alto, ação urgente)
- 2.5–3.9 = Atenção (risco moderado, melhoria necessária)
- 4.0–5.0 = OK (risco baixo, manter e evoluir)

Baseie TODA a análise exclusivamente nos dados do documento fornecido. Cite trechos reais para fundamentar os scores.

Retorne APENAS um JSON válido, sem texto antes ou depois, sem markdown, sem backticks:
{
  "perfil_resumo": "Uma frase descrevendo o negócio ou cliente analisado",
  "dimensoes": [
    {
      "id": "snake_case_id",
      "label": "Nome da Dimensão",
      "score": 3.5,
      "justificativa": "Justificativa baseada nos dados do documento. Cite trechos específicos.",
      "evidencias": ["Evidência 1 extraída do documento", "Evidência 2 extraída do documento"],
      "recomendacao": "O que fazer agora — direto ao ponto, sem rodeios."
    }
  ],
  "score_global": 2.8,
  "veredito": "Frase direta e honesta sobre o estado atual do negócio e o principal desafio a resolver.",
  "prioridades": [
    "Prioridade 1 — a ação mais urgente e de maior impacto",
    "Prioridade 2 — segunda ação mais importante",
    "Prioridade 3 — terceira ação recomendada"
  ]
}`,

  brand_book: `Você é um especialista em branding e identidade de marca.
Analise o documento Markdown fornecido e extraia os dados estruturados do Brand Book.
Retorne um JSON com EXATAMENTE a seguinte estrutura (use null para campos ausentes):
{
  "thesis": "string com a tese ou essência da marca",
  "archetype": "string com o arquétipo de marca (ex: O Sábio, O Herói, etc)",
  "positioning": "string com o posicionamento de mercado",
  "written_voice": {
    "tone": "string descrevendo o tom de voz escrito",
    "examples": [
      { "correct": "exemplo correto", "avoid": "exemplo a evitar" }
    ]
  },
  "spoken_voice": {
    "tone": "string descrevendo o tom de voz falado",
    "examples": [
      { "correct": "exemplo correto", "avoid": "exemplo a evitar" }
    ]
  },
  "key_messages": ["mensagem chave 1", "mensagem chave 2"],
  "sections": [
    { "title": "título da seção extra", "content": "conteúdo da seção" }
  ]
}`,

  editorial_line: `Você é um estrategista de conteúdo digital.
Analise o documento Markdown fornecido e extraia os dados estruturados da Linha Editorial.
Retorne um JSON com a seguinte estrutura:
{
  "positioning": "string",
  "content_pillars": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "percentage": number,
      "examples": ["string"]
    }
  ],
  "channels": [
    {
      "name": "string",
      "objective": "string",
      "frequency": "string",
      "content_types": ["string"]
    }
  ],
  "formats": ["string"],
  "posting_frequency": {
    "weekly_posts": number,
    "best_times": ["string"]
  },
  "kpis": ["string"]
}`,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id, type }: ProcessRequest = await req.json()

    if (!client_id || !type) {
      return new Response(
        JSON.stringify({ error: 'client_id e type são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch the deliverable with raw_markdown
    const { data: deliverable, error: fetchError } = await supabase
      .from('deliverables')
      .select('id, raw_markdown')
      .eq('client_id', client_id)
      .eq('type', type)
      .single()

    if (fetchError || !deliverable) {
      return new Response(
        JSON.stringify({ error: 'Deliverable não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!deliverable.raw_markdown) {
      return new Response(
        JSON.stringify({ error: 'Nenhum markdown encontrado para processar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark as in_progress
    await supabase
      .from('deliverables')
      .update({ status: 'in_progress' })
      .eq('id', deliverable.id)

    // Call OpenRouter API
    const systemPrompt = SYSTEM_PROMPTS[type]

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://empiremaps.com.br',
        'X-Title': 'Empire Maps',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analise o seguinte documento e retorne APENAS o JSON estruturado, sem texto adicional:\n\n${deliverable.raw_markdown}`,
          },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    })

    if (!openrouterResponse.ok) {
      const errText = await openrouterResponse.text()
      throw new Error(`OpenRouter error: ${errText}`)
    }

    const openrouterData = await openrouterResponse.json()
    const rawContent = openrouterData.choices?.[0]?.message?.content ?? '{}'

    let processedJson: unknown
    try {
      processedJson = JSON.parse(rawContent)
    } catch {
      processedJson = { raw: rawContent }
    }

    // Save processed result — keeps status as in_progress for consultant review
    const { error: updateError } = await supabase
      .from('deliverables')
      .update({
        processed_json: processedJson,
      })
      .eq('id', deliverable.id)

    if (updateError) {
      throw new Error(`Erro ao salvar resultado: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, type, client_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('process-deliverable error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
