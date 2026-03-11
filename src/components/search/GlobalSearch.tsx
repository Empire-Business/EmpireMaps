import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Library, Kanban, FileText, Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'format' | 'card' | 'deliverable'
  title: string
  subtitle?: string
  href: string
}

const TYPE_ICONS = {
  format: Library,
  card: Kanban,
  deliverable: FileText,
}

const TYPE_LABELS = {
  format: 'Formato',
  card: 'Card',
  deliverable: 'Entregável',
}

const DELIVERABLE_LABELS: Record<string, string> = {
  risk_map: 'Mapa de Riscos',
  brand_book: 'Brand Book',
  editorial_line: 'Linha Editorial',
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const debouncedQuery = useDebounce(query, 250)

  const clientId = (impersonatedClient ?? profile)?.id ?? user?.id

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const pattern = `%${q}%`
      const found: SearchResult[] = []

      // Search formats
      const { data: formats } = await supabase
        .from('content_formats')
        .select('id, name, description, platforms')
        .eq('status', 'active')
        .or(`name.ilike.${pattern},description.ilike.${pattern}`)
        .limit(5)

      for (const f of formats ?? []) {
        found.push({
          id: f.id,
          type: 'format',
          title: f.name,
          subtitle: f.platforms?.join(', '),
          href: '/client/banco-formatos',
        })
      }

      // Search content cards (only if clientId available)
      if (clientId) {
        const { data: cards } = await supabase
          .from('content_cards')
          .select('id, title, channel, status')
          .eq('client_id', clientId)
          .or(`title.ilike.${pattern},description.ilike.${pattern}`)
          .limit(5)

        for (const c of cards ?? []) {
          found.push({
            id: c.id,
            type: 'card',
            title: c.title,
            subtitle: [c.channel, c.status].filter(Boolean).join(' · '),
            href: '/client/mapa-producao',
          })
        }

        // Search deliverables
        const { data: deliverables } = await supabase
          .from('deliverables')
          .select('id, type, status')
          .eq('client_id', clientId)
          .eq('status', 'published')

        for (const d of deliverables ?? []) {
          const label = DELIVERABLE_LABELS[d.type] ?? d.type
          if (label.toLowerCase().includes(q.toLowerCase())) {
            const hrefMap: Record<string, string> = {
              risk_map: '/client/mapa-riscos',
              brand_book: '/client/brand-book',
              editorial_line: '/client/linha-editorial',
            }
            found.push({
              id: d.id,
              type: 'deliverable',
              title: label,
              subtitle: 'Entregável publicado',
              href: hrefMap[d.type] ?? '/client/dashboard',
            })
          }
        }
      }

      setResults(found)
      setSelectedIndex(0)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
    }
  }, [open])

  function handleSelect(result: SearchResult) {
    navigate(result.href)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) handleSelect(results[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-empire-surface rounded-lg border border-empire-ghost shadow-empire-xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-empire-ghost">
          {loading ? (
            <Loader2 className="w-4 h-4 text-empire-steel/40 flex-shrink-0 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-empire-steel/40 flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar formatos, cards, entregáveis..."
            className="flex-1 bg-transparent text-empire-ink placeholder:text-empire-steel/30 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]) }}
              className="text-empire-steel/30 hover:text-empire-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-empire-steel/30 bg-empire-mist border border-empire-ghost px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((result, i) => {
              const Icon = TYPE_ICONS[result.type]
              return (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      i === selectedIndex
                        ? 'bg-empire-gold/10 text-empire-ink'
                        : 'text-empire-steel/80 hover:bg-empire-mist'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4 flex-shrink-0',
                      i === selectedIndex ? 'text-empire-gold' : 'text-empire-steel/30'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-empire-steel/40 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 border flex-shrink-0',
                      i === selectedIndex
                        ? 'bg-empire-gold/20 border-empire-gold/30 text-empire-gold'
                        : 'bg-empire-mist border-empire-ghost text-empire-steel/30'
                    )}>
                      {TYPE_LABELS[result.type]}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* Empty state */}
        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-empire-steel/40 text-sm">Nenhum resultado para "{query}"</p>
          </div>
        )}

        {/* Hint */}
        {!query && (
          <div className="py-6 px-4 text-center">
            <p className="text-empire-steel/30 text-xs">
              Digite para buscar formatos, cards de conteúdo e entregáveis.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-empire-ghost px-4 py-2 flex items-center gap-4 text-xs text-empire-steel/30">
          <span className="flex items-center gap-1">
            <kbd className="bg-empire-mist border border-empire-ghost px-1 py-0.5">↑↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-empire-mist border border-empire-ghost px-1 py-0.5">Enter</kbd>
            abrir
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-empire-mist border border-empire-ghost px-1 py-0.5">Esc</kbd>
            fechar
          </span>
        </div>
      </div>
    </div>
  )
}
