import { Target, Layers, Clock, Radio, FileText, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Database } from '@/integrations/supabase/types'

type ContentFormatRow = Database['public']['Tables']['content_formats']['Row']

interface Pillar {
  name: string
  description: string
  formats?: string[]
}

interface Channel {
  name: string
  strategy: string
}

interface ContentFormat {
  name: string
  description: string
  channel: string
}

interface Section {
  title: string
  content: string
}

export interface EditorialLineData {
  objective?: string
  pillars?: Pillar[]
  cadence?: string
  channels?: Channel[]
  content_formats?: ContentFormat[]
  sections?: Section[]
}

export function getEditorialLineNavItems(data: EditorialLineData) {
  const items = []
  if (data.objective) items.push({ id: 'el-objective', label: 'Objetivo' })
  if (data.pillars?.length) items.push({ id: 'el-pillars', label: 'Pilares' })
  if (data.cadence) items.push({ id: 'el-cadence', label: 'Cadência' })
  if (data.channels?.length) items.push({ id: 'el-channels', label: 'Canais' })
  if (data.content_formats?.length) items.push({ id: 'el-formats', label: 'Formatos' })
  if (data.sections?.length) items.push({ id: 'el-sections', label: 'Seções' })
  return items
}

interface EditorialLineViewProps {
  data: EditorialLineData
  formatBank?: ContentFormatRow[]
}

function FormatTag({ name, formatBank }: { name: string; formatBank?: ContentFormatRow[] }) {
  const match = formatBank?.find(
    (f) => f.name.toLowerCase() === name.toLowerCase() && f.status === 'active'
  )

  if (match) {
    return (
      <Link
        to="/client/banco-formatos"
        state={{ highlight: match.id }}
        className="inline-flex items-center gap-1 text-xs bg-empire-gold/15 text-empire-gold px-2 py-0.5 border border-empire-gold/30 hover:bg-empire-gold/25 transition-colors"
        title={`Ver "${match.name}" no Banco de Formatos`}
      >
        {name}
        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
      </Link>
    )
  }

  return (
    <span className="text-xs bg-empire-gold/10 text-empire-gold px-2 py-0.5 border border-empire-gold/20">
      {name}
    </span>
  )
}

export function EditorialLineView({ data, formatBank }: EditorialLineViewProps) {
  const { objective, pillars, cadence, channels, content_formats, sections } = data

  return (
    <div className="space-y-8">
      {objective && (
        <div id="el-objective" className="bg-empire-card border border-empire-border p-6 scroll-mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Objetivo Editorial</h2>
          </div>
          <p className="text-empire-text/70 leading-relaxed">{objective}</p>
        </div>
      )}

      {pillars && pillars.length > 0 && (
        <div id="el-pillars" className="scroll-mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Pilares de Conteúdo</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => (
              <div key={i} className="bg-empire-card border border-empire-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-empire-gold font-display text-2xl font-semibold">{i + 1}</span>
                  <h3 className="font-medium text-empire-text">{pillar.name}</h3>
                </div>
                <p className="text-empire-text/60 text-sm mb-3 leading-relaxed">{pillar.description}</p>
                {pillar.formats && pillar.formats.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.formats.map((f, fi) => (
                      <FormatTag key={fi} name={f} formatBank={formatBank} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cadence && (
        <div id="el-cadence" className="border border-empire-gold/20 bg-empire-gold/5 p-5 scroll-mt-8">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Cadência de Publicação</h2>
          </div>
          <p className="text-empire-text/70 leading-relaxed">{cadence}</p>
        </div>
      )}

      {channels && channels.length > 0 && (
        <div id="el-channels" className="scroll-mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Canais Estratégicos</h2>
          </div>
          <div className="space-y-3">
            {channels.map((channel, i) => (
              <div key={i} className="bg-empire-card border border-empire-border p-4 flex gap-4">
                <div className="w-24 flex-shrink-0">
                  <span className="text-empire-gold text-sm font-medium">{channel.name}</span>
                </div>
                <p className="text-empire-text/60 text-sm leading-relaxed">{channel.strategy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {content_formats && content_formats.length > 0 && (
        <div id="el-formats" className="scroll-mt-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Formatos de Conteúdo</h2>
          </div>
          {formatBank && formatBank.length > 0 && (
            <p className="text-xs text-empire-text/40 mb-3">
              Formatos destacados em <span className="text-empire-gold/60">dourado</span> estão disponíveis no Banco de Formatos — clique para ver.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content_formats.map((fmt, i) => (
              <div key={i} className="bg-empire-card border border-empire-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <FormatTag name={fmt.name} formatBank={formatBank} />
                  <span className="text-xs bg-empire-surface border border-empire-border text-empire-text/50 px-2 py-0.5">
                    {fmt.channel}
                  </span>
                </div>
                <p className="text-empire-text/60 text-sm leading-relaxed">{fmt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {sections && sections.length > 0 && (
        <div id="el-sections" className="space-y-6 scroll-mt-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-empire-card border border-empire-border p-6">
              <h2 className="font-display text-xl font-semibold text-empire-text mb-3">
                {section.title}
              </h2>
              <p className="text-empire-text/70 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
