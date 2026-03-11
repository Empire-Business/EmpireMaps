import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type FormData = z.infer<typeof schema>

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  consultant: '/consultant/dashboard',
  client: '/client/dashboard',
}

export default function LoginPage() {
  const { login, user, profile } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (user && profile) {
      navigate(ROLE_DASHBOARDS[profile.role], { replace: true })
    }
  }, [user, profile, navigate])

  async function onSubmit(data: FormData) {
    setServerError(null)
    const { error } = await login(data.email, data.password)
    if (error) {
      setServerError('E-mail ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen bg-empire-bone flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo / Título */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold text-empire-ink tracking-[0.22em] uppercase mb-2 flex items-center justify-center gap-2">
            EMPIRE MAPS
            <span className="w-[5px] h-[5px] rounded-full bg-empire-gold inline-block" />
          </h1>
          <p className="font-mono text-empire-steel text-xs tracking-[0.18em] uppercase">
            Portal de Consultoria
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-sm p-8">
          <h2 className="text-xl font-medium text-empire-ink mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-empire-ink tracking-[0.02em] mb-1.5">E-mail</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full bg-empire-mist border-[1.5px] border-empire-ghost rounded-sm text-empire-ink placeholder:text-empire-platinum px-4 py-2.5 text-base focus:outline-none focus:bg-empire-surface focus:border-empire focus:shadow-[0_0_0_3px_rgba(13,24,41,0.08)] transition-all"
              />
              {errors.email && (
                <p className="text-empire-danger text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-empire-ink tracking-[0.02em] mb-1.5">Senha</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-empire-mist border-[1.5px] border-empire-ghost rounded-sm text-empire-ink placeholder:text-empire-platinum px-4 py-2.5 text-base focus:outline-none focus:bg-empire-surface focus:border-empire focus:shadow-[0_0_0_3px_rgba(13,24,41,0.08)] transition-all"
              />
              {errors.password && (
                <p className="text-empire-danger text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-empire-danger text-sm bg-empire-danger/10 border border-empire-danger/20 px-4 py-3">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/esqueci-senha"
              className="text-empire-gold text-sm hover:text-empire-gold/80 transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
