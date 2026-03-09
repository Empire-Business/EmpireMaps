import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, ChevronRight, Share2, Filter, TrendingUp, CheckCircle2, Calendar, Plus, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useContentCards, useCreateCard } from '@/hooks/useContentCards'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type ContentCard = Database['public']['Tables']['content_cards']['Row']

// ---- Quick Add Modal ----
const quickAddSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  channel: z.string().optional(),
  status: z.enum(['ideia', 'em_producao', 'revisao', 'agendado', 'publicado', 'arquivado'] as const),
})
type QuickAddData = z.infer<typeof quickAddSchema>

const CHANNEL_OPTIONS = [
  'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Twitter/X',
  'Facebook', 'Pinterest', 'Blog', 'Email', 'Outro',
]

interface QuickAddModalProps {
  date: Date
  clientId: string
  onClose: () => void
}

function QuickAddModal({ date, clientId, onClose }: QuickAddModalProps) {
  const createCard = useCreateCard(clientId)
  const dateStr = date.toISOString().split('T')[0]
  const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuickAddData>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: { status: 'agendado' },
  })

  async function onSubmit(data: QuickAddData) {
    try {
      await createCard.mutateAsync({
        title: data.title,
        channel: data.channel || null,
        status: data.status,
        publish_date: dateStr,
      })
      onClose()
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-empire-card border border-empire-border w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg font-semibold text-empire-text">Novo conteúdo</h2>
          <button onClick={onClose} className="text-empire-text/40 hover:text-empire-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-empire-text/50 text-xs mb-5">Publicação em {dateLabel}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-empire-text/70 mb-1.5">Título *</label>
            <input
              {...register('title')}
              autoFocus
              className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Título do conteúdo"
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Canal</label>
              <select
                {...register('channel')}
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                <option value="">Selecione...</option>
                {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-empire-text/70 mb-1.5">Status</label>
              <select
                {...register('status')}
                className="w-full bg-empire-surface border border-empire-border text-empire-text px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              >
                <option value="ideia">Ideia</option>
                <option value="em_producao">Em Produção</option>
                <option value="revisao">Revisão</option>
                <option value="agendado">Agendado</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
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
  Outro: 'bg-empire-surface text-empire-text/50 border-empire-border',
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'publicado', label: 'Publicados' },
  { value: 'agendado', label: 'Agendados' },
  { value: 'em_producao', label: 'Em Produção' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'ideia', label: 'Ideia' },
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

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function CardPill({ card }: { card: ContentCard }) {
  const channelClass = card.channel
    ? (CHANNEL_COLORS[card.channel] ?? CHANNEL_COLORS['Outro'])
    : CHANNEL_COLORS['Outro']

  return (
    <div
      className={cn(
        'text-xs px-1.5 py-0.5 border truncate',
        channelClass
      )}
      title={card.title}
    >
      {card.title}
    </div>
  )
}

export default function DistributionMapPage() {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()

  const effectiveProfile = impersonatedClient ?? profile
  const clientId = effectiveProfile?.id ?? user?.id

  const { data: cards, isLoading } = useContentCards(clientId)

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

  // All channels available in cards
  const allChannels = useMemo(() => {
    const set = new Set<string>()
    for (const card of cards ?? []) {
      if (card.channel) set.add(card.channel)
    }
    return Array.from(set).sort()
  }, [cards])

  // Cards with publish_date in the current month
  const monthCards = useMemo(() => {
    return (cards ?? []).filter((c) => {
      if (!c.publish_date) return false
      const d = new Date(c.publish_date)
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth
    })
  }, [cards, viewYear, viewMonth])

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
      return isSameDay(new Date(c.publish_date), day)
    })
  }

  // Summary by channel (filtered)
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
  const plannedInMonth = monthCards.filter((c) =>
    ['agendado', 'em_producao', 'revisao', 'publicado'].includes(c.status)
  ).length
  const planningRate = totalInMonth > 0 ? Math.round((plannedInMonth / totalInMonth) * 100) : 0

  const activeFilters = (filterChannel !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Fase 3</p>
        <h1 className="font-display text-3xl font-semibold text-empire-text">Mapa de Distribuição</h1>
        <p className="text-empire-text/60 mt-1 text-sm">
          Visualize seus conteúdos por data de publicação.
        </p>
      </div>

      {/* Month Navigation + Filters toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="text-empire-text/60 hover:text-empire-text transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-xl font-semibold text-empire-text min-w-48 text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="text-empire-text/60 hover:text-empire-text transition-colors"
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
              : 'border-empire-border text-empire-text/60 hover:text-empire-text'
          )}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFilters > 0 && (
            <span className="w-4 h-4 rounded-full bg-empire-gold text-empire-bg text-xs flex items-center justify-center font-medium">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-empire-card border border-empire-border p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-empire-text/50 whitespace-nowrap">Canal:</label>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="bg-empire-surface border border-empire-border text-empire-text text-sm px-3 py-1.5 focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              <option value="all">Todos</option>
              {allChannels.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-empire-text/50 whitespace-nowrap">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-empire-surface border border-empire-border text-empire-text text-sm px-3 py-1.5 focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              {STATUS_OPTIONS.map((s) => (
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
          <div className="bg-empire-card border border-empire-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-empire-text/40" />
              <span className="text-xs text-empire-text/50">Total no mês</span>
            </div>
            <p className="text-2xl font-display font-semibold text-empire-text">{totalInMonth}</p>
            <p className="text-xs text-empire-text/40 mt-0.5">conteúdos programados</p>
          </div>

          <div className="bg-empire-card border border-empire-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400/60" />
              <span className="text-xs text-empire-text/50">Publicados</span>
            </div>
            <p className="text-2xl font-display font-semibold text-emerald-400">{publishedInMonth}</p>
            <p className="text-xs text-empire-text/40 mt-0.5">
              {totalInMonth > 0 ? Math.round((publishedInMonth / totalInMonth) * 100) : 0}% do planejado
            </p>
          </div>

          <div className="bg-empire-card border border-empire-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-purple-400/60" />
              <span className="text-xs text-empire-text/50">Agendados</span>
            </div>
            <p className="text-2xl font-display font-semibold text-purple-400">{scheduledInMonth}</p>
            <p className="text-xs text-empire-text/40 mt-0.5">prontos para publicar</p>
          </div>

          <div className="bg-empire-card border border-empire-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-empire-gold/60" />
              <span className="text-xs text-empire-text/50">Planejamento</span>
            </div>
            <p className="text-2xl font-display font-semibold text-empire-gold">{planningRate}%</p>
            <p className="text-xs text-empire-text/40 mt-0.5">taxa de execução</p>
          </div>
        </div>
      )}

      {/* Channel Summary Bar */}
      {filteredMonthCards.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-empire-text/60 text-sm">
            {filteredMonthCards.length} publicação{filteredMonthCards.length !== 1 ? 'ões' : ''}
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
        <div className="grid grid-cols-7 gap-px bg-empire-border">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-empire-card h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-empire-card border border-empire-border overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-empire-border">
            {DAY_NAMES.map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-xs text-empire-text/50 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-px bg-empire-border">
            {calendarDays.map((day, i) => {
              if (!day) {
                return <div key={i} className="bg-empire-surface min-h-24 p-1" />
              }

              const dayCards = getCardsForDay(day)
              const isToday = isSameDay(day, today)

              return (
                <div
                  key={i}
                  className={cn(
                    'bg-empire-card min-h-24 p-1.5 flex flex-col gap-1 group/day',
                    isToday && 'bg-empire-gold/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xs font-medium w-6 h-6 flex items-center justify-center flex-shrink-0',
                        isToday
                          ? 'bg-empire-gold text-empire-bg'
                          : 'text-empire-text/50'
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {clientId && (
                      <button
                        onClick={() => setQuickAddDate(day)}
                        className="opacity-0 group-hover/day:opacity-100 transition-opacity text-empire-text/30 hover:text-empire-gold"
                        title="Adicionar conteúdo neste dia"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayCards.slice(0, 3).map((card) => (
                      <CardPill key={card.id} card={card} />
                    ))}
                    {dayCards.length > 3 && (
                      <p className="text-empire-text/40 text-xs">
                        +{dayCards.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {quickAddDate && clientId && (
        <QuickAddModal
          date={quickAddDate}
          clientId={clientId}
          onClose={() => setQuickAddDate(null)}
        />
      )}

      {/* Empty state */}
      {!isLoading && filteredMonthCards.length === 0 && (
        <div className="py-12 text-center">
          <Share2 className="w-8 h-8 text-empire-text/20 mx-auto mb-3" />
          <p className="text-empire-text/40 text-sm">
            {activeFilters > 0
              ? 'Nenhum conteúdo encontrado com os filtros aplicados.'
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
          {!activeFilters && (
            <p className="text-empire-text/30 text-xs mt-1">
              Adicione datas de publicação nos cards do Mapa de Produção.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
