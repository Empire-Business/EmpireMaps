import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface NavItem {
  id: string
  label: string
}

interface DeliverableNavProps {
  items: NavItem[]
}

export function DeliverableNav({ items }: DeliverableNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return null

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <nav className="hidden xl:block w-48 flex-shrink-0">
      <div className="sticky top-8 space-y-1">
        <p className="text-xs text-empire-steel/30 uppercase tracking-widest mb-3">Índice</p>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={cn(
              'w-full text-left text-xs px-3 py-1.5 border-l-2 transition-colors leading-snug',
              activeId === item.id
                ? 'border-empire-gold text-empire-gold'
                : 'border-transparent text-empire-steel/40 hover:text-empire-steel/80 hover:border-empire-ghost'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
