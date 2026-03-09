import { useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useDiagnostic, useSaveDiagnostic, useSubmitDiagnostic } from '@/hooks/useDiagnostic'
import { DdiSelector } from '@/components/ui/DdiSelector'
import { formatDateTime } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type Json = Database['public']['Tables']['client_diagnostics']['Row']['social_links']

const schema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  whatsapp_ddi: z.string().min(1, 'DDI obrigatório'),
  whatsapp_ddd: z.string().regex(/^\d{2,3}$/, 'DDD inválido'),
  whatsapp_num: z.string().min(8, 'Número inválido').max(9, 'Número inválido'),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  tiktok: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  pinterest: z.string().optional(),
  outros: z.string().optional(),
  objectives: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SOCIAL_FIELDS: {
  key: keyof Pick<FormData, 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'twitter' | 'facebook' | 'pinterest' | 'outros'>
  label: string
  placeholder: string
}[] = [
  { key: 'instagram', label: 'Instagram', placeholder: '@usuario' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/usuario' },
  { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@canal' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@usuario' },
  { key: 'twitter', label: 'Twitter / X', placeholder: '@usuario' },
  { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/pagina' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'pinterest.com/usuario' },
  { key: 'outros', label: 'Outros', placeholder: 'Link ou descrição' },
]

function parseSocialLinks(json: Json): Partial<Record<string, string>> {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {}
  return json as Record<string, string>
}

export default function DiagnosticPage() {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()

  const effectiveProfile = impersonatedClient ?? profile
  const clientId = effectiveProfile?.id ?? user?.id
  const canEdit = profile?.role === 'admin' || profile?.role === 'consultant'

  const { data: diagnostic, isLoading } = useDiagnostic(clientId)
  const saveMutation = useSaveDiagnostic(clientId)
  const submitMutation = useSubmitDiagnostic(clientId)

  const isLocked = diagnostic?.is_locked === true
  const readOnly = isLocked && !canEdit

  const socialLinks = parseSocialLinks(diagnostic?.social_links ?? null)

  const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        full_name: '',
        email: '',
        whatsapp_ddi: '+55',
        whatsapp_ddd: '',
        whatsapp_num: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        tiktok: '',
        twitter: '',
        facebook: '',
        pinterest: '',
        outros: '',
        objectives: '',
      },
    })

  useEffect(() => {
    if (diagnostic) {
      reset({
        full_name: diagnostic.full_name ?? '',
        email: diagnostic.email ?? '',
        whatsapp_ddi: diagnostic.whatsapp_ddi ?? '+55',
        whatsapp_ddd: diagnostic.whatsapp_ddd ?? '',
        whatsapp_num: diagnostic.whatsapp_num ?? '',
        instagram: socialLinks['instagram'] ?? '',
        linkedin: socialLinks['linkedin'] ?? '',
        youtube: socialLinks['youtube'] ?? '',
        tiktok: socialLinks['tiktok'] ?? '',
        twitter: socialLinks['twitter'] ?? '',
        facebook: socialLinks['facebook'] ?? '',
        pinterest: socialLinks['pinterest'] ?? '',
        outros: socialLinks['outros'] ?? '',
        objectives: diagnostic.objectives ?? '',
      })
    }
  }, [diagnostic, reset])

  const values = watch()
  const debouncedSave = useCallback(
    debounce(async (data: FormData) => {
      if (readOnly || !clientId) return
      const socialLinksData: Record<string, string> = {}
      for (const field of SOCIAL_FIELDS) {
        const val = data[field.key]
        if (val) socialLinksData[field.key] = val
      }
      await saveMutation.mutateAsync({
        full_name: data.full_name,
        email: data.email,
        whatsapp_ddi: data.whatsapp_ddi,
        whatsapp_ddd: data.whatsapp_ddd,
        whatsapp_num: data.whatsapp_num,
        social_links: socialLinksData,
        objectives: data.objectives ?? null,
      })
    }, 2000),
    [readOnly, clientId, saveMutation]
  )

  useEffect(() => {
    if (!readOnly && !isLoading) {
      debouncedSave(values)
    }
    return () => debouncedSave.cancel()
  }, [JSON.stringify(values), readOnly, isLoading])

  async function onSubmit(data: FormData) {
    const socialLinksData: Record<string, string> = {}
    for (const field of SOCIAL_FIELDS) {
      const val = data[field.key]
      if (val) socialLinksData[field.key] = val
    }
    await saveMutation.mutateAsync({
      full_name: data.full_name,
      email: data.email,
      whatsapp_ddi: data.whatsapp_ddi,
      whatsapp_ddd: data.whatsapp_ddd,
      whatsapp_num: data.whatsapp_num,
      social_links: socialLinksData,
      objectives: data.objectives ?? null,
    })
    await submitMutation.mutateAsync()
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-3xl">
        <div className="h-8 w-48 bg-empire-card animate-pulse" />
        <div className="h-4 w-72 bg-empire-card animate-pulse" />
        <div className="h-px bg-empire-border mt-6" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-empire-card animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Fase 1</p>
        <h1 className="font-display text-3xl font-semibold text-empire-text">Diagnóstico</h1>
        <p className="text-empire-text/60 mt-1 text-sm">
          Preencha as informações abaixo para que possamos entender seu negócio.
        </p>

        {isLocked && diagnostic?.submitted_at && (
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-400 text-sm">
              Formulário enviado em {formatDateTime(diagnostic.submitted_at)}.
              {canEdit && ' (Você pode editar como admin/consultor.)'}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Dados pessoais */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-empire-text/70 uppercase tracking-wider border-b border-empire-border pb-2">
            Dados Pessoais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Nome completo *</label>
              <input
                {...register('full_name')}
                readOnly={readOnly}
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors read-only:opacity-70 read-only:cursor-default"
                placeholder="Seu nome completo"
              />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">E-mail *</label>
              <input
                {...register('email')}
                type="email"
                readOnly={readOnly}
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors read-only:opacity-70 read-only:cursor-default"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">WhatsApp *</label>
            <div className="flex gap-2">
              <Controller
                name="whatsapp_ddi"
                control={control}
                render={({ field }) => (
                  <DdiSelector
                    value={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
              <input
                {...register('whatsapp_ddd')}
                readOnly={readOnly}
                className="w-20 bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors read-only:opacity-70 read-only:cursor-default"
                placeholder="DDD"
                maxLength={3}
              />
              <input
                {...register('whatsapp_num')}
                readOnly={readOnly}
                className="flex-1 bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors read-only:opacity-70 read-only:cursor-default"
                placeholder="00000-0000"
              />
            </div>
            {(errors.whatsapp_ddd || errors.whatsapp_num) && (
              <p className="text-red-400 text-xs mt-1">
                {errors.whatsapp_ddd?.message ?? errors.whatsapp_num?.message}
              </p>
            )}
          </div>
        </section>

        {/* Redes sociais */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-empire-text/70 uppercase tracking-wider border-b border-empire-border pb-2">
            Redes Sociais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-empire-text/70 mb-1.5">{field.label}</label>
                <input
                  {...register(field.key)}
                  readOnly={readOnly}
                  className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors read-only:opacity-70 read-only:cursor-default"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Objetivos */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-empire-text/70 uppercase tracking-wider border-b border-empire-border pb-2">
            Objetivos
          </h2>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">
              O que você quer alcançar com sua presença digital?
            </label>
            <textarea
              {...register('objectives')}
              readOnly={readOnly}
              rows={5}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none read-only:opacity-70 read-only:cursor-default"
              placeholder="Descreva seus objetivos, metas e expectativas..."
            />
          </div>
        </section>

        {/* Auto-save indicator */}
        {!readOnly && (
          <div className="flex items-center gap-2 text-xs text-empire-text/40">
            {saveMutation.isPending && (
              <>
                <div className="w-3 h-3 border border-empire-text/30 border-t-empire-gold/50 rounded-full animate-spin" />
                Salvando automaticamente...
              </>
            )}
            {saveMutation.isSuccess && !saveMutation.isPending && (
              <span className="text-emerald-400/70">Salvo automaticamente</span>
            )}
          </div>
        )}

        {/* Submit */}
        {!readOnly && (
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || submitMutation.isPending}
              className="btn-premium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isSubmitting || submitMutation.isPending ? 'Enviando...' : 'Enviar Diagnóstico'}
            </button>
            <p className="text-empire-text/40 text-xs mt-2">
              Após enviar, o formulário ficará bloqueado para edição.
            </p>
          </div>
        )}

        {readOnly && canEdit && (
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Salvar alterações (Admin/Consultor)
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T & { cancel: () => void }
  debounced.cancel = () => { if (timer) clearTimeout(timer) }
  return debounced
}
