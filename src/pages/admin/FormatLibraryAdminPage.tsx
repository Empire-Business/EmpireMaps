import { useState, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Library, Archive, Edit2, Trash2 } from 'lucide-react'
import { useAllContentFormats, useCreateFormat, useUpdateFormat } from '@/hooks/useContentFormats'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type ContentFormat = Database['public']['Tables']['content_formats']['Row']

const PLATFORMS = [
  'Instagram',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'Twitter/X',
  'Facebook',
  'Pinterest',
  'Blog',
  'Email',
]

const formatSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  platforms: z.array(z.string()).min(1, 'Selecione pelo menos uma plataforma'),
  description: z.string().optional(),
  how_to: z.string().optional(),
  tips: z.array(z.object({ value: z.string() })),
  tags: z.string().optional(),
  status: z.enum(['active', 'archived'] as const),
})
type FormatFormData = z.infer<typeof formatSchema>

interface FormatModalProps {
  format?: ContentFormat
  onClose: () => void
}

function FormatModal({ format, onClose }: FormatModalProps) {
  const createFormat = useCreateFormat()
  const updateFormat = useUpdateFormat()
  const [error, setError] = useState<string | null>(null)

  const defaultTips = format?.tips?.map((t) => ({ value: t })) ?? [{ value: '' }]

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormatFormData>({
      resolver: zodResolver(formatSchema),
      defaultValues: {
        name: format?.name ?? '',
        platforms: format?.platforms ?? [],
        description: format?.description ?? '',
        how_to: format?.how_to ?? '',
        tips: defaultTips,
        tags: format?.tags?.join(', ') ?? '',
        status: format?.status ?? 'active',
      },
    })

  const { fields: tipFields, append: appendTip, remove: removeTip } = useFieldArray({
    control,
    name: 'tips',
  })

  const selectedPlatforms = watch('platforms')

  function togglePlatform(platform: string) {
    const current = selectedPlatforms ?? []
    if (current.includes(platform)) {
      setValue('platforms', current.filter((p) => p !== platform))
    } else {
      setValue('platforms', [...current, platform])
    }
  }

  async function onSubmit(data: FormatFormData) {
    setError(null)
    try {
      const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      const tips = data.tips.map((t) => t.value).filter(Boolean)
      const payload = {
        name: data.name,
        platforms: data.platforms,
        description: data.description ?? null,
        how_to: data.how_to ?? null,
        tips,
        tags,
        status: data.status,
      }
      if (format) {
        await updateFormat.mutateAsync({ id: format.id, data: payload })
      } else {
        await createFormat.mutateAsync(payload)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar formato')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-empire-card border border-empire-border w-full max-w-2xl p-6 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-empire-text">
            {format ? 'Editar Formato' : 'Novo Formato'}
          </h2>
          <button onClick={onClose} className="text-empire-text/40 hover:text-empire-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Nome *</label>
            <input
              {...register('name')}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Ex: Carrossel informativo"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-2">Plataformas *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    'px-3 py-1.5 text-xs border transition-colors',
                    selectedPlatforms?.includes(p)
                      ? 'bg-empire-gold/20 border-empire-gold/50 text-empire-gold'
                      : 'bg-empire-surface border-empire-border text-empire-text/60 hover:text-empire-text'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            {errors.platforms && <p className="text-red-400 text-xs mt-1">{errors.platforms.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
              placeholder="O que é este formato?"
            />
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Como fazer (passo a passo)</label>
            <textarea
              {...register('how_to')}
              rows={5}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
              placeholder="1. Primeiro passo&#10;2. Segundo passo..."
            />
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-2">Dicas</label>
            <div className="space-y-2">
              {tipFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`tips.${index}.value`)}
                    className="flex-1 bg-empire-surface border border-empire-border text-empire-text px-4 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                    placeholder={`Dica ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeTip(index)}
                    className="text-empire-text/30 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendTip({ value: '' })}
                className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar dica
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Tags (separadas por vírgula)</label>
            <input
              {...register('tags')}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="educativo, reels, viral"
            />
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              <option value="active">Ativo</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary justify-center">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-premium justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Format Card ----
interface FormatCardProps {
  format: ContentFormat
  onEdit: () => void
  onArchive: () => void
}

function FormatCard({ format, onEdit, onArchive }: FormatCardProps) {
  return (
    <div className="bg-empire-card border border-empire-border p-5 card-hover group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-empire-text">{format.name}</h3>
        <span className={cn(
          'text-xs px-2 py-0.5 border',
          format.status === 'active'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-empire-surface border-empire-border text-empire-text/40'
        )}>
          {format.status === 'active' ? 'Ativo' : 'Arquivado'}
        </span>
      </div>

      {format.description && (
        <p className="text-empire-text/60 text-sm mb-3 line-clamp-2">{format.description}</p>
      )}

      {format.platforms && format.platforms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {format.platforms.map((p) => (
            <span key={p} className="text-xs bg-empire-gold/10 text-empire-gold px-2 py-0.5">
              {p}
            </span>
          ))}
        </div>
      )}

      {format.tags && format.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {format.tags.map((t) => (
            <span key={t} className="text-xs bg-empire-surface text-empire-text/50 px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-empire-border">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-empire-text/60 hover:text-empire-gold transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Editar
        </button>
        <button
          onClick={onArchive}
          className="flex items-center gap-1.5 text-xs text-empire-text/60 hover:text-red-400 transition-colors"
        >
          {format.status === 'active' ? (
            <>
              <Archive className="w-3.5 h-3.5" />
              Arquivar
            </>
          ) : (
            <>
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ---- Main Page ----
export default function FormatLibraryAdminPage() {
  const { data: formats, isLoading } = useAllContentFormats()
  const updateFormat = useUpdateFormat()
  const [showModal, setShowModal] = useState(false)
  const [editingFormat, setEditingFormat] = useState<ContentFormat | null>(null)

  const activeFormats = useMemo(
    () => formats?.filter((f) => f.status === 'active') ?? [],
    [formats]
  )
  const archivedFormats = useMemo(
    () => formats?.filter((f) => f.status === 'archived') ?? [],
    [formats]
  )

  async function handleArchive(format: ContentFormat) {
    await updateFormat.mutateAsync({
      id: format.id,
      data: { status: format.status === 'active' ? 'archived' : 'active' },
    })
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Admin</p>
          <h1 className="font-display text-3xl font-semibold text-empire-text">Banco de Formatos</h1>
        </div>
        <button
          onClick={() => { setEditingFormat(null); setShowModal(true) }}
          className="btn-premium"
        >
          <Plus className="w-4 h-4" />
          Novo Formato
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-empire-card border border-empire-border animate-pulse" />
          ))}
        </div>
      ) : formats?.length === 0 ? (
        <div className="py-20 text-center">
          <Library className="w-10 h-10 text-empire-text/20 mx-auto mb-3" />
          <p className="text-empire-text/40">Nenhum formato criado ainda.</p>
          <p className="text-empire-text/30 text-sm mt-1">Clique em "Novo Formato" para começar.</p>
        </div>
      ) : (
        <>
          {activeFormats.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-empire-text/70 mb-4">
                Ativos ({activeFormats.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeFormats.map((format) => (
                  <FormatCard
                    key={format.id}
                    format={format}
                    onEdit={() => { setEditingFormat(format); setShowModal(true) }}
                    onArchive={() => handleArchive(format)}
                  />
                ))}
              </div>
            </div>
          )}

          {archivedFormats.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-empire-text/40 mb-4">
                Arquivados ({archivedFormats.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {archivedFormats.map((format) => (
                  <FormatCard
                    key={format.id}
                    format={format}
                    onEdit={() => { setEditingFormat(format); setShowModal(true) }}
                    onArchive={() => handleArchive(format)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <FormatModal
          format={editingFormat ?? undefined}
          onClose={() => { setShowModal(false); setEditingFormat(null) }}
        />
      )}
    </div>
  )
}
