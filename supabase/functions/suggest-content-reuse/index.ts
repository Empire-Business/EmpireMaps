import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface ReuseRequest {
  client_id: string
  card_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { client_id, card_id }: ReuseRequest = await req.json()

    if (!client_id || !card_id) {
      return new Response(
        JSON.stringify({ error: 'client_id e card_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch the source card
    const { data: card, error: cardError } = await supabase
      .from('content_cards')
      .select('*')
      .eq('id', card_id)
      .eq('client_id', client_id)
      .single()

    if (cardError || !card) {
      return new Response(
        JSON.stringify({ error: 'Card não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch client's editorial line for context
    const { data: editorial } = await supabase
      .from('deliverables')
      .select('processed_json')
      .eq('client_id', client_id)
      .eq('type', 'editorial_line')
      .eq('status', 'ready')
      .single()

    const editorialContext = editorial?.processed_json
      ? JSON.stringify(editorial.processed_json, null, 2)
      : 'Linha editorial não disponível.'

    const prompt = `Você é um estrategista de conteúdo. Analise este card de conteúdo e sugira como reaproveitá-lo em outros formatos e canais.

Card original:
- Título: ${card.title}
- Formato: ${card.format ?? 'Não especificado'}
- Canal: ${card.channel ?? 'Não especificado'}
- Descrição: ${card.description ?? 'Sem descrição'}
- Tags: ${(card.tags as string[])?.join(', ') ?? 'Nenhuma'}

Linha Editorial do cliente:
${editorialContext}

Retorne um JSON com a seguinte estrutura:
{
  "suggestions": [
    {
      "format": "string (nome do formato sugerido)",
      "channel": "string (canal sugerido)",
      "rationale": "string (por que esta adaptação faz sentido)",
      "adaptation_tips": ["string (dica 1)", "string (dica 2)"]
    }
  ],
  "key_insight": "string (insight principal sobre o potencial de reaproveitamento)"
}`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://empiremaps.com.br',
        'X-Title': 'Empire Maps',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenRouter error: ${errText}`)
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content ?? '{}'

    let suggestions: unknown
    try {
      suggestions = JSON.parse(rawContent)
    } catch {
      suggestions = { suggestions: [], key_insight: rawContent }
    }

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('suggest-content-reuse error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
