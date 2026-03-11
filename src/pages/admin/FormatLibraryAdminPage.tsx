import { useState, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Library, Archive, Edit2, Trash2, Upload } from 'lucide-react'
import { useAllContentFormats, useCreateFormat, useUpdateFormat } from '@/hooks/useContentFormats'
import { supabase } from '@/integrations/supabase/client'
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
  examples: z.array(z.object({ url: z.string(), label: z.string() })),
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
  const [thumbnailUrl, setThumbnailUrl] = useState(format?.thumbnail_url ?? '')
  const [uploading, setUploading] = useState(false)

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Imagem deve ter no máximo 2MB.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop()
      const path = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('format-thumbnails').upload(path, file)
      if (upErr) throw upErr
      const { data: urlData } = supabase.storage.from('format-thumbnails').getPublicUrl(path)
      setThumbnailUrl(urlData.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const defaultTips = format?.tips?.map((t) => ({ value: t })) ?? [{ value: '' }]
  const rawExamples = format?.examples
  const defaultExamples: { url: string; label: string }[] =
    Array.isArray(rawExamples)
      ? (rawExamples as { url: string; label: string }[]).filter((e) => e?.url)
      : [{ url: '', label: '' }]

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormatFormData>({
      resolver: zodResolver(formatSchema),
      defaultValues: {
        name: format?.name ?? '',
        platforms: format?.platforms ?? [],
        description: format?.description ?? '',
        how_to: format?.how_to ?? '',
        tips: defaultTips,
        examples: defaultExamples.length ? defaultExamples : [{ url: '', label: '' }],
        tags: format?.tags?.join(', ') ?? '',
        status: format?.status ?? 'active',
      },
    })

  const { fields: tipFields, append: appendTip, remove: removeTip } = useFieldArray({
    control,
    name: 'tips',
  })

  const { fields: exampleFields, append: appendExample, remove: removeExample } = useFieldArray({
    control,
    name: 'examples',
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
      const examples = data.examples.filter((e) => e.url.trim())
      const payload = {
        name: data.name,
        platforms: data.platforms,
        description: data.description ?? null,
        how_to: data.how_to ?? null,
        tips,
        examples: examples.length ? examples : null,
        tags,
        status: data.status,
        thumbnail_url: thumbnailUrl || null,
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
      <div className="bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-lg w-full max-w-2xl p-6 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-empire-ink">
            {format ? 'Editar Formato' : 'Novo Formato'}
          </h2>
          <button onClick={onClose} className="text-empire-steel/50 hover:text-empire-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="text-empire-danger text-sm bg-empire-danger/10 border border-empire-danger/20 rounded-sm px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Nome *</label>
            <input
              {...register('name')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Ex: Carrossel informativo"
            />
            {errors.name && <p className="text-empire-danger text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-2">Plataformas *</label>
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
                      : 'bg-empire-mist border-empire-ghost text-empire-steel/60 hover:text-empire-ink'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            {errors.platforms && <p className="text-empire-danger text-xs mt-1">{errors.platforms.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Thumbnail</label>
            <div className="flex items-center gap-4">
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="Thumbnail" className="w-16 h-16 object-cover border border-empire-ghost" />
              )}
              <label className={cn(
                'flex items-center gap-2 cursor-pointer text-xs border px-3 py-2 transition-colors',
                uploading ? 'opacity-50 cursor-wait' : 'border-empire-ghost text-empire-steel/60 hover:text-empire-gold hover:border-empire-gold/40'
              )}>
                <Upload className="w-3.5 h-3.5" />
                {uploading ? 'Enviando...' : 'Upload de imagem'}

                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
              placeholder="O que é este formato?"
            />
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Como fazer (passo a passo)</label>
            <textarea
              {...register('how_to')}
              rows={5}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
              placeholder="1. Primeiro passo&#10;2. Segundo passo..."
            />
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-2">Dicas</label>
            <div className="space-y-2">
              {tipFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`tips.${index}.value`)}
                    className="flex-1 bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                    placeholder={`Dica ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeTip(index)}
                    className="text-empire-steel/50 hover:text-empire-danger transition-colors"
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
            <label className="block text-sm text-empire-steel/80 mb-2">Exemplos e Referências</label>
            <div className="space-y-2">
              {exampleFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`examples.${index}.label`)}
                    className="w-32 bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                    placeholder="Nome"
                  />
                  <input
                    {...register(`examples.${index}.url`)}
                    className="flex-1 bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="text-empire-steel/50 hover:text-empire-danger transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendExample({ url: '', label: '' })}
                className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar exemplo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Tags (separadas por vírgula)</label>
            <input
              {...register('tags')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="educativo, reels, viral"
            />
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
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
    <div className="bg-empire-surface rounded-lg border border-empire-ghost p-5 card-hover group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-empire-ink">{format.name}</h3>
        <span className={cn(
          'text-xs px-2 py-0.5 border',
          format.status === 'active'
            ? 'badge-success'
            : 'bg-empire-mist border-empire-ghost text-empire-steel/50'
        )}>
          {format.status === 'active' ? 'Ativo' : 'Arquivado'}
        </span>
      </div>

      {format.description && (
        <p className="text-empire-steel/60 text-sm mb-3 line-clamp-2">{format.description}</p>
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
            <span key={t} className="text-xs bg-empire-mist text-empire-steel/50 px-2 py-0.5">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-empire-ghost">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-empire-steel/60 hover:text-empire-gold transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Editar
        </button>
        <button
          onClick={onArchive}
          className="flex items-center gap-1.5 text-xs text-empire-steel/60 hover:text-empire-danger transition-colors"
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
          <div className="section-label">Admin</div>
          <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Banco de Formatos</h1>
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
            <div key={i} className="h-48 bg-empire-bone border border-empire-ghost animate-pulse" />
          ))}
        </div>
      ) : formats?.length === 0 ? (
        <div className="py-20 text-center">
          <Library className="w-10 h-10 text-empire-ink/20 mx-auto mb-3" />
          <p className="text-empire-steel/50">Nenhum formato criado ainda.</p>
          <p className="text-empire-steel/50 text-sm mt-1">Clique em "Novo Formato" para começar.</p>
        </div>
      ) : (
        <>
          {activeFormats.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-empire-steel/80 mb-4">
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
              <h2 className="text-sm font-medium text-empire-steel/50 mb-4">
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
