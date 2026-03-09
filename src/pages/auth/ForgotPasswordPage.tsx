import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    await resetPassword(data.email)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-empire-bg flex items-center justify-center px-4">
      <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold text-gold-gradient mb-2">
            Empire Maps
          </h1>
          <p className="text-empire-text/60 text-sm tracking-widest uppercase">
            Recuperar Senha
          </p>
        </div>

        <div className="bg-empire-card border border-empire-border p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-emerald-400 mb-4">
                E-mail enviado! Verifique sua caixa de entrada.
              </p>
              <Link to="/login" className="text-empire-gold text-sm hover:underline">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-medium text-empire-text mb-2">Recuperar senha</h2>
              <p className="text-empire-text/60 text-sm mb-6">
                Informe seu e-mail para receber as instruções de recuperação.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm text-empire-text/70 mb-1.5">E-mail</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full bg-empire-surface border border-empire-border text-empire-text placeholder:text-empire-text/30 px-4 py-3 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-premium justify-center disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-empire-gold/70 text-sm hover:text-empire-gold transition-colors">
                  Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
