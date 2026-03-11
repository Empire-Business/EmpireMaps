import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import type { UserRole } from '@/types'

const passwordSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})
type PasswordFormData = z.infer<typeof passwordSchema>

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  consultant: '/consultant/dashboard',
  client: '/client/dashboard',
}

type LoginTab = 'password' | 'otp'
type OtpStep = 'email' | 'code'

export default function LoginPage() {
  const { login, user, profile } = useAuth()
  const navigate = useNavigate()

  // Password tab
  const [tab, setTab] = useState<LoginTab>('password')
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // OTP tab
  const [otpStep, setOtpStep] = useState<OtpStep>('email')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(8).fill(''))
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const digitRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (user && profile) {
      navigate(ROLE_DASHBOARDS[profile.role], { replace: true })
    }
  }, [user, profile, navigate])

  async function onSubmitPassword(data: PasswordFormData) {
    setServerError(null)
    const { error } = await login(data.email, data.password)
    if (error) setServerError('E-mail ou senha incorretos.')
  }

  async function handleSendOtp() {
    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setServerError('Informe um e-mail válido.')
      return
    }
    setServerError(null)
    setOtpSending(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: otpEmail })
      if (error) throw error
      setOtpStep('code')
      setTimeout(() => digitRefs.current[0]?.focus(), 80)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao enviar código.')
    } finally {
      setOtpSending(false)
    }
  }

  function handleDigitInput(i: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...otpDigits]
    next[i] = char
    setOtpDigits(next)
    if (char && i < 7) digitRefs.current[i + 1]?.focus()
  }

  function handleDigitKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
      digitRefs.current[i - 1]?.focus()
    }
  }

  function handleDigitPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    const next = Array(8).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setOtpDigits(next)
    const focus = Math.min(pasted.length, 7)
    setTimeout(() => digitRefs.current[focus]?.focus(), 0)
  }

  async function handleVerifyOtp() {
    const token = otpDigits.join('')
    if (token.length < 8) {
      setServerError('Digite o código completo de 8 dígitos.')
      return
    }
    setServerError(null)
    setOtpVerifying(true)
    try {
      const { error } = await supabase.auth.verifyOtp({ email: otpEmail, token, type: 'email' })
      if (error) throw error
    } catch {
      setServerError('Código inválido ou expirado. Tente novamente.')
      setOtpDigits(Array(8).fill(''))
      setTimeout(() => digitRefs.current[0]?.focus(), 80)
    } finally {
      setOtpVerifying(false)
    }
  }

  function switchTab(t: LoginTab) {
    setTab(t)
    setServerError(null)
    setOtpStep('email')
    setOtpDigits(Array(8).fill(''))
  }

  const inputClass = 'w-full bg-empire-mist border-[1.5px] border-empire-ghost rounded-sm text-empire-ink placeholder:text-empire-platinum px-4 py-2.5 text-base focus:outline-none focus:bg-empire-surface focus:border-empire focus:shadow-[0_0_0_3px_rgba(13,24,41,0.08)] transition-all'

  return (
    <div className="min-h-screen bg-empire-bone flex items-center justify-center px-4">
      <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold text-empire-ink tracking-[0.22em] uppercase mb-2 flex items-center justify-center gap-2">
            EMPIRE MAPS
            <span className="w-[5px] h-[5px] rounded-full bg-empire-gold inline-block" />
          </h1>
          <p className="font-mono text-empire-steel text-xs tracking-[0.18em] uppercase">
            Portal de Consultoria
          </p>
        </div>

        <div className="bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-sm p-8">
          <h2 className="text-xl font-medium text-empire-ink mb-5">Entrar na sua conta</h2>

          {/* Tabs */}
          <div className="flex border-b border-empire-ghost mb-6">
            {(['password', 'otp'] as LoginTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`pb-2.5 px-1 mr-6 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-empire-gold text-empire-ink'
                    : 'border-transparent text-empire-steel/50 hover:text-empire-steel'
                }`}
              >
                {t === 'password' ? 'Senha' : 'Código OTP'}
              </button>
            ))}
          </div>

          {/* ── Password tab ── */}
          {tab === 'password' && (
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-empire-ink tracking-[0.02em] mb-1.5">E-mail</label>
                <input {...register('email')} type="email" autoComplete="email" placeholder="seu@email.com" className={inputClass} />
                {errors.email && <p className="text-empire-danger text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-empire-ink tracking-[0.02em] mb-1.5">Senha</label>
                <input {...register('password')} type="password" autoComplete="current-password" placeholder="••••••••" className={inputClass} />
                {errors.password && <p className="text-empire-danger text-xs mt-1">{errors.password.message}</p>}
              </div>
              {serverError && (
                <p className="text-empire-danger text-sm bg-empire-danger/10 border border-empire-danger/20 px-4 py-3">{serverError}</p>
              )}
              <button type="submit" disabled={isSubmitting} className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* ── OTP tab ── */}
          {tab === 'otp' && (
            <div className="space-y-5">

              {/* Step 1 — Email */}
              {otpStep === 'email' && (
                <>
                  <div>
                    <label className="block text-[13px] font-medium text-empire-ink tracking-[0.02em] mb-1.5">E-mail</label>
                    <input
                      type="email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      autoComplete="email"
                      placeholder="seu@email.com"
                      className={inputClass}
                    />
                  </div>
                  <p className="text-xs text-empire-steel/50">
                    Enviaremos um código de 8 dígitos para o seu e-mail.
                  </p>
                  {serverError && (
                    <p className="text-empire-danger text-sm bg-empire-danger/10 border border-empire-danger/20 px-4 py-3">{serverError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending}
                    className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpSending ? 'Enviando...' : 'Enviar código'}
                  </button>
                </>
              )}

              {/* Step 2 — Code */}
              {otpStep === 'code' && (
                <>
                  <div>
                    <p className="text-sm text-empire-steel/70 mb-0.5">
                      Código enviado para <span className="text-empire-ink font-medium">{otpEmail}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => { setOtpStep('email'); setServerError(null); setOtpDigits(Array(8).fill('')) }}
                      className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors"
                    >
                      Trocar e-mail
                    </button>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-empire-ink tracking-[0.02em] mb-3">
                      Código de 8 dígitos
                    </label>
                    <div className="flex gap-1.5 justify-between">
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { digitRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitInput(i, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(i, e)}
                          onPaste={i === 0 ? handleDigitPaste : undefined}
                          className="flex-1 h-12 text-center text-lg font-mono font-semibold bg-empire-mist border-[1.5px] border-empire-ghost rounded-sm text-empire-ink focus:outline-none focus:border-empire-gold focus:bg-empire-surface transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  {serverError && (
                    <p className="text-empire-danger text-sm bg-empire-danger/10 border border-empire-danger/20 px-4 py-3">{serverError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpVerifying || otpDigits.join('').length < 8}
                    className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpVerifying ? 'Verificando...' : 'Entrar com código'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpSending}
                      className="text-xs text-empire-steel/50 hover:text-empire-steel transition-colors disabled:opacity-50"
                    >
                      {otpSending ? 'Reenviando...' : 'Reenviar código'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/esqueci-senha" className="text-empire-gold text-sm hover:text-empire-gold/80 transition-colors">
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
