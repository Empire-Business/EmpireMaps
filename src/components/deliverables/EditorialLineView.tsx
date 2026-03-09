import { Target, Layers, Clock, Radio } from 'lucide-react'

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

interface EditorialLineViewProps {
  data: EditorialLineData
}

export function EditorialLineView({ data }: EditorialLineViewProps) {
  const { objective, pillars, cadence, channels, content_formats, sections } = data

  return (
    <div className="space-y-8">
      {/* Objective */}
      {objective && (
        <div className="bg-empire-card border border-empire-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Objetivo Editorial</h2>
          </div>
          <p className="text-empire-text/70 leading-relaxed">{objective}</p>
        </div>
      )}

      {/* Pillars */}
      {pillars && pillars.length > 0 && (
        <div>
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
                      <span
                        key={fi}
                        className="text-xs bg-empire-gold/10 text-empire-gold px-2 py-0.5 border border-empire-gold/20"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cadence */}
      {cadence && (
        <div className="border border-empire-gold/20 bg-empire-gold/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-empire-gold" />
            <h2 className="font-display text-xl font-semibold text-empire-text">Cadência de Publicação</h2>
          </div>
          <p className="text-empire-text/70 leading-relaxed">{cadence}</p>
        </div>
      )}

      {/* Channels */}
      {channels && channels.length > 0 && (
        <div>
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

      {/* Content Formats */}
      {content_formats && content_formats.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold text-empire-text mb-4">
            Formatos de Conteúdo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content_formats.map((fmt, i) => (
              <div key={i} className="bg-empire-card border border-empire-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-empire-text text-sm">{fmt.name}</h3>
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

      {/* Sections */}
      {sections && sections.length > 0 && (
        <div className="space-y-6">
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
