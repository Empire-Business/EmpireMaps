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
    <div className="min-h-screen bg-empire-bg flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo / Título */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold text-gold-gradient mb-2">
            Empire Maps
          </h1>
          <p className="text-empire-text/60 text-sm tracking-widest uppercase">
            Portal de Consultoria
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-empire-card border border-empire-border p-8">
          <h2 className="text-xl font-medium text-empire-text mb-6">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">E-mail</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full bg-empire-surface border border-empire-border text-empire-text placeholder:text-empire-text/30 px-4 py-3 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Senha</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-empire-surface border border-empire-border text-empire-text placeholder:text-empire-text/30 px-4 py-3 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-premium justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/esqueci-senha"
              className="text-empire-gold/70 text-sm hover:text-empire-gold transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
