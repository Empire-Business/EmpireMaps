// No external imports — uses native Deno fetch + Supabase REST API directly
// This allows deployment via Management API (not just CLI)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const RISK_MAP_PROMPT = `Você é um especialista em diagnóstico de posicionamento e autoridade para criadores de conteúdo e especialistas que vendem serviços de alto valor.

Analise o documento Markdown fornecido e gere um diagnóstico estruturado em EXATAMENTE 5 dimensões, com EXATAMENTE estes IDs e labels — não altere nenhum deles:

1. id: "posicionamento" | label: "Posicionamento"
   — O perfil/negócio comunica claramente quem é, para quem fala e qual problema resolve? Bio, linha editorial, consistência temática.

2. id: "autoridade_percebida" | label: "Autoridade Percebida"
   — Existem provas concretas de resultado? Cases, depoimentos com números, resultados próprios documentados.

3. id: "fit_audiencia_oferta" | label: "Fit Audiência–Oferta"
   — O público que acompanha esse negócio tem perfil de quem compraria o serviço/produto oferecido? Engajamento qualitativo, perguntas, perfil do público.

4. id: "maturidade_comercial" | label: "Maturidade Comercial"
   — O negócio já vendeu algo? Sabe descrever sua oferta em termos de resultado? Histórico de precificação e vendas.

5. id: "risco_reposicionamento" | label: "Risco de Reposicionamento"
   — Se quiser lançar algo novo ou mais caro, o quanto isso contraria o que a audiência espera? Consistência entre o que comunica e o que quer vender.

Para cada dimensão, atribua um score de 1.0 a 5.0 (use decimais como 2.5, 3.5):
- 1.0–2.4 = Crítico (risco alto, ação urgente)
- 2.5–3.9 = Atenção (risco moderado, melhoria necessária)
- 4.0–5.0 = OK (risco baixo, manter e evoluir)

Baseie TODA a análise exclusivamente nos dados do documento fornecido. Cite trechos reais para fundamentar os scores.

Responda APENAS com um JSON válido, sem texto antes ou depois, sem markdown, sem backticks:
{
  "perfil_resumo": "Uma frase descrevendo o negócio ou cliente analisado em linguagem direta",
  "dimensoes": [
    {
      "id": "posicionamento",
      "label": "Posicionamento",
      "score": 3.5,
      "justificativa": "Justificativa baseada nos dados do documento. Cite trechos específicos.",
      "evidencias": ["Evidência 1 extraída do documento", "Evidência 2 extraída do documento"],
      "recomendacao": "O que fazer agora — direto ao ponto, sem rodeios."
    },
    {
      "id": "autoridade_percebida",
      "label": "Autoridade Percebida",
      "score": 2.0,
      "justificativa": "...",
      "evidencias": ["...", "..."],
      "recomendacao": "..."
    },
    {
      "id": "fit_audiencia_oferta",
      "label": "Fit Audiência–Oferta",
      "score": 4.0,
      "justificativa": "...",
      "evidencias": ["...", "..."],
      "recomendacao": "..."
    },
    {
      "id": "maturidade_comercial",
      "label": "Maturidade Comercial",
      "score": 1.5,
      "justificativa": "...",
      "evidencias": ["...", "..."],
      "recomendacao": "..."
    },
    {
      "id": "risco_reposicionamento",
      "label": "Risco de Reposicionamento",
      "score": 3.0,
      "justificativa": "...",
      "evidencias": ["...", "..."],
      "recomendacao": "..."
    }
  ],
  "score_global": 2.8,
  "veredito": "Uma frase direta sobre se o negócio está apto ou não para o próximo passo comercial.",
  "prioridades": [
    "Prioridade 1 — a ação mais urgente e de maior impacto",
    "Prioridade 2 — segunda ação mais importante",
    "Prioridade 3 — terceira ação recomendada"
  ]
}`

const BRAND_BOOK_PROMPT = `Você é um especialista em branding e identidade de marca.
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
}`

const EDITORIAL_LINE_PROMPT = `Você é um estrategista de conteúdo digital.
Analise o documento Markdown fornecido e extraia os dados estruturados da Linha Editorial.
Retorne um JSON com a seguinte estrutura:
{
  "positioning": "string",
  "content_pillars": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "percentage": 0,
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
    "weekly_posts": 0,
    "best_times": ["string"]
  },
  "kpis": ["string"]
}`

const SYSTEM_PROMPTS: Record<string, string> = {
  risk_map: RISK_MAP_PROMPT,
  brand_book: BRAND_BOOK_PROMPT,
  editorial_line: EDITORIAL_LINE_PROMPT,
}

async function supabaseGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  return res.json()
}

async function supabasePatch(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(body),
  })
  return res
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id, type } = await req.json()

    if (!client_id || !type) {
      return new Response(
        JSON.stringify({ error: 'client_id e type são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the deliverable with raw_markdown
    const rows = await supabaseGet(
      `deliverables?client_id=eq.${client_id}&type=eq.${type}&select=id,raw_markdown&limit=1`
    )

    if (!rows || rows.length === 0 || rows.error) {
      return new Response(
        JSON.stringify({ error: 'Deliverable não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const deliverable = rows[0]

    if (!deliverable.raw_markdown) {
      return new Response(
        JSON.stringify({ error: 'Nenhum markdown encontrado para processar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark as in_progress
    await supabasePatch(`deliverables?id=eq.${deliverable.id}`, { status: 'in_progress' })

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
        model: 'anthropic/claude-sonnet-4.6',
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
      const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      processedJson = JSON.parse(cleaned)
    } catch {
      processedJson = { raw: rawContent }
    }

    // Save processed result — keeps status as in_progress for consultant review
    await supabasePatch(`deliverables?id=eq.${deliverable.id}`, { processed_json: processedJson })

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
