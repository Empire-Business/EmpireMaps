import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ChevronLeft, ChevronRight, Share2, Filter, TrendingUp,
  CheckCircle2, Calendar, Plus, X, GripVertical, Hash,
  Paperclip, FileIcon,
} from 'lucide-react'
import { useEffectiveClientId } from '@/hooks/useEffectiveClientId'
import { useContentCards, useCreateCard, useUpdateCard } from '@/hooks/useContentCards'
import { useSocialProfiles } from '@/hooks/useSocialProfiles'
import { useCardAttachments } from '@/hooks/useCardAttachments'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type ContentCard = Database['public']['Tables']['content_cards']['Row']
type AttachmentRow = Database['public']['Tables']['card_attachments']['Row']

const CHANNEL_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  LinkedIn: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  YouTube: 'bg-red-500/20 text-red-300 border-red-500/30',
  TikTok: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Twitter/X': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Facebook: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Pinterest: 'bg-red-600/20 text-red-300 border-red-600/30',
  Blog: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Email: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Outro: 'bg-empire-mist text-empire-steel/50 border-empire-ghost',
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const DIST_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'aprovado_final', label: 'Aprovado Final' },
  { value: 'agendado', label: 'Agendados' },
  { value: 'publicado', label: 'Publicados' },
]

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekDay = firstDay.getDay()
  const days: (Date | null)[] = []

  for (let i = 0; i < startWeekDay; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  while (days.length % 7 !== 0) days.push(null)

  return days
}

/** Parse "YYYY-MM-DD" as local date (avoids UTC timezone shift) */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

// ---- Card Detail Modal (Distribution) ----
interface CardDetailModalProps {
  card: ContentCard
  clientId: string
  onClose: () => void
}

function CardDetailModal({ card, clientId, onClose }: CardDetailModalProps) {
  const updateCard = useUpdateCard()
  const { data: socialProfiles } = useSocialProfiles(clientId)
  const { data: attachments } = useCardAttachments(card.id)
  const [status, setStatus] = useState(card.status)
  const [publishDate, setPublishDate] = useState(card.publish_date ?? '')
  const [publishUrl, setPublishUrl] = useState(card.publish_url ?? '')
  const [destProfiles, setDestProfiles] = useState(card.destination_profiles?.join(', ') ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const destinationProfiles = destProfiles
        ? destProfiles.split(',').map((p) => p.trim()).filter(Boolean)
        : null

      await updateCard.mutateAsync({
        cardId: card.id,
        data: {
          status,
          publish_date: publishDate || null,
          publish_url: publishUrl || null,
          destination_profiles: destinationProfiles,
        },
      })
      onClose()
    } catch {
      // toast handled in hook
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-lg w-full max-w-lg p-6 my-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-semibold text-empire-ink">
              Detalhes do Conteúdo
            </h2>
            {card.content_id && (
              <span className="flex items-center gap-1 text-xs bg-empire-gold/10 text-empire-gold border border-empire-gold/20 px-2 py-0.5">
                <Hash className="w-3 h-3" />
                {card.content_id}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-empire-steel/40 hover:text-empire-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card info (read-only from production) */}
        <div className="space-y-3 mb-6">
          <div>
            <span className="text-xs text-empire-steel/50">Título</span>
            <p className="text-sm text-empire-ink font-medium">{card.title}</p>
          </div>

          {card.description && (
            <div>
              <span className="text-xs text-empire-steel/50">Conteúdo / Briefing</span>
              <p className="text-sm text-empire-steel/80 whitespace-pre-wrap">{card.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {card.channel && (
              <div>
                <span className="text-xs text-empire-steel/50">Canal</span>
                <p className="text-sm text-empire-steel/80">{card.channel}</p>
              </div>
            )}
            {card.final_format && (
              <div>
                <span className="text-xs text-empire-steel/50">Formato</span>
                <p className="text-sm text-empire-steel/80">{card.final_format}</p>
              </div>
            )}
          </div>

          {/* Attachments (read-only view) */}
          {attachments && attachments.length > 0 && (
            <div>
              <span className="text-xs text-empire-steel/50 flex items-center gap-1 mb-1">
                <Paperclip className="w-3 h-3" />
                Entrega Final
              </span>
              <ul className="space-y-1">
                {attachments.map((att: AttachmentRow) => (
                  <li key={att.id} className="flex items-center gap-2">
                    <FileIcon className="w-3 h-3 text-empire-steel/30" />
                    <a
                      href={att.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-empire-steel/80 hover:text-empire-gold transition-colors truncate"
                    >
                      {att.file_name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Distribution-specific fields (editable) */}
        <div className="border-t border-empire-ghost pt-4 space-y-4">
          <h3 className="text-sm font-medium text-empire-steel/80">Configuração de Distribuição</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-empire-steel/50 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentCard['status'])}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                <option value="aprovado_final">Aprovado Final</option>
                <option value="agendado">Agendado</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-empire-steel/50 mb-1">Data de Publicação</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-empire-steel/50 mb-1">
              Perfis de Destino
              {socialProfiles && socialProfiles.length > 0 && (
                <span className="text-empire-steel/30 ml-1">
                  (disponíveis: {socialProfiles.map(p => `@${p.handle}`).join(', ')})
                </span>
              )}
            </label>
            <input
              value={destProfiles}
              onChange={(e) => setDestProfiles(e.target.value)}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="@perfil1, @perfil2"
            />
          </div>

          <div>
            <label className="block text-xs text-empire-steel/50 mb-1">URL de Publicação</label>
            <input
              value={publishUrl}
              onChange={(e) => setPublishUrl(e.target.value)}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-3 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 mt-4 border-t border-empire-ghost">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary justify-center">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-premium justify-center disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Draggable Card Pill ----
function DraggableCardPill({ card, onClick }: { card: ContentCard; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id })
  const channelClass = card.channel
    ? (CHANNEL_COLORS[card.channel] ?? CHANNEL_COLORS['Outro'])
    : CHANNEL_COLORS['Outro']

  // Don't apply transform here — let DragOverlay handle the visual follow.
  // The original element just becomes a ghost (opacity) so the droppable detection works properly.
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'text-xs px-1.5 py-1 border cursor-grab active:cursor-grabbing hover:brightness-110 transition-all flex items-center gap-1',
        channelClass,
        isDragging && 'opacity-20'
      )}
      title={`${card.content_id ? card.content_id + ' — ' : ''}${card.title}`}
      onPointerUp={(e) => {
        if (!isDragging) {
          e.stopPropagation()
          onClick()
        }
      }}
    >
      <GripVertical className="w-2.5 h-2.5 flex-shrink-0 opacity-40" />
      <span className="truncate">
        {card.content_id && (
          <span className="font-mono text-[9px] opacity-60 mr-1">{card.content_id}</span>
        )}
        {card.title}
      </span>
    </div>
  )
}

// ---- Droppable Day ----
function DroppableDay({ day, isToday, dayCards, clientId, onQuickAdd, onCardClick }: {
  day: Date
  isToday: boolean
  dayCards: ContentCard[]
  clientId: string | undefined
  onQuickAdd: (day: Date) => void
  onCardClick: (card: ContentCard) => void
}) {
  const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dateStr}` })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-empire-bone min-h-24 p-1.5 flex flex-col gap-1 group/day transition-colors',
        isToday && 'bg-empire-gold/5',
        isOver && 'bg-empire-gold/10 border border-empire-gold/30'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium w-6 h-6 flex items-center justify-center flex-shrink-0',
            isToday
              ? 'bg-empire-gold text-empire'
              : 'text-empire-steel/50'
          )}
        >
          {day.getDate()}
        </span>
        {clientId && (
          <button
            onClick={() => onQuickAdd(day)}
            className="opacity-0 group-hover/day:opacity-100 transition-opacity text-empire-steel/30 hover:text-empire-gold"
            title="Adicionar conteúdo neste dia"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="space-y-0.5">
        {dayCards.slice(0, 3).map((card) => (
          <DraggableCardPill
            key={card.id}
            card={card}
            onClick={() => onCardClick(card)}
          />
        ))}
        {dayCards.length > 3 && (
          <button
            onClick={() => {
              if (dayCards.length > 3) onCardClick(dayCards[3])
            }}
            className="text-empire-steel/40 text-xs hover:text-empire-gold transition-colors"
          >
            +{dayCards.length - 3} mais
          </button>
        )}
      </div>
    </div>
  )
}

// ---- Quick Add Modal (simplified) ----
const quickAddSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  channel: z.string().optional(),
})
type QuickAddData = z.infer<typeof quickAddSchema>

const CHANNEL_OPTIONS = [
  'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Twitter/X',
  'Facebook', 'Pinterest', 'Blog', 'Email', 'Outro',
]

function QuickAddModal({ date, clientId, onClose }: { date: Date; clientId: string; onClose: () => void }) {
  const createCard = useCreateCard(clientId)
  const dateStr = date.toISOString().split('T')[0]
  const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuickAddData>({
    resolver: zodResolver(quickAddSchema),
  })

  async function onSubmit(data: QuickAddData) {
    try {
      await createCard.mutateAsync({
        title: data.title,
        channel: data.channel || null,
        status: 'agendado',
        stage_tag: 'aprovado_final',
        publish_date: dateStr,
      })
      onClose()
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg font-semibold text-empire-ink">Novo conteúdo</h2>
          <button onClick={onClose} className="text-empire-steel/40 hover:text-empire-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-empire-steel/50 text-xs mb-5">Publicação em {dateLabel}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Título *</label>
            <input
              {...register('title')}
              autoFocus
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Título do conteúdo"
            />
            {errors.title && <p className="text-empire-danger text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Canal</label>
            <select
              {...register('channel')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              <option value="">Selecione...</option>
              {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary justify-center">Cancelar</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-premium justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Main Page ----
export default function DistributionMapPage() {
  const clientId = useEffectiveClientId()

  const { data: cards, isLoading } = useContentCards(clientId)
  const updateCard = useUpdateCard()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )
  const [dragActiveId, setDragActiveId] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<ContentCard | null>(null)

  function handleDragStart(event: DragStartEvent) {
    setDragActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDragActiveId(null)
    const { active, over } = event
    if (!over) return

    const overId = over.id as string
    if (!overId.startsWith('day-')) return

    const newDate = overId.replace('day-', '')
    const draggedCard = cards?.find((c) => c.id === active.id)
    if (draggedCard && draggedCard.publish_date !== newDate) {
      await updateCard.mutateAsync({
        cardId: active.id as string,
        data: { publish_date: newDate },
      })
    }
  }

  const dragActiveCard = cards?.find((c) => c.id === dragActiveId) ?? null

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [quickAddDate, setQuickAddDate] = useState<Date | null>(null)

  // Filters
  const [filterChannel, setFilterChannel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const calendarDays = useMemo(
    () => buildCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  )

  // Only show cards that are approved_final, agendado, or publicado (fed from production map)
  const distributionCards = useMemo(() => {
    return (cards ?? []).filter((c) =>
      ['aprovado_final', 'agendado', 'publicado'].includes(c.status)
    )
  }, [cards])

  // All channels available in distribution cards
  const allChannels = useMemo(() => {
    const set = new Set<string>()
    for (const card of distributionCards) {
      if (card.channel) set.add(card.channel)
    }
    return Array.from(set).sort()
  }, [distributionCards])

  // Cards with publish_date in the current month
  const monthCards = useMemo(() => {
    return distributionCards.filter((c) => {
      if (!c.publish_date) return false
      const d = parseLocalDate(c.publish_date)
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth
    })
  }, [distributionCards, viewYear, viewMonth])

  // Cards without publish_date (unscheduled but approved)
  const unscheduledCards = useMemo(() => {
    return distributionCards.filter((c) => !c.publish_date)
  }, [distributionCards])

  // Filtered cards
  const filteredMonthCards = useMemo(() => {
    let list = monthCards
    if (filterChannel !== 'all') {
      list = list.filter((c) => c.channel === filterChannel)
    }
    if (filterStatus !== 'all') {
      list = list.filter((c) => c.status === filterStatus)
    }
    return list
  }, [monthCards, filterChannel, filterStatus])

  function getCardsForDay(day: Date): ContentCard[] {
    return filteredMonthCards.filter((c) => {
      if (!c.publish_date) return false
      return isSameDay(parseLocalDate(c.publish_date), day)
    })
  }

  // Summary by channel
  const channelSummary = useMemo(() => {
    const map: Record<string, number> = {}
    for (const card of filteredMonthCards) {
      const ch = card.channel ?? 'Outro'
      map[ch] = (map[ch] ?? 0) + 1
    }
    return Object.entries(map).sort(([, a], [, b]) => b - a)
  }, [filteredMonthCards])

  // Analysis panel stats
  const totalInMonth = monthCards.length
  const publishedInMonth = monthCards.filter((c) => c.status === 'publicado').length
  const scheduledInMonth = monthCards.filter((c) => c.status === 'agendado').length

  const planningRate = totalInMonth > 0 ? Math.round(((scheduledInMonth + publishedInMonth) / totalInMonth) * 100) : 0

  const activeFilters = (filterChannel !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="section-label">Fase 3</div>
        <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Mapa de Distribuição</h1>
        <p className="text-empire-steel/60 mt-1 text-sm">
          Conteúdos aprovados no Mapa de Produção aparecem aqui automaticamente. Clique em um card para configurar a distribuição.
        </p>
      </div>

      {/* Unscheduled approved cards */}
      {unscheduledCards.length > 0 && (
        <div className="bg-empire-gold/5 border border-empire-gold/20 px-4 py-3">
          <p className="text-sm text-empire-steel/80 mb-2">
            <span className="font-medium text-empire-gold">{unscheduledCards.length}</span> conteúdo(s) aprovado(s) sem data de publicação:
          </p>
          <div className="flex flex-wrap gap-2">
            {unscheduledCards.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="text-xs bg-empire-bone border border-empire-ghost px-2 py-1 hover:border-empire-gold/40 transition-colors flex items-center gap-1.5"
              >
                {card.content_id && (
                  <span className="font-mono text-[9px] text-empire-gold/60">{card.content_id}</span>
                )}
                <span className="text-empire-steel/80 truncate max-w-32">{card.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Month Navigation + Filters toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="text-empire-steel/60 hover:text-empire-ink transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-xl font-semibold text-empire-ink min-w-48 text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="text-empire-steel/60 hover:text-empire-ink transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 border text-sm transition-colors',
            showFilters || activeFilters > 0
              ? 'border-empire-gold/40 text-empire-gold bg-empire-gold/5'
              : 'border-empire-ghost text-empire-steel/60 hover:text-empire-ink'
          )}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFilters > 0 && (
            <span className="w-4 h-4 rounded-full bg-empire-gold text-empire text-xs flex items-center justify-center font-medium">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-empire-surface rounded-lg border border-empire-ghost p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-empire-steel/50 whitespace-nowrap">Canal:</label>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="bg-empire-mist border border-empire-ghost text-empire-ink text-sm px-3 py-1.5 focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              <option value="all">Todos</option>
              {allChannels.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-empire-steel/50 whitespace-nowrap">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-empire-mist border border-empire-ghost text-empire-ink text-sm px-3 py-1.5 focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              {DIST_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterChannel('all'); setFilterStatus('all') }}
              className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Analysis Panel */}
      {totalInMonth > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-empire-surface rounded-lg border border-empire-ghost p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-empire-steel/40" />
              <span className="text-xs text-empire-steel/50">Total no mês</span>
            </div>
            <p className="text-2xl font-display font-semibold text-empire-ink">{totalInMonth}</p>
            <p className="text-xs text-empire-steel/40 mt-0.5">conteúdos aprovados</p>
          </div>

          <div className="bg-empire-surface rounded-lg border border-empire-ghost p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-empire-success/60" />
              <span className="text-xs text-empire-steel/50">Publicados</span>
            </div>
            <p className="text-2xl font-display font-semibold text-empire-success">{publishedInMonth}</p>
            <p className="text-xs text-empire-steel/40 mt-0.5">
              {totalInMonth > 0 ? Math.round((publishedInMonth / totalInMonth) * 100) : 0}% do total
            </p>
          </div>

          <div className="bg-empire-surface rounded-lg border border-empire-ghost p-4">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-empire-steel/60" />
              <span className="text-xs text-empire-steel/50">Agendados</span>
            </div>
            <p className="text-2xl font-display font-semibold text-empire-steel">{scheduledInMonth}</p>
            <p className="text-xs text-empire-steel/40 mt-0.5">prontos para publicar</p>
          </div>

          <div className="bg-empire-surface rounded-lg border border-empire-ghost p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-empire-gold/60" />
              <span className="text-xs text-empire-steel/50">Planejamento</span>
            </div>
            <p className="text-2xl font-display font-semibold text-empire-gold">{planningRate}%</p>
            <p className="text-xs text-empire-steel/40 mt-0.5">taxa de agendamento</p>
          </div>
        </div>
      )}

      {/* Channel Summary Bar */}
      {filteredMonthCards.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-empire-steel/60 text-sm">
            {filteredMonthCards.length} conteúdo{filteredMonthCards.length !== 1 ? 's' : ''}
            {activeFilters > 0 ? ' (filtrado)' : ' este mês'}:
          </span>
          {channelSummary.map(([channel, count]) => {
            const channelClass = CHANNEL_COLORS[channel] ?? CHANNEL_COLORS['Outro']
            return (
              <span key={channel} className={cn('text-xs px-2.5 py-1 border', channelClass)}>
                {channel}: {count}
              </span>
            )
          })}
        </div>
      )}

      {/* Calendar */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-px bg-empire-ghost">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-empire-bone h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="bg-empire-surface rounded-lg border border-empire-ghost overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-empire-ghost">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="px-2 py-2 text-center text-xs text-empire-steel/50 font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-px bg-empire-ghost">
              {calendarDays.map((day, i) => {
                if (!day) {
                  return <div key={i} className="bg-empire-mist min-h-24 p-1" />
                }

                const dayCards = getCardsForDay(day)
                const isToday = isSameDay(day, today)

                return (
                  <DroppableDay
                    key={i}
                    day={day}
                    isToday={isToday}
                    dayCards={dayCards}
                    clientId={clientId}
                    onQuickAdd={setQuickAddDate}
                    onCardClick={setSelectedCard}
                  />
                )
              })}
            </div>
          </div>

          <DragOverlay>
            {dragActiveCard && (
              <div className="bg-empire-surface border border-empire-gold/40 px-2 py-1 shadow-xl text-xs text-empire-ink opacity-90">
                {dragActiveCard.content_id && (
                  <span className="font-mono text-[9px] text-empire-gold/60 mr-1">{dragActiveCard.content_id}</span>
                )}
                {dragActiveCard.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Quick Add Modal */}
      {quickAddDate && clientId && (
        <QuickAddModal
          date={quickAddDate}
          clientId={clientId}
          onClose={() => setQuickAddDate(null)}
        />
      )}

      {/* Card Detail Modal */}
      {selectedCard && clientId && (
        <CardDetailModal
          card={selectedCard}
          clientId={clientId}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {/* Empty state */}
      {!isLoading && filteredMonthCards.length === 0 && (
        <div className="py-12 text-center">
          <Share2 className="w-8 h-8 text-empire-ink/20 mx-auto mb-3" />
          <p className="text-empire-steel/40 text-sm">
            {activeFilters > 0
              ? 'Nenhum conteúdo encontrado com os filtros aplicados.'
              : distributionCards.length === 0
                ? 'Nenhum conteúdo aprovado ainda. Aprove conteúdos no Mapa de Produção para vê-los aqui.'
                : `Nenhum conteúdo com data de publicação em ${MONTH_NAMES[viewMonth]}.`}
          </p>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterChannel('all'); setFilterStatus('all') }}
              className="text-empire-gold/70 text-sm mt-2 hover:text-empire-gold transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
