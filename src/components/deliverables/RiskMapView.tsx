import { AlertTriangle, TrendingUp, Lightbulb, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Risk {
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

interface Opportunity {
  title: string
  description: string
  potential: string
}

interface Recommendation {
  title?: string
  text?: string
  description?: string
}

interface Highlight {
  title?: string
  text?: string
  description?: string
}

export interface RiskMapData {
  summary?: string
  risks?: Risk[]
  opportunities?: Opportunity[]
  recommendations?: (Recommendation | string)[]
  highlights?: (Highlight | string)[]
}

const SEVERITY_CONFIG: Record<Risk['severity'], { label: string; cardClass: string; badgeClass: string }> = {
  high: {
    label: 'Alto',
    cardClass: 'border-red-500/30 bg-red-500/5',
    badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30',
  },
  medium: {
    label: 'Médio',
    cardClass: 'border-yellow-500/30 bg-yellow-500/5',
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  },
  low: {
    label: 'Baixo',
    cardClass: 'border-emerald-500/30 bg-emerald-500/5',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
}

function normalizeText(item: Recommendation | string | Highlight): string {
  if (typeof item === 'string') return item
  return item.text ?? item.description ?? item.title ?? ''
}

interface RiskMapViewProps {
  data: RiskMapData
}

export function RiskMapView({ data }: RiskMapViewProps) {
  const { summary, risks, opportunities, recommendations, highlights } = data

  return (
    <div className="space-y-8">
      {/* Summary */}
      {summary && (
        <div className="bg-empire-card border border-empire-border p-6">
          <h2 className="font-display text-xl font-semibold text-empire-text mb-3">Sumário Executivo</h2>
          <p className="text-empire-text/70 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Risks */}
      {risks && risks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Riscos Identificados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk, i) => {
              const config = SEVERITY_CONFIG[risk.severity] ?? SEVERITY_CONFIG.medium
              return (
                <div key={i} className={cn('border p-4', config.cardClass)}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-empire-text">{risk.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 flex-shrink-0', config.badgeClass)}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-empire-text/60 text-sm leading-relaxed">{risk.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {opportunities && opportunities.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Oportunidades</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp, i) => (
              <div key={i} className="border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-empire-text">{opp.title}</h3>
                  {opp.potential && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                      {opp.potential}
                    </span>
                  )}
                </div>
                <p className="text-empire-text/60 text-sm leading-relaxed">{opp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Recomendações</h2>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 items-start bg-empire-card border border-empire-border p-4">
                <span className="text-empire-gold font-display text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-empire-text/70 text-sm leading-relaxed">{normalizeText(rec)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Destaques</h2>
          </div>
          <div className="space-y-2">
            {highlights.map((hl, i) => (
              <div key={i} className="flex gap-3 items-start bg-empire-gold/5 border border-empire-gold/20 p-4">
                <Star className="w-4 h-4 text-empire-gold flex-shrink-0 mt-0.5" />
                <p className="text-empire-text/70 text-sm leading-relaxed">{normalizeText(hl)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
