import { useState, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, X, GripVertical, Calendar, Sparkles, Loader2,
  Trash2, Paperclip, FileIcon, AlertTriangle, Upload,
  CheckCircle2, RotateCcw, Tag, Hash,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useEffectiveClientId } from '@/hooks/useEffectiveClientId'
import { useContentCards, useCreateCard, useUpdateCard, useDeleteCard } from '@/hooks/useContentCards'
import { useContentFormats } from '@/hooks/useContentFormats'
import { useCardAttachments, useUploadAttachment, useDeleteAttachment } from '@/hooks/useCardAttachments'
import { useSocialProfiles } from '@/hooks/useSocialProfiles'
import { ProductionMapUploader } from '@/components/deliverables/ProductionMapUploader'
import { supabase } from '@/integrations/supabase/client'
import { cn, formatDate } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type ContentCard = Database['public']['Tables']['content_cards']['Row']
type CardStatus = ContentCard['status']
type StageTag = ContentCard['stage_tag']
type AttachmentRow = Database['public']['Tables']['card_attachments']['Row']
type ContentCardInsert = Omit<Database['public']['Tables']['content_cards']['Insert'], 'client_id' | 'created_by'>

// Production map only shows these 3 columns
const PRODUCTION_COLUMNS: { id: CardStatus; label: string; color: string }[] = [
  { id: 'a_fazer', label: 'A Fazer', color: 'border-t-empire-steel/30' },
  { id: 'em_andamento', label: 'Em Andamento', color: 'border-t-empire-gold/60' },
  { id: 'aprovacao', label: 'Aprovação', color: 'border-t-empire-success/60' },
]

const CHANNEL_OPTIONS = [
  'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Twitter/X',
  'Facebook', 'Pinterest', 'Blog', 'Email', 'Outro',
]

const CHANNEL_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  LinkedIn: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
  YouTube: 'bg-red-500/10 text-red-400 border-red-500/20',
  TikTok: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Twitter/X': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Pinterest: 'bg-red-600/10 text-red-400 border-red-600/20',
  Blog: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Email: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Outro: 'bg-empire-mist text-empire-steel/50 border-empire-ghost',
}

const FORMAT_OPTIONS = [
  'Reels', 'Carrossel', 'Stories', 'Vídeo YouTube', 'Shorts',
  'Post Estático', 'Artigo Blog', 'Newsletter', 'TikTok', 'Outro',
]

const STAGE_TAG_LABELS: Record<StageTag, string> = {
  aguardando_roteiro: 'Aguardando Roteiro',
  roteiro_aprovado: 'Roteiro Aprovado',
  em_edicao: 'Em Edição',
  aprovado_final: 'Aprovado Final',
}

const STAGE_TAG_COLORS: Record<StageTag, string> = {
  aguardando_roteiro: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  roteiro_aprovado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  em_edicao: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  aprovado_final: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

// ---- Card Form Schema ----
const cardSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  channel: z.string().optional(),
  status: z.enum(['a_fazer', 'em_andamento', 'aprovacao', 'aprovado_final', 'agendado', 'publicado', 'arquivado'] as const),
  stage_tag: z.enum(['aguardando_roteiro', 'roteiro_aprovado', 'em_edicao', 'aprovado_final'] as const),
  production_date: z.string().optional(),
  publish_date: z.string().optional(),
  scriptwriter: z.string().optional(),
  editor_name: z.string().optional(),
  designer: z.string().optional(),
  poster_name: z.string().optional(),
  script_deadline: z.string().optional(),
  edit_deadline: z.string().optional(),
  source_file_url: z.string().optional(),
  final_format: z.string().optional(),
  destination_profiles: z.string().optional(),
  format_id: z.string().optional(),
  labels: z.string().optional(),
  publish_url: z.string().optional(),
  internal_notes: z.string().optional(),
})
type CardFormData = z.infer<typeof cardSchema>

interface ReuseSuggestion {
  format: string
  channel: string
  rationale: string
  adaptation_tips: string[]
}

interface ReuseResult {
  suggestions: ReuseSuggestion[]
  key_insight: string
}

// ---- Attachments Section ----
function CardAttachmentsSection({ cardId }: { cardId: string }) {
  const { data: attachments, isLoading } = useCardAttachments(cardId)
  const uploadMutation = useUploadAttachment(cardId)
  const deleteMutation = useDeleteAttachment(cardId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function formatBytes(bytes: number | null): string {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-empire-gold" />
          <h3 className="text-sm font-medium text-empire-steel/80">Entrega Final</h3>
          {attachments && attachments.length > 0 && (
            <span className="text-xs text-empire-steel/40">({attachments.length})</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex items-center gap-1 text-xs text-empire-gold/70 hover:text-empire-gold transition-colors disabled:opacity-50"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          Anexar arquivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadMutation.mutate(file)
            if (fileInputRef.current) fileInputRef.current.value = ''
          }}
        />
      </div>

      {isLoading && (
        <div className="text-xs text-empire-steel/40">Carregando arquivos...</div>
      )}

      {attachments && attachments.length > 0 && (
        <ul className="space-y-1.5">
          {attachments.map((att: AttachmentRow) => (
            <li key={att.id} className="flex items-center gap-2 bg-empire-mist border border-empire-ghost px-3 py-2">
              <FileIcon className="w-3.5 h-3.5 text-empire-steel/30 flex-shrink-0" />
              <a
                href={att.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-xs text-empire-steel/80 hover:text-empire-gold transition-colors truncate"
              >
                {att.file_name}
              </a>
              {att.file_size && (
                <span className="text-xs text-empire-steel/30 flex-shrink-0">{formatBytes(att.file_size)}</span>
              )}
              <button
                type="button"
                onClick={() => deleteMutation.mutate(att)}
                disabled={deleteMutation.isPending}
                className="text-empire-ink/20 hover:text-empire-danger transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && (!attachments || attachments.length === 0) && (
        <p className="text-xs text-empire-steel/30">Nenhum arquivo enviado.</p>
      )}
    </div>
  )
}

// ---- Card Modal ----
interface CardModalProps {
  card?: ContentCard
  defaultStatus?: CardStatus
  clientId: string
  canSeeInternalNotes: boolean
  canDelete: boolean
  onClose: () => void
}

function CardModal({ card, defaultStatus, clientId, canSeeInternalNotes, canDelete, onClose }: CardModalProps) {
  const createCard = useCreateCard(clientId)
  const updateCard = useUpdateCard()
  const deleteCard = useDeleteCard()
  const { data: formats } = useContentFormats()
  const { data: socialProfiles } = useSocialProfiles(clientId)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [reuseLoading, setReuseLoading] = useState(false)
  const [reuseResult, setReuseResult] = useState<ReuseResult | null>(null)
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>(card?.destination_profiles ?? [])

  async function handleSuggestReuse() {
    if (!card) return
    setReuseLoading(true)
    setReuseResult(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('suggest-content-reuse', {
        body: { client_id: clientId, card_id: card.id },
      })
      if (fnError) throw fnError
      setReuseResult(data as ReuseResult)
    } catch (err) {
      console.error('Reuse suggestion error:', err)
    } finally {
      setReuseLoading(false)
    }
  }

  async function handleDelete() {
    if (!card) return
    try {
      await deleteCard.mutateAsync(card.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir card')
    }
  }

  // Approval action: approve script or edit/design
  async function handleApproval() {
    if (!card) return
    const currentStage = card.stage_tag

    if (currentStage === 'aguardando_roteiro' || currentStage === 'roteiro_aprovado') {
      // Approving script → mark roteiro_aprovado and send back to 'a_fazer'
      await updateCard.mutateAsync({
        cardId: card.id,
        data: {
          stage_tag: 'roteiro_aprovado',
          status: 'a_fazer',
        },
      })
      toast.success('Roteiro aprovado! Card voltou para "A Fazer" para a etapa de Edição/Design.')
      onClose()
    } else if (currentStage === 'em_edicao') {
      // Approving edit/design → final approval
      await updateCard.mutateAsync({
        cardId: card.id,
        data: {
          stage_tag: 'aprovado_final',
          status: 'aprovado_final',
        },
      })
      toast.success('Aprovado Final! Conteúdo enviado para o Mapa de Distribuição.')
      onClose()
    }
  }

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: card?.title ?? '',
      description: card?.description ?? '',
      channel: card?.channel ?? '',
      format_id: card?.format_id ?? '',
      status: card?.status ?? defaultStatus ?? 'a_fazer',
      stage_tag: card?.stage_tag ?? 'aguardando_roteiro',
      production_date: card?.production_date ?? '',
      publish_date: card?.publish_date ?? '',
      scriptwriter: card?.scriptwriter ?? '',
      editor_name: card?.editor_name ?? '',
      designer: card?.designer ?? '',
      poster_name: card?.poster_name ?? '',
      script_deadline: card?.script_deadline ?? '',
      edit_deadline: card?.edit_deadline ?? '',
      source_file_url: card?.source_file_url ?? '',
      final_format: card?.final_format ?? '',
      destination_profiles: card?.destination_profiles?.join(', ') ?? '',
      labels: card?.labels?.join(', ') ?? '',
      publish_url: card?.publish_url ?? '',
      internal_notes: card?.internal_notes ?? '',
    },
  })

  watch('stage_tag')

  async function onSubmit(data: CardFormData) {
    setError(null)
    try {
      const labels = data.labels
        ? data.labels.split(',').map((l) => l.trim()).filter(Boolean)
        : null

      const destinationProfiles = selectedProfiles.length > 0 ? selectedProfiles : null

      const payload = {
        title: data.title,
        description: data.description || null,
        channel: data.channel || null,
        format_id: data.format_id || null,
        status: data.status,
        stage_tag: data.stage_tag,
        production_date: data.production_date || null,
        publish_date: data.publish_date || null,
        scriptwriter: data.scriptwriter || null,
        editor_name: data.editor_name || null,
        designer: data.designer || null,
        poster_name: data.poster_name || null,
        script_deadline: data.script_deadline || null,
        edit_deadline: data.edit_deadline || null,
        source_file_url: data.source_file_url || null,
        final_format: data.final_format || null,
        destination_profiles: destinationProfiles,
        labels,
        publish_url: data.publish_url || null,
        internal_notes: canSeeInternalNotes ? (data.internal_notes || null) : undefined,
      }

      if (card) {
        await updateCard.mutateAsync({ cardId: card.id, data: payload })
      } else {
        await createCard.mutateAsync(payload as ContentCardInsert)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar card')
    }
  }

  const isInApprovalColumn = card?.status === 'aprovacao'
  const canApproveScript = isInApprovalColumn && (card?.stage_tag === 'aguardando_roteiro' || card?.stage_tag === 'roteiro_aprovado')
  const canApproveEdit = isInApprovalColumn && card?.stage_tag === 'em_edicao'

  const approvalPhaseLabel = (() => {
    if (!card) return ''
    if (card.stage_tag === 'aguardando_roteiro') return 'Aprovar Roteiro'
    if (card.stage_tag === 'roteiro_aprovado') return 'Aprovar Roteiro'
    if (card.stage_tag === 'em_edicao') return 'Aprovar Edição/Design'
    return ''
  })()

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-lg w-full max-w-2xl p-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-empire-ink">
              {card ? 'Editar Card' : 'Novo Card'}
            </h2>
            {card?.content_id && (
              <span className="flex items-center gap-1 text-xs bg-empire-gold/10 text-empire-gold border border-empire-gold/20 px-2 py-0.5">
                <Hash className="w-3 h-3" />
                {card.content_id}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canDelete && card && !confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-empire-steel/30 hover:text-empire-danger transition-colors"
                title="Excluir card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="text-empire-steel/40 hover:text-empire-ink transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Tag Badge */}
        {card && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-3.5 h-3.5 text-empire-steel/40" />
            <span className={cn('text-xs px-2 py-0.5 border', STAGE_TAG_COLORS[card.stage_tag])}>
              {STAGE_TAG_LABELS[card.stage_tag]}
            </span>
          </div>
        )}

        {/* Approval Actions */}
        {(canApproveScript || canApproveEdit) && (
          <div className="mb-4 bg-empire-gold/5 border border-empire-gold/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-empire-gold" />
                <p className="text-sm text-empire-steel">
                  {canApproveScript
                    ? 'Este card está aguardando aprovação do Roteiro.'
                    : 'Este card está aguardando aprovação da Edição/Design.'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={handleApproval}
                className="btn-premium text-sm flex items-center gap-1.5"
              >
                {canApproveScript ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    {approvalPhaseLabel}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {approvalPhaseLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 px-4 py-3 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-empire-danger flex-shrink-0" />
              <p className="text-empire-danger text-sm font-medium">Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="btn-secondary text-sm flex-1 justify-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteCard.isPending}
                className="flex-1 btn-danger justify-center disabled:opacity-50"
              >
                {deleteCard.isPending ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-empire-danger text-sm bg-empire-danger/10 border border-empire-danger/20 rounded-sm px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Título *</label>
            <input
              {...register('title')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Título do conteúdo"
            />
            {errors.title && <p className="text-empire-danger text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Conteúdo / Briefing (was "Descrição") */}
          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">
              Conteúdo / Briefing
              <span className="text-xs text-empire-steel/40 ml-1">(roteiro, minutagem, headline, referências)</span>
            </label>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
              placeholder="Roteiro completo, minutagem dos cortes, headline para edição, referências criativas..."
            />
          </div>

          {/* Canal + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">Canal</label>
              <select
                {...register('channel')}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                <option value="">Selecione...</option>
                {CHANNEL_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">Etapa</label>
              <select
                {...register('status')}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                {PRODUCTION_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag de Etapa + Formato Final */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">Tag de Etapa</label>
              <select
                {...register('stage_tag')}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                <option value="aguardando_roteiro">Aguardando Roteiro</option>
                <option value="roteiro_aprovado">Roteiro Aprovado</option>
                <option value="em_edicao">Em Edição</option>
                <option value="aprovado_final">Aprovado Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">Formato Final</label>
              <select
                {...register('final_format')}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                <option value="">Selecione...</option>
                {FORMAT_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Formato da biblioteca */}
          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Formato (Biblioteca)</label>
            <select
              {...register('format_id')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              <option value="">Selecione um formato...</option>
              {formats?.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Responsáveis separados */}
          <div className="border-t border-empire-ghost pt-4">
            <h3 className="text-sm font-medium text-empire-steel/80 mb-3">Responsáveis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Roteirista</label>
                <input
                  {...register('scriptwriter')}
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                  placeholder="Nome do roteirista"
                />
              </div>
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Editor</label>
                <input
                  {...register('editor_name')}
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                  placeholder="Nome do editor"
                />
              </div>
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Designer</label>
                <input
                  {...register('designer')}
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                  placeholder="Nome do designer"
                />
              </div>
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Responsável Postagem</label>
                <input
                  {...register('poster_name')}
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
          </div>

          {/* Prazos */}
          <div className="border-t border-empire-ghost pt-4">
            <h3 className="text-sm font-medium text-empire-steel/80 mb-3">Prazos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Prazo — Roteiro</label>
                <input
                  {...register('script_deadline')}
                  type="date"
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Prazo — Edição/Design</label>
                <input
                  {...register('edit_deadline')}
                  type="date"
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Data de Produção</label>
                <input
                  {...register('production_date')}
                  type="date"
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-empire-steel/50 mb-1">Data de Publicação</label>
                <input
                  {...register('publish_date')}
                  type="date"
                  className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Arquivo de Origem + Perfis de Destino */}
          <div className="border-t border-empire-ghost pt-4 space-y-4">
            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">Arquivo de Origem</label>
              <input
                {...register('source_file_url')}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                placeholder="Link para o material base (vídeo bruto, gravação, referência)"
              />
            </div>

            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">Perfis de Destino</label>
              {socialProfiles && socialProfiles.length > 0 ? (
                <div className="border border-empire-ghost bg-empire-mist p-3 space-y-2 max-h-40 overflow-y-auto">
                  {socialProfiles.map((p) => {
                    const key = `${p.platform} · @${p.handle}`
                    const checked = selectedProfiles.includes(key)
                    return (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? selectedProfiles.filter((x) => x !== key)
                              : [...selectedProfiles, key]
                            setSelectedProfiles(next)
                            setValue('destination_profiles', next.join(', '))
                          }}
                          className="accent-empire-gold w-3.5 h-3.5"
                        />
                        <span className="text-sm text-empire-ink/80 group-hover:text-empire-ink transition-colors">
                          <span className="font-mono text-xs text-empire-steel/50 mr-1">{p.platform}</span>
                          @{p.handle}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    {...register('destination_profiles')}
                    className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                    placeholder="@perfil1, @perfil2 (separados por vírgula)"
                  />
                  <p className="text-xs text-empire-steel/40">
                    Cadastre perfis em <span className="text-empire-gold/70">Perfis Sociais</span> para seleção rápida.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">Labels (separadas por vírgula)</label>
              <input
                {...register('labels')}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
                placeholder="educativo, semanal, trending"
              />
            </div>
          </div>

          {/* Notas internas */}
          {canSeeInternalNotes && (
            <div>
              <label className="block text-sm text-empire-steel/80 mb-1.5">
                Notas internas
                <span className="ml-1 text-xs text-empire-gold/60">(Admin/Consultor)</span>
              </label>
              <textarea
                {...register('internal_notes')}
                rows={3}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
                placeholder="Observações internas..."
              />
            </div>
          )}

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

        {/* Entrega Final (was "Anexos") — only for existing cards */}
        {card && (
          <div className="mt-6 pt-6 border-t border-empire-ghost">
            <CardAttachmentsSection cardId={card.id} />
          </div>
        )}

        {/* Reuse suggestions — only for existing cards */}
        {card && (
          <div className="mt-6 pt-6 border-t border-empire-ghost">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-empire-steel/80">Sugestões de Reaproveitamento</h3>
              <button
                type="button"
                onClick={handleSuggestReuse}
                disabled={reuseLoading}
                className="flex items-center gap-1.5 text-xs text-empire-gold hover:text-empire-gold transition-colors disabled:opacity-50"
              >
                {reuseLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {reuseLoading ? 'Analisando...' : 'Sugerir com IA'}
              </button>
            </div>

            {reuseResult && (
              <div className="space-y-3">
                {reuseResult.key_insight && (
                  <p className="text-xs text-empire-gold/80 italic bg-empire-gold/5 border border-empire-gold/15 px-3 py-2">
                    {reuseResult.key_insight}
                  </p>
                )}
                {reuseResult.suggestions.map((s, i) => (
                  <div key={i} className="bg-empire-mist border border-empire-ghost p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-empire-ink">{s.format}</span>
                      <span className="text-xs text-empire-steel/40">→</span>
                      <span className="text-xs text-empire-gold/80">{s.channel}</span>
                    </div>
                    <p className="text-xs text-empire-steel/60">{s.rationale}</p>
                    {s.adaptation_tips && s.adaptation_tips.length > 0 && (
                      <ul className="space-y-0.5">
                        {s.adaptation_tips.map((tip, j) => (
                          <li key={j} className="text-xs text-empire-steel/50 flex gap-1.5">
                            <span className="text-empire-gold/50 flex-shrink-0">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Kanban Card Component ----
interface KanbanCardProps {
  card: ContentCard
  onClick: () => void
  isDragging?: boolean
}

function KanbanCard({ card, onClick, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const channelClass = card.channel
    ? (CHANNEL_COLORS[card.channel] ?? CHANNEL_COLORS['Outro'])
    : CHANNEL_COLORS['Outro']

  const stageClass = STAGE_TAG_COLORS[card.stage_tag]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-empire-bone border border-empire-ghost p-3 cursor-pointer group hover:border-empire-gold/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 text-empire-ink/20 hover:text-empire-steel/50 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          {/* Content ID */}
          {card.content_id && (
            <span className="text-[10px] text-empire-gold/60 font-mono mb-0.5 block">
              {card.content_id}
            </span>
          )}

          <p className="text-empire-ink text-sm font-medium leading-snug line-clamp-2">
            {card.title}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Stage Tag */}
            <span className={cn('text-[10px] px-1.5 py-0.5 border', stageClass)}>
              {STAGE_TAG_LABELS[card.stage_tag]}
            </span>

            {card.channel && (
              <span className={cn('text-[10px] px-1.5 py-0.5 border', channelClass)}>
                {card.channel}
              </span>
            )}

            {card.final_format && (
              <span className="text-[10px] text-empire-steel/40 bg-empire-mist px-1.5 py-0.5">
                {card.final_format}
              </span>
            )}
          </div>

          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {card.labels.map((label) => (
                <span key={label} className="text-[10px] text-empire-steel/40 bg-empire-mist px-1.5 py-0.5">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Deadlines */}
          {(card.script_deadline || card.edit_deadline) && (
            <div className="flex items-center gap-1 mt-2">
              <Calendar className="w-3 h-3 text-empire-steel/30" />
              <span className="text-empire-steel/40 text-[10px]">
                {card.stage_tag === 'aguardando_roteiro' && card.script_deadline
                  ? `Roteiro: ${formatDate(card.script_deadline)}`
                  : card.edit_deadline
                    ? `Edição: ${formatDate(card.edit_deadline)}`
                    : card.script_deadline
                      ? `Roteiro: ${formatDate(card.script_deadline)}`
                      : ''
                }
              </span>
            </div>
          )}

          {/* Responsible for current phase */}
          {(card.scriptwriter || card.editor_name || card.designer) && (
            <div className="mt-1.5 text-[10px] text-empire-ink/35">
              {card.stage_tag === 'aguardando_roteiro' && card.scriptwriter
                ? `Roteirista: ${card.scriptwriter}`
                : (card.stage_tag === 'roteiro_aprovado' || card.stage_tag === 'em_edicao')
                  ? card.editor_name
                    ? `Editor: ${card.editor_name}`
                    : card.designer
                      ? `Designer: ${card.designer}`
                      : ''
                  : ''
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Kanban Column ----
interface KanbanColumnProps {
  column: { id: CardStatus; label: string; color: string }
  cards: ContentCard[]
  activeId: string | null
  onAddCard: () => void
  onCardClick: (card: ContentCard) => void
}

function KanbanColumn({ column, cards, activeId, onAddCard, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-empire-bone border border-empire-ghost border-t-2 flex flex-col min-h-96 transition-colors',
        column.color,
        isOver && 'border-empire-gold/50 bg-empire-gold/5'
      )}
    >
      <div className="px-3 py-3 flex items-center justify-between border-b border-empire-ghost">
        <div className="flex items-center gap-2">
          <span className="text-empire-ink text-sm font-medium">{column.label}</span>
          <span className="text-xs text-empire-steel/40 bg-empire-mist px-1.5 py-0.5">
            {cards.length}
          </span>
        </div>
        <button
          onClick={onAddCard}
          className="text-empire-steel/30 hover:text-empire-gold transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              isDragging={activeId === card.id}
              onClick={() => onCardClick(card)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

// ---- Main Page ----
export default function ProductionMapPage() {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()
  const clientId = useEffectiveClientId()

  const canSeeInternalNotes = profile?.role === 'admin' || profile?.role === 'consultant'

  // Admin/consultant sem cliente selecionado → mostrar aviso
  const isStaff = profile?.role === 'admin' || profile?.role === 'consultant'
  if (isStaff && !impersonatedClient && !profile?.parent_client_id) {
    return (
      <div className="p-8 space-y-4">
        <div className="section-label">Fase 3</div>
        <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Mapa de Produção</h1>
        <div className="bg-empire-bone border border-empire-ghost px-6 py-10 text-center max-w-md">
          <p className="text-empire-steel/70 text-sm mb-1">Nenhum cliente selecionado.</p>
          <p className="text-empire-steel/40 text-xs">
            Acesse o painel de um cliente via <span className="text-empire-gold/70">Gestão de Usuários</span> para visualizar o mapa de produção.
          </p>
        </div>
      </div>
    )
  }

  const { data: cards, isLoading } = useContentCards(clientId)
  const updateCard = useUpdateCard()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<ContentCard | null>(null)
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<CardStatus>('a_fazer')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // Only show cards in production columns (not approved_final, agendado, publicado)
  const productionStatuses: CardStatus[] = ['a_fazer', 'em_andamento', 'aprovacao']

  function getColumnCards(status: CardStatus): ContentCard[] {
    return (cards ?? []).filter((c) => c.status === status)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    let targetColumnId = PRODUCTION_COLUMNS.find((col) => col.id === over.id)?.id

    if (!targetColumnId) {
      const targetCard = cards?.find((c) => c.id === over.id)
      if (targetCard && productionStatuses.includes(targetCard.status)) {
        targetColumnId = targetCard.status
      }
    }

    if (targetColumnId) {
      const draggedCard = cards?.find((c) => c.id === active.id)
      if (draggedCard && draggedCard.status !== targetColumnId) {
        // When moving to em_andamento after roteiro_aprovado, auto-set stage to em_edicao
        const updates: Record<string, unknown> = { status: targetColumnId }
        if (targetColumnId === 'em_andamento' && draggedCard.stage_tag === 'roteiro_aprovado') {
          updates.stage_tag = 'em_edicao'
        }
        await updateCard.mutateAsync({
          cardId: active.id as string,
          data: updates,
        })
      }
    }
  }

  const activeCard = cards?.find((c) => c.id === activeId) ?? null

  function openNewCard(status: CardStatus) {
    setEditingCard(null)
    setDefaultColumnStatus(status)
    setShowModal(true)
  }

  function openEditCard(card: ContentCard) {
    setEditingCard(card)
    setShowModal(true)
  }

  const canDelete = canSeeInternalNotes || editingCard?.created_by === user?.id

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="section-label">Fase 3</div>
          <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Mapa de Produção</h1>
          <p className="text-empire-steel/60 mt-1 text-sm">
            Gerencie seus conteúdos por etapa de produção. O fluxo de aprovação é em duas etapas: Roteiro e Edição/Design.
          </p>
        </div>
        <button
          onClick={() => openNewCard('a_fazer')}
          className="btn-premium"
        >
          <Plus className="w-4 h-4" />
          Novo Card
        </button>
      </div>

      {/* Flow indicator */}
      <div className="bg-empire-bone border border-empire-ghost px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-empire-steel/50">
          <span className="text-empire-steel/80 font-medium">Fluxo:</span>
          <span>A Fazer</span>
          <span>→</span>
          <span>Em Andamento</span>
          <span>→</span>
          <span>Aprovação</span>
          <span className="text-empire-gold">→ Roteiro Aprovado → volta para A Fazer →</span>
          <span>Em Andamento</span>
          <span>→</span>
          <span>Aprovação</span>
          <span className="text-emerald-400">→ Aprovado Final (Distribuição)</span>
        </div>
      </div>

      {/* Importer for admin/consultant */}
      {clientId && canSeeInternalNotes && (
        <div className="max-w-xl">
          <ProductionMapUploader clientId={clientId} />
        </div>
      )}

      {/* Kanban Board — 3 columns */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {PRODUCTION_COLUMNS.map((col) => (
            <div
              key={col.id}
              className="h-96 bg-empire-bone border border-empire-ghost animate-pulse"
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 gap-4">
            {PRODUCTION_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={getColumnCards(column.id)}
                activeId={activeId}
                onAddCard={() => openNewCard(column.id)}
                onCardClick={openEditCard}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="bg-empire-surface border border-empire-gold/40 p-3 shadow-xl w-64 opacity-90">
                {activeCard.content_id && (
                  <span className="text-[10px] text-empire-gold/60 font-mono">{activeCard.content_id}</span>
                )}
                <p className="text-empire-ink text-sm font-medium">{activeCard.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {showModal && clientId && (
        <CardModal
          card={editingCard ?? undefined}
          defaultStatus={defaultColumnStatus}
          clientId={clientId}
          canSeeInternalNotes={canSeeInternalNotes}
          canDelete={!!canDelete}
          onClose={() => { setShowModal(false); setEditingCard(null) }}
        />
      )}
    </div>
  )
}
