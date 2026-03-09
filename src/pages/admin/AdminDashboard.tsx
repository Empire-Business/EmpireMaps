import { useQuery } from '@tanstack/react-query'
import { Users, UserCheck, UserCog, Activity } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { formatDateTime } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ImpersonationLog = Database['public']['Tables']['impersonation_logs']['Row']

interface ImpersonationLogWithProfiles extends ImpersonationLog {
  consultant: Profile | null
  client: Profile | null
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
    <div className="bg-empire-card border border-empire-border p-6 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-empire-text/60 text-sm mb-1">{label}</p>
          {loading ? (
            <div className="h-9 w-16 bg-empire-surface animate-pulse rounded" />
          ) : (
            <p className="text-3xl font-display font-semibold text-empire-text">{value}</p>
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
        <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Painel</p>
        <h1 className="font-display text-3xl font-semibold text-empire-text">Dashboard</h1>
        <p className="text-empire-text/60 mt-1 text-sm">Visão geral da plataforma</p>
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

      {/* Impersonation Logs */}
      <div className="bg-empire-card border border-empire-border">
        <div className="px-6 py-4 border-b border-empire-border flex items-center gap-3">
          <Activity className="w-4 h-4 text-empire-gold" />
          <h2 className="text-sm font-medium text-empire-text">Últimas Impersonações</h2>
        </div>

        {loadingLogs ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-empire-surface animate-pulse rounded" />
            ))}
          </div>
        ) : !impersonationLogs || impersonationLogs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Activity className="w-8 h-8 text-empire-text/20 mx-auto mb-3" />
            <p className="text-empire-text/40 text-sm">Nenhuma atividade registrada ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-empire-border">
                  <th className="text-left px-6 py-3 text-empire-text/50 font-normal">Consultor</th>
                  <th className="text-left px-6 py-3 text-empire-text/50 font-normal">Cliente</th>
                  <th className="text-left px-6 py-3 text-empire-text/50 font-normal">Início</th>
                  <th className="text-left px-6 py-3 text-empire-text/50 font-normal">Fim</th>
                </tr>
              </thead>
              <tbody>
                {impersonationLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-empire-border/50 hover:bg-empire-surface/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-empire-text">
                      {log.consultant?.full_name ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-empire-text">
                      {log.client?.full_name ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-empire-text/60">
                      {formatDateTime(log.started_at)}
                    </td>
                    <td className="px-6 py-3 text-empire-text/60">
                      {log.ended_at ? formatDateTime(log.ended_at) : (
                        <span className="text-empire-gold text-xs">Em andamento</span>
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
