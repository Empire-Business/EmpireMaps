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
    <div className="min-h-screen bg-empire-bone flex items-center justify-center px-4">
      <div className="grid-pattern absolute inset-0 opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold text-empire-ink tracking-[0.22em] uppercase mb-2 flex items-center justify-center gap-2">
            EMPIRE MAPS
            <span className="w-[5px] h-[5px] rounded-full bg-empire-gold inline-block" />
          </h1>
          <p className="font-mono text-empire-steel text-xs tracking-[0.18em] uppercase">
            Recuperar Senha
          </p>
        </div>

        <div className="bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-sm p-8">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-empire-success mb-4">
                E-mail enviado! Verifique sua caixa de entrada.
              </p>
              <Link to="/login" className="text-empire-gold text-sm hover:text-empire-gold/80 transition-colors">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-medium text-empire-ink mb-2">Recuperar senha</h2>
              <p className="text-empire-steel text-sm mb-6">
                Informe seu e-mail para receber as instruções de recuperação.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-empire-ink tracking-[0.02em] mb-1.5">E-mail</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full bg-empire-mist border-[1.5px] border-empire-ghost rounded-sm text-empire-ink placeholder:text-empire-platinum px-4 py-2.5 text-base focus:outline-none focus:bg-empire-surface focus:border-empire focus:shadow-[0_0_0_3px_rgba(13,24,41,0.08)] transition-all"
                  />
                  {errors.email && (
                    <p className="text-empire-danger text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary justify-center disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-empire-gold text-sm hover:text-empire-gold/80 transition-colors">
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
