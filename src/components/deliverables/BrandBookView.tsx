import { CheckCircle2, XCircle } from 'lucide-react'

interface VoiceExample {
  correct?: string
  avoid?: string
  text?: string
  example?: string
}

interface Voice {
  tone: string
  examples?: (VoiceExample | string)[]
}

interface Section {
  title: string
  content: string
}

export interface BrandBookData {
  thesis?: string
  archetype?: string
  written_voice?: Voice
  spoken_voice?: Voice
  key_messages?: string[]
  positioning?: string
  sections?: Section[]
}

function VoiceExampleCard({ example }: { example: VoiceExample | string; index: number }) {
  if (typeof example === 'string') {
    return (
      <div className="bg-empire-card border border-empire-border p-3 text-sm text-empire-text/70">
        {example}
      </div>
    )
  }

  const hasCorrect = example.correct != null
  const hasAvoid = example.avoid != null

  if (hasCorrect || hasAvoid) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hasCorrect && (
          <div className="border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Correto</span>
            </div>
            <p className="text-empire-text/70 text-sm italic">&ldquo;{example.correct}&rdquo;</p>
          </div>
        )}
        {hasAvoid && (
          <div className="border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-400 font-medium">Evitar</span>
            </div>
            <p className="text-empire-text/70 text-sm italic">&ldquo;{example.avoid}&rdquo;</p>
          </div>
        )}
      </div>
    )
  }

  const text = example.text ?? example.example ?? JSON.stringify(example)
  return (
    <div className="bg-empire-card border border-empire-border p-3 text-sm text-empire-text/70">
      {text}
    </div>
  )
}

function VoiceSection({ title, voice }: { title: string; voice: Voice }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-empire-text">{title}</h3>
        <span className="text-xs bg-empire-surface border border-empire-border text-empire-text/60 px-3 py-1">
          {voice.tone}
        </span>
      </div>
      {voice.examples && voice.examples.length > 0 && (
        <div className="space-y-2">
          {voice.examples.map((ex, i) => (
            <VoiceExampleCard key={i} example={ex} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export function getBrandBookNavItems(data: BrandBookData) {
  const items = []
  if (data.thesis) items.push({ id: 'bb-thesis', label: 'Tese da Marca' })
  if (data.archetype) items.push({ id: 'bb-archetype', label: 'Arquétipo' })
  if (data.positioning) items.push({ id: 'bb-positioning', label: 'Posicionamento' })
  if (data.written_voice || data.spoken_voice) items.push({ id: 'bb-voice', label: 'Tom de Voz' })
  if (data.key_messages?.length) items.push({ id: 'bb-messages', label: 'Mensagens-Chave' })
  if (data.sections?.length) items.push({ id: 'bb-sections', label: 'Seções' })
  return items
}

interface BrandBookViewProps {
  data: BrandBookData
}

export function BrandBookView({ data }: BrandBookViewProps) {
  const { thesis, archetype, written_voice, spoken_voice, key_messages, positioning, sections } = data

  return (
    <div className="space-y-8">
      {/* Thesis */}
      {thesis && (
        <div id="bb-thesis" className="bg-empire-card border border-empire-border p-6 scroll-mt-8">
          <h2 className="font-display text-xl font-semibold text-empire-text mb-3">Tese da Marca</h2>
          <p className="text-empire-text/70 leading-relaxed text-lg italic">&ldquo;{thesis}&rdquo;</p>
        </div>
      )}

      {/* Archetype - Gold highlight */}
      {archetype && (
        <div id="bb-archetype" className="border border-empire-gold/30 bg-empire-gold/5 p-6 scroll-mt-8">
          <p className="text-empire-gold text-xs tracking-widest uppercase mb-2">Arquétipo de Marca</p>
          <h2 className="font-display text-3xl font-semibold text-empire-text">{archetype}</h2>
        </div>
      )}

      {/* Positioning */}
      {positioning && (
        <div id="bb-positioning" className="bg-empire-card border border-empire-border p-6 scroll-mt-8">
          <h2 className="font-display text-xl font-semibold text-empire-text mb-3">Posicionamento</h2>
          <p className="text-empire-text/70 leading-relaxed">{positioning}</p>
        </div>
      )}

      {/* Voice */}
      {(written_voice || spoken_voice) && (
        <div id="bb-voice" className="space-y-6 scroll-mt-8">
          <h2 className="font-display text-xl font-semibold text-empire-text">Tom de Voz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {written_voice && (
              <div className="bg-empire-card border border-empire-border p-5">
                <VoiceSection title="Voz Escrita" voice={written_voice} />
              </div>
            )}
            {spoken_voice && (
              <div className="bg-empire-card border border-empire-border p-5">
                <VoiceSection title="Voz Falada" voice={spoken_voice} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Messages */}
      {key_messages && key_messages.length > 0 && (
        <div id="bb-messages" className="scroll-mt-8">
          <h2 className="font-display text-xl font-semibold text-empire-text mb-4">
            Mensagens-Chave
          </h2>
          <div className="space-y-2">
            {key_messages.map((msg, i) => (
              <div
                key={i}
                className="flex gap-3 items-center bg-empire-card border border-empire-border px-5 py-3"
              >
                <span className="text-empire-gold font-display text-sm flex-shrink-0">{i + 1}.</span>
                <p className="text-empire-text/70 text-sm">{msg}</p>
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
