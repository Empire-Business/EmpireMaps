import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const SYSTEM_PROMPT = `Você é um especialista em planejamento de conteúdo digital.
Analise o documento Markdown fornecido que descreve um Mapa de Produção de conteúdo.
Extraia cada conteúdo/peça mencionado e retorne um JSON com a seguinte estrutura:
{
  "cards": [
    {
      "title": "string — título do conteúdo",
      "description": "string | null — descrição ou detalhes",
      "channel": "string | null — canal (Instagram, YouTube, LinkedIn, TikTok, Twitter/X, Facebook, Pinterest, Blog, Email, Outro)",
      "format_free": "string | null — formato livre do conteúdo (ex: Reels, Carrossel, Post, Vídeo, etc)",
      "status": "ideia" | "em_producao" | "revisao" | "agendado" | "publicado",
      "production_date": "string | null — formato YYYY-MM-DD se mencionado",
      "publish_date": "string | null — formato YYYY-MM-DD se mencionado",
      "responsible": "string | null — responsável mencionado",
      "labels": ["string"] | null — palavras-chave relevantes
    }
  ]
}
Retorne APENAS o JSON, sem texto adicional. Se não identificar cards, retorne {"cards": []}.`

interface ParseRequest {
  client_id: string
  markdown: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id, markdown }: ParseRequest = await req.json()

    if (!client_id || !markdown) {
      return new Response(
        JSON.stringify({ error: 'client_id e markdown são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Call OpenRouter API
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
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Analise o seguinte documento e retorne APENAS o JSON estruturado:\n\n${markdown}`,
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

    let parsed: { cards?: unknown[] }
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      throw new Error('Falha ao interpretar resposta da IA')
    }

    const cardsData = Array.isArray(parsed.cards) ? parsed.cards : []

    if (cardsData.length === 0) {
      return new Response(
        JSON.stringify({ success: true, created: 0, message: 'Nenhum card identificado no documento.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert cards into content_cards
    const inserts = cardsData.map((card: unknown) => {
      const c = card as Record<string, unknown>
      return {
        client_id,
        title: String(c.title ?? 'Sem título'),
        description: c.description ? String(c.description) : null,
        channel: c.channel ? String(c.channel) : null,
        format_free: c.format_free ? String(c.format_free) : null,
        status: ['ideia', 'em_producao', 'revisao', 'agendado', 'publicado'].includes(String(c.status))
          ? String(c.status)
          : 'ideia',
        production_date: c.production_date ? String(c.production_date) : null,
        publish_date: c.publish_date ? String(c.publish_date) : null,
        responsible: c.responsible ? String(c.responsible) : null,
        labels: Array.isArray(c.labels) ? c.labels.map(String) : null,
      }
    })

    const { error: insertError, count } = await supabase
      .from('content_cards')
      .insert(inserts)
      .select('id', { count: 'exact', head: true })

    if (insertError) {
      throw new Error(`Erro ao inserir cards: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, created: count ?? cardsData.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('parse-production-map error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
