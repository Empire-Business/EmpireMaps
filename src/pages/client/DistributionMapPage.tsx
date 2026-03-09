import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useContentCards } from '@/hooks/useContentCards'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type ContentCard = Database['public']['Tables']['content_cards']['Row']

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

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekDay = firstDay.getDay() // 0=Sun
  const days: (Date | null)[] = []

  for (let i = 0; i < startWeekDay; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  // Pad to full weeks
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

  // Cards with publish_date in the current month
  const monthCards = useMemo(() => {
    return (cards ?? []).filter((c) => {
      if (!c.publish_date) return false
      const d = new Date(c.publish_date)
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth
    })
  }, [cards, viewYear, viewMonth])

  function getCardsForDay(day: Date): ContentCard[] {
    return monthCards.filter((c) => {
      if (!c.publish_date) return false
      return isSameDay(new Date(c.publish_date), day)
    })
  }

  // Summary by channel
  const channelSummary = useMemo(() => {
    const map: Record<string, number> = {}
    for (const card of monthCards) {
      const ch = card.channel ?? 'Outro'
      map[ch] = (map[ch] ?? 0) + 1
    }
    return Object.entries(map).sort(([, a], [, b]) => b - a)
  }, [monthCards])

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

      {/* Month Navigation */}
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

      {/* Summary Bar */}
      {monthCards.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-empire-text/60 text-sm">
            {monthCards.length} publicação{monthCards.length !== 1 ? 'ões' : ''} este mês:
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
                    'bg-empire-card min-h-24 p-1.5 flex flex-col gap-1',
                    isToday && 'bg-empire-gold/5'
                  )}
                >
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

      {/* Empty state */}
      {!isLoading && monthCards.length === 0 && (
        <div className="py-12 text-center">
          <Share2 className="w-8 h-8 text-empire-text/20 mx-auto mb-3" />
          <p className="text-empire-text/40 text-sm">
            Nenhum conteúdo com data de publicação em {MONTH_NAMES[viewMonth]}.
          </p>
          <p className="text-empire-text/30 text-xs mt-1">
            Adicione datas de publicação nos cards do Mapa de Produção.
          </p>
        </div>
      )}
    </div>
  )
}
