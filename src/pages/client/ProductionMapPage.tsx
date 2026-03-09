import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
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
import { Plus, X, GripVertical, Calendar, Link2, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useContentCards, useCreateCard, useUpdateCard } from '@/hooks/useContentCards'
import { supabase } from '@/integrations/supabase/client'
import { cn, formatDate } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type ContentCard = Database['public']['Tables']['content_cards']['Row']
type CardStatus = ContentCard['status']
type ContentCardInsert = Omit<Database['public']['Tables']['content_cards']['Insert'], 'client_id' | 'created_by'>

const COLUMNS: { id: CardStatus; label: string; color: string }[] = [
  { id: 'ideia', label: 'Ideia', color: 'border-t-empire-text/30' },
  { id: 'em_producao', label: 'Em Produção', color: 'border-t-blue-500/60' },
  { id: 'revisao', label: 'Revisão', color: 'border-t-yellow-500/60' },
  { id: 'agendado', label: 'Agendado', color: 'border-t-purple-500/60' },
  { id: 'publicado', label: 'Publicado', color: 'border-t-emerald-500/60' },
  { id: 'arquivado', label: 'Arquivado', color: 'border-t-empire-text/20' },
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
  Outro: 'bg-empire-surface text-empire-text/50 border-empire-border',
}

// ---- Card Form ----
const cardSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  channel: z.string().optional(),
  status: z.enum(['ideia', 'em_producao', 'revisao', 'agendado', 'publicado', 'arquivado'] as const),
  production_date: z.string().optional(),
  publish_date: z.string().optional(),
  responsible: z.string().optional(),
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

interface CardModalProps {
  card?: ContentCard
  defaultStatus?: CardStatus
  clientId: string
  canSeeInternalNotes: boolean
  onClose: () => void
}

function CardModal({ card, defaultStatus, clientId, canSeeInternalNotes, onClose }: CardModalProps) {
  const createCard = useCreateCard(clientId)
  const updateCard = useUpdateCard()
  const [error, setError] = useState<string | null>(null)
  const [reuseLoading, setReuseLoading] = useState(false)
  const [reuseResult, setReuseResult] = useState<ReuseResult | null>(null)

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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: card?.title ?? '',
      description: card?.description ?? '',
      channel: card?.channel ?? '',
      status: card?.status ?? defaultStatus ?? 'ideia',
      production_date: card?.production_date ?? '',
      publish_date: card?.publish_date ?? '',
      responsible: card?.responsible ?? '',
      labels: card?.labels?.join(', ') ?? '',
      publish_url: card?.publish_url ?? '',
      internal_notes: card?.internal_notes ?? '',
    },
  })

  async function onSubmit(data: CardFormData) {
    setError(null)
    try {
      const labels = data.labels
        ? data.labels.split(',').map((l) => l.trim()).filter(Boolean)
        : null

      const payload = {
        title: data.title,
        description: data.description || null,
        channel: data.channel || null,
        status: data.status,
        production_date: data.production_date || null,
        publish_date: data.publish_date || null,
        responsible: data.responsible || null,
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-empire-card border border-empire-border w-full max-w-2xl p-6 my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-empire-text">
            {card ? 'Editar Card' : 'Novo Card'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Título *</label>
            <input
              {...register('title')}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Título do conteúdo"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
              placeholder="Descreva o conteúdo..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Canal</label>
              <select
                {...register('channel')}
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                <option value="">Selecione...</option>
                {CHANNEL_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>{col.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Data de Produção</label>
              <input
                {...register('production_date')}
                type="date"
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Data de Publicação</label>
              <input
                {...register('publish_date')}
                type="date"
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Responsável</label>
            <input
              {...register('responsible')}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Nome do responsável"
            />
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Labels (separadas por vírgula)</label>
            <input
              {...register('labels')}
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="educativo, semanal, trending"
            />
          </div>

          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">URL de Publicação</label>
            <input
              {...register('publish_url')}
              type="url"
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="https://..."
            />
          </div>

          {canSeeInternalNotes && (
            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">
                Notas internas
                <span className="ml-1 text-xs text-empire-gold/60">(Admin/Consultor)</span>
              </label>
              <textarea
                {...register('internal_notes')}
                rows={3}
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
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

        {/* Reuse suggestions — only for existing cards */}
        {card && (
          <div className="mt-6 pt-6 border-t border-empire-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-empire-text/70">Sugestões de Reaproveitamento</h3>
              <button
                type="button"
                onClick={handleSuggestReuse}
                disabled={reuseLoading}
                className="flex items-center gap-1.5 text-xs text-empire-gold hover:text-empire-goldLight transition-colors disabled:opacity-50"
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
                  <div key={i} className="bg-empire-surface border border-empire-border p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-empire-text">{s.format}</span>
                      <span className="text-xs text-empire-text/40">→</span>
                      <span className="text-xs text-empire-gold/80">{s.channel}</span>
                    </div>
                    <p className="text-xs text-empire-text/60">{s.rationale}</p>
                    {s.adaptation_tips && s.adaptation_tips.length > 0 && (
                      <ul className="space-y-0.5">
                        {s.adaptation_tips.map((tip, j) => (
                          <li key={j} className="text-xs text-empire-text/50 flex gap-1.5">
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-empire-bg border border-empire-border p-3 cursor-pointer group hover:border-empire-gold/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 text-empire-text/20 hover:text-empire-text/50 transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-empire-text text-sm font-medium leading-snug line-clamp-2">
            {card.title}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {card.channel && (
              <span className={cn('text-xs px-1.5 py-0.5 border', channelClass)}>
                {card.channel}
              </span>
            )}
            {card.labels && card.labels.map((label) => (
              <span key={label} className="text-xs text-empire-text/40 bg-empire-surface px-1.5 py-0.5">
                {label}
              </span>
            ))}
          </div>

          {card.publish_date && (
            <div className="flex items-center gap-1 mt-2">
              <Calendar className="w-3 h-3 text-empire-text/30" />
              <span className="text-empire-text/40 text-xs">{formatDate(card.publish_date)}</span>
            </div>
          )}

          {card.publish_url && (
            <a
              href={card.publish_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 mt-1 text-xs text-empire-gold/50 hover:text-empire-gold transition-colors"
            >
              <Link2 className="w-3 h-3" />
              Ver publicação
            </a>
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
  return (
    <div className={cn('bg-empire-card border border-empire-border border-t-2 flex flex-col min-h-96', column.color)}>
      <div className="px-3 py-3 flex items-center justify-between border-b border-empire-border">
        <div className="flex items-center gap-2">
          <span className="text-empire-text text-sm font-medium">{column.label}</span>
          <span className="text-xs text-empire-text/40 bg-empire-surface px-1.5 py-0.5">
            {cards.length}
          </span>
        </div>
        <button
          onClick={onAddCard}
          className="text-empire-text/30 hover:text-empire-gold transition-colors"
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

  const effectiveProfile = impersonatedClient ?? profile
  const clientId = effectiveProfile?.id ?? user?.id

  const canSeeInternalNotes = profile?.role === 'admin' || profile?.role === 'consultant'

  const { data: cards, isLoading } = useContentCards(clientId)
  const updateCard = useUpdateCard()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<ContentCard | null>(null)
  const [defaultColumnStatus, setDefaultColumnStatus] = useState<CardStatus>('ideia')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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

    // Determine target column
    const targetColumnId = COLUMNS.find((col) => col.id === over.id)?.id
    if (targetColumnId) {
      await updateCard.mutateAsync({
        cardId: active.id as string,
        data: { status: targetColumnId },
      })
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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Fase 3</p>
          <h1 className="font-display text-3xl font-semibold text-empire-text">Mapa de Produção</h1>
          <p className="text-empire-text/60 mt-1 text-sm">
            Gerencie seus conteúdos por etapa de produção.
          </p>
        </div>
        <button
          onClick={() => openNewCard('ideia')}
          className="btn-premium"
        >
          <Plus className="w-4 h-4" />
          Novo Card
        </button>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="w-64 flex-shrink-0 h-96 bg-empire-card border border-empire-border animate-pulse"
            />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((column) => (
              <div key={column.id} className="w-64 flex-shrink-0">
                <KanbanColumn
                  column={column}
                  cards={getColumnCards(column.id)}
                  activeId={activeId}
                  onAddCard={() => openNewCard(column.id)}
                  onCardClick={openEditCard}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="bg-empire-bg border border-empire-gold/40 p-3 shadow-xl w-64 opacity-90">
                <p className="text-empire-text text-sm font-medium">{activeCard.title}</p>
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
          onClose={() => { setShowModal(false); setEditingCard(null) }}
        />
      )}
    </div>
  )
}
