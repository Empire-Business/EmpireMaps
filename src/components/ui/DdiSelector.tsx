import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export const DDI_LIST = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'EUA / Canadá' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+34', flag: '🇪🇸', name: 'Espanha' },
  { code: '+33', flag: '🇫🇷', name: 'França' },
  { code: '+49', flag: '🇩🇪', name: 'Alemanha' },
  { code: '+39', flag: '🇮🇹', name: 'Itália' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+57', flag: '🇨🇴', name: 'Colômbia' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguai' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguai' },
  { code: '+591', flag: '🇧🇴', name: 'Bolívia' },
  { code: '+593', flag: '🇪🇨', name: 'Equador' },
  { code: '+81', flag: '🇯🇵', name: 'Japão' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+91', flag: '🇮🇳', name: 'Índia' },
  { code: '+61', flag: '🇦🇺', name: 'Austrália' },
  { code: '+27', flag: '🇿🇦', name: 'África do Sul' },
  { code: '+971', flag: '🇦🇪', name: 'Emirados Árabes' },
]

interface DdiSelectorProps {
  value: string
  onChange: (code: string) => void
  disabled?: boolean
}

export function DdiSelector({ value, onChange, disabled }: DdiSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = DDI_LIST.find((d) => d.code === value) ?? DDI_LIST[0]

  const filtered = DDI_LIST.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.includes(search)
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 bg-empire-surface border border-empire-border text-empire-text px-3 py-2.5 text-sm',
          'focus:outline-none focus:border-empire-gold/50 transition-colors',
          'disabled:opacity-70 disabled:cursor-not-allowed',
          open && 'border-empire-gold/50'
        )}
      >
        <span>{selected.flag}</span>
        <span className="text-empire-text/70">{selected.code}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-empire-text/40 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-empire-card border border-empire-border shadow-xl">
          {/* Search */}
          <div className="p-2 border-b border-empire-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-empire-text/30" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar país..."
                className="w-full bg-empire-surface border border-empire-border text-empire-text placeholder:text-empire-text/30 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-empire-gold/50 transition-colors"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-empire-text/40 text-xs py-4">Nenhum resultado</p>
            ) : (
              filtered.map((ddi) => (
                <button
                  key={ddi.code}
                  type="button"
                  onClick={() => {
                    onChange(ddi.code)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors',
                    ddi.code === value
                      ? 'bg-empire-gold/10 text-empire-gold'
                      : 'text-empire-text/70 hover:bg-empire-surface hover:text-empire-text'
                  )}
                >
                  <span className="text-base">{ddi.flag}</span>
                  <span className="flex-1 text-xs">{ddi.name}</span>
                  <span className="text-xs text-empire-text/40">{ddi.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
