import { AlertTriangle, TrendingUp, Lightbulb, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RiskDimension {
  id: string
  label: string
  score: number
  justificativa: string
  evidencias?: string[]
  recomendacao: string
}

// New scored format
interface RiskMapDataNew {
  perfil_resumo?: string
  dimensoes: RiskDimension[]
  score_global: number
  veredito?: string
  prioridades?: string[]
}

// Legacy format (backward compat)
interface LegacyRisk {
  title: string
  description: string
  severity?: 'high' | 'medium' | 'low'
  probability?: string
  impact?: string
  category?: string
  mitigation?: string
}
interface LegacyOpportunity { title: string; description: string; potential?: string }
interface LegacyItem { title?: string; text?: string; description?: string }

interface RiskMapDataLegacy {
  summary?: string
  risks?: LegacyRisk[]
  opportunities?: LegacyOpportunity[]
  recommendations?: (LegacyItem | string)[]
  highlights?: (LegacyItem | string)[]
}

export type RiskMapData = RiskMapDataNew | RiskMapDataLegacy

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isNewFormat(data: RiskMapData): data is RiskMapDataNew {
  return 'dimensoes' in data && Array.isArray((data as RiskMapDataNew).dimensoes)
}

interface ScoreConfig {
  label: string
  tag: string
  hex: string
  text: string
  bg: string
  border: string
  borderLeft: string
}

function getScoreConfig(score: number): ScoreConfig {
  if (score >= 4)  return {
    label: 'Baixo Risco', tag: 'OK',
    hex: '#34d399',
    text: 'text-emerald-400', bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20', borderLeft: 'border-l-emerald-500/60',
  }
  if (score >= 2.5) return {
    label: 'Atenção', tag: 'ATENÇÃO',
    hex: '#fbbf24',
    text: 'text-amber-400', bg: 'bg-amber-500/10',
    border: 'border-amber-500/20', borderLeft: 'border-l-amber-500/60',
  }
  return {
    label: 'Crítico', tag: 'CRÍTICO',
    hex: '#f87171',
    text: 'text-red-400', bg: 'bg-red-500/10',
    border: 'border-red-500/20', borderLeft: 'border-l-red-500/60',
  }
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────

function RadarChart({ dimensoes }: { dimensoes: RiskDimension[] }) {
  const cx = 140, cy = 140, r = 100, n = dimensoes.length
  const angles = dimensoes.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2)
  const toXY = (a: number, radius: number) => ({
    x: cx + radius * Math.cos(a),
    y: cy + radius * Math.sin(a),
  })

  const gridLevels = [1, 2, 3, 4, 5]
  const gridPolygons = gridLevels.map(lvl =>
    angles.map(a => toXY(a, (r * lvl) / 5)).map(p => `${p.x},${p.y}`).join(' ')
  )

  const dataPoints = dimensoes.map((d, i) => toXY(angles[i], (r * Math.min(d.score, 5)) / 5))
  const dataPoly = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  const labelRadius = r + 28
  const labelPositions = angles.map(a => toXY(a, labelRadius))

  return (
    <svg width="280" height="280" viewBox="0 0 280 280" className="shrink-0">
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#c9a84c" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.03" />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Grid lines */}
      {angles.map((a, i) => {
        const end = toXY(a, r)
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}

      {/* Score reference marks on center line */}
      {[1,2,3,4].map(lvl => (
        <circle key={lvl} cx={cx} cy={cy - (r * lvl) / 5} r="1.5" fill="rgba(255,255,255,0.15)" />
      ))}

      {/* Data polygon */}
      <polygon points={dataPoly} fill="url(#radarGrad)" stroke="#c9a84c" strokeWidth="2" opacity="0.9" />

      {/* Data points */}
      {dataPoints.map((p, i) => {
        const cfg = getScoreConfig(dimensoes[i].score)
        return (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill={cfg.hex} stroke="#0a0a0a" strokeWidth="2" />
        )
      })}

      {/* Labels */}
      {labelPositions.map((p, i) => {
        const label = dimensoes[i].label
        const words = label.split(' ')
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="8.5" fontFamily="'DM Sans', sans-serif" fill="rgba(245,245,240,0.45)"
            fontWeight="700" letterSpacing="0.3">
            {words.length > 1 ? (
              <>
                <tspan x={p.x} dy="-5">{words[0]}</tspan>
                <tspan x={p.x} dy="11">{words.slice(1).join(' ')}</tspan>
              </>
            ) : label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Dimension icons ──────────────────────────────────────────────────────────

const DIMENSION_ICONS: Record<string, string> = {
  posicionamento: '◎',
  autoridade_percebida: '◈',
  fit_audiencia_oferta: '◐',
  maturidade_comercial: '◑',
  risco_reposicionamento: '◒',
}

function getDimIcon(id: string) {
  return DIMENSION_ICONS[id] ?? '◉'
}

// ─── Dimension Score Bar ───────────────────────────────────────────────────────

function DimensionScoreBar({ dim }: { dim: RiskDimension }) {
  const cfg = getScoreConfig(dim.score)
  const pct = (dim.score / 5) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-empire-steel font-medium">
          <span className="mr-1.5 opacity-60">{getDimIcon(dim.id)}</span>
          {dim.label}
        </span>
        <div className="flex items-center gap-2">
          <span className={cn('font-mono text-sm font-bold', cfg.text)}>{dim.score.toFixed(1)}</span>
          <span className={cn('text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 border', cfg.text, cfg.bg, cfg.border)}>
            {cfg.tag}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-empire-mist rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: cfg.hex }}
        />
      </div>
    </div>
  )
}

// ─── Dimension Card ────────────────────────────────────────────────────────────

function DimensionCard({ dim }: { dim: RiskDimension }) {
  const cfg = getScoreConfig(dim.score)

  return (
    <div className={cn(
      'bg-empire-bone border border-empire-ghost border-l-4 p-6',
      cfg.borderLeft
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl opacity-50" style={{ color: cfg.hex }}>{getDimIcon(dim.id)}</span>
          <h3 className="font-display text-lg font-semibold text-empire-ink">{dim.label}</h3>
        </div>
        <div className="text-right shrink-0">
          <div className={cn('font-display text-3xl font-semibold leading-none', cfg.text)}>
            {dim.score.toFixed(1)}
          </div>
          <div className={cn('font-mono text-[9px] tracking-widest mt-0.5', cfg.text)}>
            {cfg.label.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Justificativa */}
      <p className="text-empire-steel/60 text-sm leading-relaxed mb-4">{dim.justificativa}</p>

      {/* Evidências */}
      {dim.evidencias && dim.evidencias.length > 0 && (
        <div className="mb-4">
          <div className="font-mono text-[9px] text-empire-steel/30 tracking-widest uppercase mb-2">
            Evidências dos dados
          </div>
          <div className="space-y-1.5">
            {dim.evidencias.map((ev, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className={cn('text-xs shrink-0 mt-0.5', cfg.text)}>▸</span>
                <span className="text-empire-steel/50 text-sm leading-relaxed">{ev}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendação */}
      <div className={cn('border rounded-sm px-4 py-3', cfg.bg, cfg.border)}>
        <div className={cn('font-mono text-[9px] tracking-widest uppercase font-bold mb-1.5', cfg.text)}>
          O que fazer agora
        </div>
        <p className="text-empire-steel text-sm leading-relaxed">{dim.recomendacao}</p>
      </div>
    </div>
  )
}

// ─── Nav items ────────────────────────────────────────────────────────────────

export function getRiskMapNavItems(data: RiskMapData) {
  if (isNewFormat(data)) {
    const items = [{ id: 'rm-overview', label: 'Visão Geral' }]
    data.dimensoes.forEach(d => items.push({ id: `rm-dim-${d.id}`, label: d.label }))
    if (data.veredito) items.push({ id: 'rm-veredito', label: 'Veredito' })
    return items
  }

  // Legacy
  const legacy = data as RiskMapDataLegacy
  const items = []
  if (legacy.summary) items.push({ id: 'rm-summary', label: 'Sumário' })
  if (legacy.risks?.length) items.push({ id: 'rm-risks', label: 'Riscos' })
  if (legacy.opportunities?.length) items.push({ id: 'rm-opportunities', label: 'Oportunidades' })
  if (legacy.recommendations?.length) items.push({ id: 'rm-recommendations', label: 'Recomendações' })
  if (legacy.highlights?.length) items.push({ id: 'rm-highlights', label: 'Destaques' })
  return items
}

// ─── New Format View ──────────────────────────────────────────────────────────

function RiskMapViewNew({ data }: { data: RiskMapDataNew }) {
  const globalCfg = getScoreConfig(data.score_global)

  return (
    <div className="space-y-6">
      {/* Overview — radar + score bars */}
      <div id="rm-overview" className="bg-empire-surface rounded-lg border border-empire-ghost p-6 scroll-mt-8">
        {data.perfil_resumo && (
          <p className="text-empire-steel/50 text-sm italic mb-6 leading-relaxed border-l-2 border-empire-gold/30 pl-4">
            {data.perfil_resumo}
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          {/* Radar */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <RadarChart dimensoes={data.dimensoes} />
            {/* Global score */}
            <div className={cn(
              'flex flex-col items-center gap-1 px-6 py-3 border',
              globalCfg.bg, globalCfg.border
            )}>
              <span className={cn('font-mono text-[9px] tracking-widest uppercase font-bold', globalCfg.text)}>
                Score Global
              </span>
              <span className={cn('font-display text-4xl font-semibold', globalCfg.text)}>
                {data.score_global.toFixed(1)}
              </span>
              <span className={cn('font-mono text-[9px] tracking-widest', globalCfg.text)}>
                {globalCfg.label.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Score bars */}
          <div className="flex-1 w-full space-y-4 min-w-0">
            <div className="font-mono text-[9px] text-empire-steel/30 tracking-widest uppercase mb-4">
              Pontuação por dimensão
            </div>
            {data.dimensoes.map(dim => (
              <DimensionScoreBar key={dim.id} dim={dim} />
            ))}
          </div>
        </div>
      </div>

      {/* Dimension cards */}
      {data.dimensoes.map((dim) => (
        <div key={dim.id} id={`rm-dim-${dim.id}`} className="scroll-mt-8">
          <DimensionCard dim={dim} />
        </div>
      ))}

      {/* Veredito + Prioridades */}
      {(data.veredito || (data.prioridades && data.prioridades.length > 0)) && (
        <div id="rm-veredito" className={cn(
          'border p-6 scroll-mt-8',
          globalCfg.bg, globalCfg.border
        )}>
          <div className={cn('font-mono text-[9px] tracking-widest uppercase font-bold mb-4', globalCfg.text)}>
            Veredito Final
          </div>

          {data.veredito && (
            <p className="font-display text-xl font-semibold text-empire-ink leading-snug mb-6">
              {data.veredito}
            </p>
          )}

          {data.prioridades && data.prioridades.length > 0 && (
            <>
              <div className="font-mono text-[9px] text-empire-steel/30 tracking-widest uppercase mb-3">
                Prioridades de ação
              </div>
              <div className="space-y-3">
                {data.prioridades.map((p, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className={cn(
                      'font-mono text-xs font-bold px-2 py-0.5 shrink-0',
                      globalCfg.text, globalCfg.bg, globalCfg.border, 'border'
                    )}>
                      {i + 1}
                    </span>
                    <span className="text-empire-steel/80 text-sm leading-relaxed">{p}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Legacy View ──────────────────────────────────────────────────────────────

function normalizeText(item: LegacyItem | string): string {
  if (typeof item === 'string') return item
  return item.text ?? item.description ?? item.title ?? ''
}

const SEVERITY_CONFIG: Record<string, { label: string; cardClass: string; badgeClass: string }> = {
  high:   { label: 'Alto',  cardClass: 'border-red-500/30 bg-red-500/5',     badgeClass: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  medium: { label: 'Médio', cardClass: 'border-yellow-500/30 bg-yellow-500/5', badgeClass: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  low:    { label: 'Baixo', cardClass: 'border-emerald-500/30 bg-emerald-500/5', badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
}

function RiskMapViewLegacy({ data }: { data: RiskMapDataLegacy }) {
  const { summary, risks, opportunities, recommendations, highlights } = data
  return (
    <div className="space-y-8">
      {summary && (
        <div id="rm-summary" className="bg-empire-surface rounded-lg border border-empire-ghost p-6 scroll-mt-8">
          <h2 className="font-display text-xl font-semibold text-empire-ink mb-3">Sumário Executivo</h2>
          <p className="text-empire-steel/80 leading-relaxed">{summary}</p>
        </div>
      )}
      {risks && risks.length > 0 && (
        <div id="rm-risks" className="scroll-mt-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-display text-xl font-semibold text-empire-ink">Riscos Identificados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk, i) => {
              const sev = risk.severity ?? (risk.impact === 'high' || risk.probability === 'high' ? 'high' : 'medium')
              const config = SEVERITY_CONFIG[sev] ?? SEVERITY_CONFIG.medium
              return (
                <div key={i} className={cn('border p-4', config.cardClass)}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-empire-ink">{risk.title}</h3>
                    <span className={cn('text-xs px-2 py-0.5 flex-shrink-0', config.badgeClass)}>{config.label}</span>
                  </div>
                  <p className="text-empire-steel/60 text-sm leading-relaxed">{risk.description}</p>
                  {risk.mitigation && (
                    <p className="text-empire-steel/40 text-xs mt-2 leading-relaxed italic">{risk.mitigation}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      {opportunities && opportunities.length > 0 && (
        <div id="rm-opportunities" className="scroll-mt-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display text-xl font-semibold text-empire-ink">Oportunidades</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp, i) => (
              <div key={i} className="border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-empire-ink">{opp.title}</h3>
                  {opp.potential && <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">{opp.potential}</span>}
                </div>
                <p className="text-empire-steel/60 text-sm leading-relaxed">{opp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {recommendations && recommendations.length > 0 && (
        <div id="rm-recommendations" className="scroll-mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-ink">Recomendações</h2>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 items-start bg-empire-bone border border-empire-ghost p-4">
                <span className="text-empire-gold font-display text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-empire-steel/80 text-sm leading-relaxed">{normalizeText(rec)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {highlights && highlights.length > 0 && (
        <div id="rm-highlights" className="scroll-mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-ink">Destaques</h2>
          </div>
          <div className="space-y-2">
            {highlights.map((hl, i) => (
              <div key={i} className="flex gap-3 items-start bg-empire-gold/5 border border-empire-gold/20 p-4">
                <Star className="w-4 h-4 text-empire-gold flex-shrink-0 mt-0.5" />
                <p className="text-empire-steel/80 text-sm leading-relaxed">{normalizeText(hl)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface RiskMapViewProps {
  data: RiskMapData
}

export function RiskMapView({ data }: RiskMapViewProps) {
  if (isNewFormat(data)) return <RiskMapViewNew data={data} />
  return <RiskMapViewLegacy data={data as RiskMapDataLegacy} />
}
