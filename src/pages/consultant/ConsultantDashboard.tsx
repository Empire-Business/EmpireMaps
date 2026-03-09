import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, LogIn } from 'lucide-react'
import { useMyClients } from '@/hooks/useClients'
import { useDeliverablesMulti } from '@/hooks/useDeliverablesMulti'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type DeliverableRow = Database['public']['Tables']['deliverables']['Row']

const TOTAL_DELIVERABLES = 3 // risk_map, brand_book, editorial_line

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
}

function ClientCard({
  client,
  deliverables,
  onImpersonate,
}: {
  client: Profile
  deliverables: DeliverableRow[]
  onImpersonate: () => void
}) {
  const published = deliverables.filter((d) => d.status === 'published').length
  const progress = Math.round((published / TOTAL_DELIVERABLES) * 100)

  return (
    <div className="bg-empire-card border border-empire-border p-6 card-hover flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-empire-gold/10 flex items-center justify-center text-empire-gold font-medium text-lg flex-shrink-0">
          {getInitials(client.full_name)}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-empire-text truncate">
            {client.full_name ?? <span className="text-empire-text/40 italic">Sem nome</span>}
          </h3>
          <p className="text-empire-text/50 text-xs mt-0.5">
            {published}/{TOTAL_DELIVERABLES} entregáveis publicados
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-1.5 bg-empire-surface overflow-hidden">
          <div
            className="h-full bg-empire-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-empire-text/40 text-xs">Progresso</span>
          <span className="text-empire-gold text-xs">{progress}%</span>
        </div>
      </div>

      <button
        onClick={onImpersonate}
        className="flex items-center justify-center gap-2 text-sm text-empire-gold/80 hover:text-empire-gold border border-empire-gold/20 hover:border-empire-gold/50 py-2 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Entrar como cliente
      </button>
    </div>
  )
}

export default function ConsultantDashboard() {
  const navigate = useNavigate()
  const { data: clients, isLoading } = useMyClients()
  const { startImpersonation } = useImpersonation()
  const [search, setSearch] = useState('')

  const clientIds = useMemo(() => clients?.map((c) => c.id) ?? [], [clients])
  const { data: deliverablesMap } = useDeliverablesMulti(clientIds)

  const filtered = useMemo(() => {
    if (!clients) return []
    if (!search.trim()) return clients
    const q = search.toLowerCase()
    return clients.filter((c) => c.full_name?.toLowerCase().includes(q))
  }, [clients, search])

  async function handleImpersonate(client: Profile) {
    await startImpersonation(client)
    navigate('/client/dashboard')
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Consultor</p>
          <h1 className="font-display text-3xl font-semibold text-empire-text">Meus Clientes</h1>
          {!isLoading && (
            <p className="text-empire-text/60 mt-1 text-sm">
              {clients?.length ?? 0} cliente{(clients?.length ?? 0) !== 1 ? 's' : ''} vinculado{(clients?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-empire-text/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="bg-empire-surface border border-empire-border text-empire-text placeholder:text-empire-text/30 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors w-56"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-empire-card border border-empire-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="w-10 h-10 text-empire-text/20 mx-auto mb-3" />
          {search ? (
            <p className="text-empire-text/40">Nenhum cliente encontrado para &quot;{search}&quot;.</p>
          ) : (
            <>
              <p className="text-empire-text/40">Você ainda não tem clientes vinculados.</p>
              <p className="text-empire-text/30 text-sm mt-1">
                Solicite ao administrador que vincule clientes à sua conta.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              deliverables={deliverablesMap?.[client.id] ?? []}
              onImpersonate={() => handleImpersonate(client)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
