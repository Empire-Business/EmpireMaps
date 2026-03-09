import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''

interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'consultant' | 'client'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, full_name, role }: CreateUserRequest = await req.json()

    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: 'email, password, full_name e role são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Create user via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? 'Erro ao criar usuário')
    }

    const userId = authData.user.id

    // 2. Upsert profile with role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: userId, role, full_name }, { onConflict: 'id' })

    if (profileError) {
      // Best-effort: auth user was created, profile might have been created by trigger
      console.warn('Profile upsert warning:', profileError.message)
    }

    // 3. Send welcome email (best-effort — does not fail user creation)
    if (RESEND_API_KEY) {
      const loginUrl = 'https://empiremaps.com.br/login'
      const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Bem-vindo ao Empire Maps</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #1e1e1e;">
        <tr><td style="padding:40px 48px 32px;border-bottom:1px solid #1e1e1e;">
          <p style="margin:0 0 8px;color:#c9a84c;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Portal de Consultoria</p>
          <h1 style="margin:0;color:#f5f5f0;font-size:28px;font-weight:600;">Empire Maps</h1>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="color:#f5f5f0;font-size:16px;">Olá, <strong>${full_name}</strong>.</p>
          <p style="color:#9a9a8e;font-size:15px;line-height:1.7;">Seu acesso ao <strong style="color:#f5f5f0;">Empire Maps</strong> foi criado.</p>
          <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-left:3px solid #c9a84c;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#9a9a8e;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Seus dados de acesso</p>
            <p style="margin:4px 0;color:#f5f5f0;font-size:14px;"><strong>E-mail:</strong> ${email}</p>
            <p style="margin:4px 0;color:#f5f5f0;font-size:14px;"><strong>Senha:</strong> <code style="background:#0a0a0a;padding:2px 6px;color:#c9a84c;">${password}</code></p>
          </div>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td>
              <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#c9a84c,#e8c96d);color:#0a0a0a;text-decoration:none;padding:14px 32px;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                Acessar o Portal
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 48px;border-top:1px solid #1e1e1e;">
          <p style="margin:0;color:#555;font-size:12px;">© ${new Date().getFullYear()} Empire Maps · Portal de Consultoria Estratégica</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Empire Maps <noreply@empiremaps.com.br>',
          to: [email],
          subject: 'Bem-vindo ao Empire Maps — Seu acesso está pronto',
          html: htmlContent,
        }),
      }).catch((e) => console.warn('Email send failed (non-fatal):', e))
    }

    return new Response(
      JSON.stringify({ success: true, user_id: userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('create-user error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
