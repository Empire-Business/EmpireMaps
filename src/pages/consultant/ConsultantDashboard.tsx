import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, LogIn, ClipboardCheck, ClipboardList } from 'lucide-react'
import { useMyClients } from '@/hooks/useClients'
import { useDeliverablesMulti } from '@/hooks/useDeliverablesMulti'
import { useDiagnosticsMulti } from '@/hooks/useDiagnostic'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type DeliverableRow = Database['public']['Tables']['deliverables']['Row']
type DiagnosticRow = Database['public']['Tables']['client_diagnostics']['Row']

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
  diagnostic,
  onImpersonate,
}: {
  client: Profile
  deliverables: DeliverableRow[]
  diagnostic?: DiagnosticRow
  onImpersonate: () => void
}) {
  const published = deliverables.filter((d) => d.status === 'published').length
  const progress = Math.round((published / TOTAL_DELIVERABLES) * 100)

  return (
    <div className="bg-empire-surface rounded-lg border border-empire-ghost p-8 card-hover flex flex-col gap-4 cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-empire-gold/10 flex items-center justify-center text-empire-gold font-medium text-lg flex-shrink-0">
          {getInitials(client.full_name)}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-empire-ink truncate">
            {client.full_name ?? <span className="text-empire-steel/40 italic">Sem nome</span>}
          </h3>
          <p className="text-empire-steel/50 text-xs mt-0.5">
            {published}/{TOTAL_DELIVERABLES} entregáveis publicados
          </p>
          <div className="flex items-center gap-1 mt-1">
            {diagnostic?.is_locked ? (
              <span className="flex items-center gap-1 text-xs text-empire-success">
                <ClipboardCheck className="w-3 h-3" />
                Diagnóstico enviado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-empire-steel/30">
                <ClipboardList className="w-3 h-3" />
                Diagnóstico pendente
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-1.5 bg-empire-mist overflow-hidden">
          <div
            className="h-full bg-empire-gold transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-empire-steel/40 text-xs">Progresso</span>
          <span className="text-empire-gold text-xs">{progress}%</span>
        </div>
      </div>

      <button
        onClick={onImpersonate}
        className="flex items-center justify-center gap-2 text-sm text-empire-gold/80 hover:text-empire-gold border border-empire-gold/20 hover:border-empire-gold/50 py-2 rounded-sm transition-colors cursor-pointer"
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
  const { data: diagnosticsMap } = useDiagnosticsMulti(clientIds)

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
          <div className="section-label">Consultor</div>
          <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Meus Clientes</h1>
          {!isLoading && (
            <p className="text-empire-steel/60 mt-1 text-sm">
              {clients?.length ?? 0} cliente{(clients?.length ?? 0) !== 1 ? 's' : ''} vinculado{(clients?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-empire-steel/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="bg-empire-mist border border-empire-ghost text-empire-ink placeholder:text-empire-steel/30 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors w-56"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-empire-bone border border-empire-ghost animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="w-10 h-10 text-empire-steel/20 mx-auto mb-3" />
          {search ? (
            <p className="text-empire-steel/40">Nenhum cliente encontrado para &quot;{search}&quot;.</p>
          ) : (
            <>
              <p className="text-empire-steel/40">Você ainda não tem clientes vinculados.</p>
              <p className="text-empire-steel/30 text-sm mt-1">
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
              diagnostic={diagnosticsMap?.[client.id]}
              onImpersonate={() => handleImpersonate(client)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
