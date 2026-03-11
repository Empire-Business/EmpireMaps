import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, UserCog, Activity, ClipboardList } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { formatDateTime } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ImpersonationLog = Database['public']['Tables']['impersonation_logs']['Row']
type DiagnosticRow = Database['public']['Tables']['client_diagnostics']['Row']

interface ImpersonationLogWithProfiles extends ImpersonationLog {
  consultant: Profile | null
  client: Profile | null
}

interface DiagnosticWithProfile extends DiagnosticRow {
  profile: Profile | null
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value: number
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <div className="bg-empire-surface rounded-lg border border-empire-ghost p-8 card-hover cursor-pointer">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-empire-steel/60 text-sm mb-1">{label}</p>
          {loading ? (
            <div className="h-9 w-16 bg-empire-mist animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-display font-semibold text-empire-ink">{value}</p>
          )}
        </div>
        <div className="w-10 h-10 bg-empire-gold/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-empire-gold" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ['admin-stats-profiles'],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      return data ?? []
    },
  })

  const { data: diagnostics, isLoading: loadingDiagnostics } = useQuery({
    queryKey: ['admin-diagnostics-recent'],
    queryFn: async (): Promise<DiagnosticWithProfile[]> => {
      const { data, error } = await supabase
        .from('client_diagnostics')
        .select(`*, profile:profiles!client_diagnostics_client_id_fkey(id, full_name, role, avatar_url, created_at, updated_at)`)
        .eq('is_locked', true)
        .order('submitted_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return (data ?? []) as DiagnosticWithProfile[]
    },
  })

  const { data: impersonationLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['impersonation-logs-recent'],
    queryFn: async (): Promise<ImpersonationLogWithProfiles[]> => {
      const { data, error } = await supabase
        .from('impersonation_logs')
        .select(
          `*,
          consultant:profiles!impersonation_logs_consultant_id_fkey(id, full_name, role, avatar_url, created_at, updated_at),
          client:profiles!impersonation_logs_client_id_fkey(id, full_name, role, avatar_url, created_at, updated_at)`
        )
        .order('started_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return (data ?? []) as ImpersonationLogWithProfiles[]
    },
  })

  const totalUsers = profiles?.length ?? 0
  const totalClients = profiles?.filter((p) => p.role === 'client').length ?? 0
  const totalConsultants = profiles?.filter((p) => p.role === 'consultant').length ?? 0

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="section-label">Painel</div>
        <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Dashboard</h1>
        <p className="text-empire-steel/60 mt-2 text-base">Visão geral da plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total de Usuários"
          value={totalUsers}
          icon={Users}
          loading={loadingProfiles}
        />
        <StatCard
          label="Consultores"
          value={totalConsultants}
          icon={UserCog}
          loading={loadingProfiles}
        />
        <StatCard
          label="Clientes"
          value={totalClients}
          icon={UserCheck}
          loading={loadingProfiles}
        />
      </div>

      {/* Diagnostics */}
      <div className="ds-table-wrap">
        <div className="px-6 py-4 border-b border-empire-ghost bg-empire-mist flex items-center gap-3">
          <ClipboardList className="w-4 h-4 text-empire-gold" />
          <h2 className="font-mono text-[11px] tracking-[0.12em] uppercase text-empire-steel/70 font-medium">Diagnósticos Enviados</h2>
        </div>

        {loadingDiagnostics ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-empire-mist animate-pulse rounded" />
            ))}
          </div>
        ) : !diagnostics || diagnostics.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClipboardList className="w-8 h-8 text-empire-ink/20 mx-auto mb-3" />
            <p className="text-empire-steel/50 text-sm">Nenhum diagnóstico enviado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ds-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Enviado em</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((d) => (
                  <tr key={d.id}>
                    <td className="text-empire-ink font-medium">
                      {d.profile?.full_name ?? '—'}
                    </td>
                    <td className="text-empire-steel/60">
                      {d.submitted_at ? formatDateTime(d.submitted_at) : '—'}
                    </td>
                    <td>
                      <span className="badge-success">
                        <span className="w-[5px] h-[5px] rounded-full bg-empire-success" />
                        Enviado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Impersonation Logs */}
      <div className="ds-table-wrap">
        <div className="px-6 py-4 border-b border-empire-ghost bg-empire-mist flex items-center gap-3">
          <Activity className="w-4 h-4 text-empire-gold" />
          <h2 className="font-mono text-[11px] tracking-[0.12em] uppercase text-empire-steel/70 font-medium">Últimas Impersonações</h2>
        </div>

        {loadingLogs ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-empire-mist animate-pulse rounded" />
            ))}
          </div>
        ) : !impersonationLogs || impersonationLogs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Activity className="w-8 h-8 text-empire-ink/20 mx-auto mb-3" />
            <p className="text-empire-steel/50 text-sm">Nenhuma atividade registrada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ds-table">
              <thead>
                <tr>
                  <th>Consultor</th>
                  <th>Cliente</th>
                  <th>Início</th>
                  <th>Fim</th>
                </tr>
              </thead>
              <tbody>
                {impersonationLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-empire-ink font-medium">
                      {log.consultant?.full_name ?? '—'}
                    </td>
                    <td className="text-empire-ink">
                      {log.client?.full_name ?? '—'}
                    </td>
                    <td className="text-empire-steel/60">
                      {formatDateTime(log.started_at)}
                    </td>
                    <td className="text-empire-steel/60">
                      {log.ended_at ? formatDateTime(log.ended_at) : (
                        <span className="badge-warning">
                          <span className="w-[5px] h-[5px] rounded-full bg-empire-gold" />
                          Em andamento
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
