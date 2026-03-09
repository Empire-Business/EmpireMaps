import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface WelcomeEmailRequest {
  user_id: string
  email: string
  full_name: string
  temp_password?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email, full_name, temp_password }: WelcomeEmailRequest = await req.json()

    if (!user_id || !email || !full_name) {
      return new Response(
        JSON.stringify({ error: 'user_id, email e full_name são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Verify user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const loginUrl = 'https://empiremaps.com.br/login'

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Empire Maps</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1e1e1e;border-radius:2px;">
          <!-- Header -->
          <tr>
            <td style="padding:40px 48px 32px;border-bottom:1px solid #1e1e1e;">
              <p style="margin:0 0 8px;color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Portal de Consultoria</p>
              <h1 style="margin:0;color:#f5f5f0;font-size:28px;font-weight:600;font-family:Georgia,serif;">Empire Maps</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <p style="margin:0 0 24px;color:#f5f5f0;font-size:16px;line-height:1.6;">
                Olá, <strong>${full_name}</strong>.
              </p>
              <p style="margin:0 0 24px;color:#9a9a8e;font-size:15px;line-height:1.7;">
                Seu acesso ao <strong style="color:#f5f5f0;">Empire Maps</strong> foi criado.
                Esta é a plataforma onde você acompanhará toda a sua jornada de consultoria estratégica de conteúdo.
              </p>

              ${temp_password ? `
              <div style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #c9a84c;padding:20px 24px;margin:24px 0;">
                <p style="margin:0 0 8px;color:#9a9a8e;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Seus dados de acesso</p>
                <p style="margin:4px 0;color:#f5f5f0;font-size:14px;"><strong>E-mail:</strong> ${email}</p>
                <p style="margin:4px 0;color:#f5f5f0;font-size:14px;"><strong>Senha temporária:</strong> <code style="background:#0a0a0a;padding:2px 6px;border-radius:2px;color:#c9a84c;">${temp_password}</code></p>
                <p style="margin:12px 0 0;color:#9a9a8e;font-size:12px;">Altere sua senha após o primeiro acesso.</p>
              </div>
              ` : ''}

              <p style="margin:0 0 8px;color:#9a9a8e;font-size:15px;line-height:1.7;">
                Clique no botão abaixo para acessar o portal:
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td>
                    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c96d);color:#0a0a0a;text-decoration:none;padding:14px 32px;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;border-radius:1px;">
                      Acessar o Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;color:#9a9a8e;font-size:14px;line-height:1.7;">
                Se tiver dúvidas, entre em contato com sua equipe de consultoria.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #1e1e1e;">
              <p style="margin:0;color:#555;font-size:12px;line-height:1.6;">
                © ${new Date().getFullYear()} Empire Maps · Portal de Consultoria Estratégica<br>
                Este e-mail foi enviado automaticamente. Não responda a este endereço.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Empire Maps <noreply@empiremaps.com.br>',
        to: [email],
        subject: 'Bem-vindo ao Empire Maps — Seu acesso está pronto',
        html: htmlContent,
      }),
    })

    if (!resendResponse.ok) {
      const errText = await resendResponse.text()
      throw new Error(`Resend error: ${errText}`)
    }

    const resendData = await resendResponse.json()

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('send-welcome-email error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
