import { Link } from 'react-router-dom'
import {
  ClipboardList,
  BarChart3,
  BookOpen,
  FileText,
  Calendar,
  Share2,
  Lock,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useAllDeliverables } from '@/hooks/useDeliverable'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type DeliverableRow = Database['public']['Tables']['deliverables']['Row']
type DeliverableStatus = DeliverableRow['status']
type DeliverableType = DeliverableRow['type']

interface PhaseDeliverable {
  type: DeliverableType | 'diagnostic'
  label: string
  href: string
  icon: React.ElementType
}

const PHASES: { phase: number; label: string; deliverables: PhaseDeliverable[] }[] = [
  {
    phase: 1,
    label: 'Fase 1 — Diagnóstico',
    deliverables: [
      { type: 'diagnostic', label: 'Diagnóstico', href: '/client/diagnostico', icon: ClipboardList },
      { type: 'risk_map', label: 'Mapa de Riscos', href: '/client/mapa-riscos', icon: BarChart3 },
    ],
  },
  {
    phase: 2,
    label: 'Fase 2 — Identidade',
    deliverables: [
      { type: 'brand_book', label: 'Brand Book', href: '/client/brand-book', icon: BookOpen },
    ],
  },
  {
    phase: 3,
    label: 'Fase 3 — Conteúdo',
    deliverables: [
      { type: 'editorial_line', label: 'Linha Editorial', href: '/client/linha-editorial', icon: FileText },
      { type: 'diagnostic', label: 'Mapa de Produção', href: '/client/mapa-producao', icon: Calendar },
      { type: 'diagnostic', label: 'Mapa de Distribuição', href: '/client/mapa-distribuicao', icon: Share2 },
    ],
  },
]

const STATUS_CONFIG: Record<DeliverableStatus, { label: string; icon: React.ElementType; classes: string }> = {
  locked: {
    label: 'Bloqueado',
    icon: Lock,
    classes: 'bg-empire-surface text-empire-text/40 border border-empire-border',
  },
  in_progress: {
    label: 'Em andamento',
    icon: Clock,
    classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  },
  published: {
    label: 'Publicado',
    icon: CheckCircle2,
    classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
}

function DeliverableCard({
  deliverable,
  status,
}: {
  deliverable: PhaseDeliverable
  status: DeliverableStatus | null
}) {
  const effectiveStatus = status ?? 'locked'
  const { label, icon: StatusIcon, classes } = STATUS_CONFIG[effectiveStatus]
  const Icon = deliverable.icon

  return (
    <Link
      to={deliverable.href}
      className={cn(
        'flex items-center gap-4 p-4 border transition-colors group',
        effectiveStatus === 'locked'
          ? 'bg-empire-card border-empire-border opacity-60 pointer-events-none'
          : 'bg-empire-card border-empire-border card-hover cursor-pointer'
      )}
    >
      <div className="w-9 h-9 bg-empire-gold/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-empire-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-empire-text text-sm font-medium">{deliverable.label}</p>
      </div>
      <span className={cn('text-xs px-2 py-1 flex items-center gap-1.5', classes)}>
        <StatusIcon className="w-3 h-3" />
        {label}
      </span>
    </Link>
  )
}

export default function ClientDashboard() {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()

  const effectiveProfile = impersonatedClient ?? profile
  const clientId = effectiveProfile?.id ?? user?.id

  const { data: deliverables, isLoading } = useAllDeliverables(clientId)

  function getDeliverableStatus(type: DeliverableType): DeliverableStatus | null {
    if (!deliverables) return null
    return deliverables.find((d) => d.type === type)?.status ?? null
  }

  const firstName = effectiveProfile?.full_name?.split(' ')[0] ?? 'Cliente'

  return (
    <div className="p-8 space-y-8">
      {/* Welcome */}
      <div>
        <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Seu Ambiente</p>
        <h1 className="font-display text-3xl font-semibold text-empire-text">
          Olá, {firstName}
        </h1>
        <p className="text-empire-text/60 mt-1 text-sm">
          Acompanhe o progresso das suas entregas abaixo.
        </p>
      </div>

      {/* Phases */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-40 bg-empire-card animate-pulse rounded" />
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <div key={j} className="h-16 bg-empire-card border border-empire-border animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {PHASES.map(({ phase, label, deliverables: phaseDeliverables }) => (
            <div key={phase}>
              <h2 className="text-sm font-medium text-empire-text/60 uppercase tracking-wider mb-3">
                {label}
              </h2>
              <div className="space-y-2">
                {phaseDeliverables.map((d) => (
                  <DeliverableCard
                    key={`${d.type}-${d.href}`}
                    deliverable={d}
                    status={
                      d.type === 'diagnostic'
                        ? 'published' // diagnostic always accessible
                        : getDeliverableStatus(d.type as DeliverableType)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
