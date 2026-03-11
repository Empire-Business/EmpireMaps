import { useState, useMemo } from 'react'
import { Search, Library, X, ExternalLink, Clock } from 'lucide-react'
import { useContentFormats } from '@/hooks/useContentFormats'
import { useRecentFormats } from '@/hooks/useRecentFormats'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type ContentFormat = Database['public']['Tables']['content_formats']['Row']

const ALL_PLATFORMS = 'Todos'

// ---- Format Drawer ----
interface FormatDrawerProps {
  format: ContentFormat
  onClose: () => void
}

function FormatDrawer({ format, onClose }: FormatDrawerProps) {
  const howToLines = format.how_to
    ? format.how_to.split('\n').filter((l) => l.trim())
    : []

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="flex-1 bg-black/50"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="w-full max-w-md bg-empire-mist border-l border-empire-ghost flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-empire-ghost flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-empire-ink">{format.name}</h2>
            {format.platforms && format.platforms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {format.platforms.map((p) => (
                  <span key={p} className="text-xs bg-empire-gold/10 text-empire-gold px-2 py-0.5">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-empire-steel/40 hover:text-empire-ink transition-colors flex-shrink-0 mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {format.description && (
            <div>
              <h3 className="text-xs text-empire-steel/50 uppercase tracking-wider mb-2">Descrição</h3>
              <p className="text-empire-steel/80 text-sm leading-relaxed">{format.description}</p>
            </div>
          )}

          {howToLines.length > 0 && (
            <div>
              <h3 className="text-xs text-empire-steel/50 uppercase tracking-wider mb-3">Como fazer</h3>
              <ol className="space-y-2">
                {howToLines.map((line, i) => {
                  const cleaned = line.replace(/^\d+\.\s*/, '').trim()
                  return (
                    <li key={i} className="flex gap-3 text-sm text-empire-steel/80">
                      <span className="text-empire-gold font-medium flex-shrink-0">{i + 1}.</span>
                      {cleaned}
                    </li>
                  )
                })}
              </ol>
            </div>
          )}

          {format.tips && format.tips.length > 0 && (
            <div>
              <h3 className="text-xs text-empire-steel/50 uppercase tracking-wider mb-3">Dicas</h3>
              <ul className="space-y-2">
                {format.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-empire-steel/80">
                    <span className="text-empire-gold mt-1 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {format.tags && format.tags.length > 0 && (
            <div>
              <h3 className="text-xs text-empire-steel/50 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {format.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-empire-bone border border-empire-ghost text-empire-steel/50 px-2 py-0.5">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(format.examples) && format.examples.length > 0 && (
            <div>
              <h3 className="text-xs text-empire-steel/50 uppercase tracking-wider mb-3">Exemplos e Referências</h3>
              <div className="space-y-2">
                {(format.examples as { url: string; label: string }[]).map((ex, i) => (
                  <a
                    key={i}
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-empire-gold/80 hover:text-empire-gold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    {ex.label || ex.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Format Card ----
function FormatCard({
  format,
  onClick,
}: {
  format: ContentFormat
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-empire-surface rounded-lg border border-empire-ghost p-0 text-left card-hover group w-full overflow-hidden cursor-pointer"
    >
      {/* Thumbnail placeholder */}
      <div className="h-36 bg-empire-mist flex items-center justify-center">
        {format.thumbnail_url ? (
          <img
            src={format.thumbnail_url}
            alt={format.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Library className="w-8 h-8 text-empire-ink/20" />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-empire-ink text-sm mb-2 group-hover:text-empire-gold transition-colors">
          {format.name}
        </h3>

        {format.platforms && format.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {format.platforms.slice(0, 3).map((p) => (
              <span key={p} className="text-xs bg-empire-gold/10 text-empire-gold/80 px-1.5 py-0.5">
                {p}
              </span>
            ))}
            {format.platforms.length > 3 && (
              <span className="text-xs text-empire-steel/40">+{format.platforms.length - 3}</span>
            )}
          </div>
        )}

        {format.tags && format.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {format.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-empire-steel/40">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

// ---- Main Page ----
export default function FormatLibraryPage() {
  const { data: formats, isLoading } = useContentFormats()
  const { getRecent, trackView } = useRecentFormats()
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat | null>(null)
  const [activePlatform, setActivePlatform] = useState<string>(ALL_PLATFORMS)
  const [search, setSearch] = useState('')

  const recentIds = useMemo(() => getRecent(), [selectedFormat]) // re-evaluate when drawer closes
  const recentFormats = useMemo(
    () => recentIds.map((id) => formats?.find((f) => f.id === id)).filter(Boolean) as ContentFormat[],
    [recentIds, formats]
  )

  function handleOpenFormat(format: ContentFormat) {
    trackView(format.id)
    setSelectedFormat(format)
  }

  const allPlatforms = useMemo(() => {
    const set = new Set<string>()
    for (const fmt of formats ?? []) {
      for (const p of fmt.platforms ?? []) {
        set.add(p)
      }
    }
    return [ALL_PLATFORMS, ...Array.from(set).sort()]
  }, [formats])

  const filtered = useMemo(() => {
    let list = formats ?? []
    if (activePlatform !== ALL_PLATFORMS) {
      list = list.filter((f) => f.platforms?.includes(activePlatform))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((f) => f.name.toLowerCase().includes(q))
    }
    return list
  }, [formats, activePlatform, search])

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="section-label">Referência</div>
        <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Banco de Formatos</h1>
        <p className="text-empire-steel/60 mt-1 text-sm">
          Explore os formatos de conteúdo disponíveis para sua estratégia.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Platform Tabs */}
        <div className="flex flex-wrap gap-1 bg-empire-mist border border-empire-ghost p-1">
          {allPlatforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className={cn(
                'px-3 py-1.5 text-xs transition-colors',
                activePlatform === platform
                  ? 'bg-empire-gold/10 text-empire-gold'
                  : 'text-empire-steel/60 hover:text-empire-ink'
              )}
            >
              {platform}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-empire-steel/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar formato..."
            className="bg-empire-mist border border-empire-ghost text-empire-ink placeholder:text-empire-steel/30 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors w-56"
          />
        </div>
      </div>

      {/* Recentemente vistos */}
      {!isLoading && recentFormats.length > 0 && !search && activePlatform === ALL_PLATFORMS && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-empire-steel/40" />
            <span className="text-xs text-empire-steel/40 uppercase tracking-wider">Recentemente vistos</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleOpenFormat(format)}
                className="flex items-center gap-1.5 bg-empire-mist border border-empire-ghost px-3 py-1.5 text-xs text-empire-steel/60 hover:text-empire-gold hover:border-empire-gold/30 transition-colors"
              >
                <Library className="w-3 h-3" />
                {format.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 bg-empire-bone border border-empire-ghost animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Library className="w-10 h-10 text-empire-ink/20 mx-auto mb-3" />
          <p className="text-empire-steel/40">Nenhum formato encontrado.</p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-empire-gold/70 text-sm mt-2 hover:text-empire-gold transition-colors"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((format) => (
            <FormatCard
              key={format.id}
              format={format}
              onClick={() => handleOpenFormat(format)}
            />
          ))}
        </div>
      )}

      {selectedFormat && (
        <FormatDrawer
          format={selectedFormat}
          onClose={() => setSelectedFormat(null)}
        />
      )}
    </div>
  )
}
