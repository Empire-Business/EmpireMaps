import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Link as LinkIcon, X, Users, LogIn, Power, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useUsers,
  useCreateUser,
  useLinkConsultantClient,
  useConsultantClients,
  useToggleUserActive,
} from '@/hooks/useUsers'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { cn, formatDate } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserRole = Profile['role']

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  consultant: 'Consultor',
  client: 'Cliente',
}

const ROLE_CLASSES: Record<UserRole, string> = {
  admin: 'badge-warning',
  consultant: 'badge-empire',
  client: 'badge-success',
}

// ---- New User Modal ----
const newUserSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  role: z.enum(['admin', 'consultant', 'client'] as const),
})
type NewUserFormData = z.infer<typeof newUserSchema>

interface NewUserModalProps {
  onClose: () => void
}

function NewUserModal({ onClose }: NewUserModalProps) {
  const createUser = useCreateUser()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewUserFormData>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { role: 'client' },
  })

  async function onSubmit(data: NewUserFormData) {
    try {
      await createUser.mutateAsync({
        email: data.email,
        password: data.password,
        role: data.role,
        fullName: data.full_name,
      })
      onClose()
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-empire-surface rounded-lg border border-empire-ghost w-full max-w-md p-6 shadow-empire-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-empire-ink">Novo Usuário</h2>
          <button onClick={onClose} className="text-empire-steel/50 hover:text-empire-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Nome completo</label>
            <input
              {...register('full_name')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="Nome Sobrenome"
            />
            {errors.full_name && <p className="text-empire-danger text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">E-mail</label>
            <input
              {...register('email')}
              type="email"
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="email@exemplo.com"
            />
            {errors.email && <p className="text-empire-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Senha</label>
            <input
              {...register('password')}
              type="password"
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-empire-danger text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Perfil</label>
            <select
              {...register('role')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              <option value="client">Cliente</option>
              <option value="consultant">Consultor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-premium justify-center disabled:opacity-50"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Link Consultant Modal ----
interface LinkConsultantModalProps {
  client: Profile
  consultants: Profile[]
  onClose: () => void
}

function LinkConsultantModal({ client, consultants, onClose }: LinkConsultantModalProps) {
  const [selectedConsultantId, setSelectedConsultantId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const linkMutation = useLinkConsultantClient()

  async function handleLink() {
    if (!selectedConsultantId) return
    setError(null)
    try {
      await linkMutation.mutateAsync({
        consultantId: selectedConsultantId,
        clientId: client.id,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-empire-surface rounded-lg border border-empire-ghost w-full max-w-md p-6 shadow-empire-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-empire-ink">Vincular Consultor</h2>
          <button onClick={onClose} className="text-empire-steel/50 hover:text-empire-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-empire-steel/60 text-sm mb-4">
          Selecione o consultor responsável por <span className="text-empire-ink">{client.full_name ?? 'este cliente'}</span>.
        </p>

        {error && (
          <p className="text-empire-danger text-sm bg-empire-danger/10 border border-empire-danger/20 rounded-sm px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <select
          value={selectedConsultantId}
          onChange={(e) => setSelectedConsultantId(e.target.value)}
          className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors mb-4"
        >
          <option value="">Selecione um consultor...</option>
          {consultants.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name ?? c.id}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center">Cancelar</button>
          <button
            onClick={handleLink}
            disabled={!selectedConsultantId || linkMutation.isPending}
            className="flex-1 btn-premium justify-center disabled:opacity-50"
          >
            {linkMutation.isPending ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Main Page ----
type TabFilter = 'all' | UserRole

export default function UsersPage() {
  const navigate = useNavigate()
  const { startImpersonation } = useImpersonation()
  const { data: users, isLoading } = useUsers()
  const { data: consultantClients } = useConsultantClients()
  const [tab, setTab] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')
  const [showNewUser, setShowNewUser] = useState(false)
  const [linkingClient, setLinkingClient] = useState<Profile | null>(null)
  const [page, setPage] = useState(0)
  const toggleActive = useToggleUserActive()
  const PAGE_SIZE = 15

  async function handleImpersonate(client: Profile) {
    await startImpersonation(client)
    navigate('/client/dashboard')
  }

  const consultants = useMemo(
    () => users?.filter((u) => u.role === 'consultant') ?? [],
    [users]
  )

  const getLinkedConsultant = (clientId: string): Profile | null => {
    const link = consultantClients?.find((cc) => cc.client_id === clientId)
    if (!link) return null
    return users?.find((u) => u.id === link.consultant_id) ?? null
  }

  const filtered = useMemo(() => {
    let list = users ?? []
    if (tab !== 'all') list = list.filter((u) => u.role === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((u) => u.full_name?.toLowerCase().includes(q))
    }
    return list
  }, [users, tab, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const tabs: { id: TabFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'admin', label: 'Admin' },
    { id: 'consultant', label: 'Consultor' },
    { id: 'client', label: 'Cliente' },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="section-label">Admin</div>
          <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Gestão de Usuários</h1>
        </div>
        <button
          onClick={() => setShowNewUser(true)}
          className="btn-premium"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex gap-1 bg-empire-mist border border-empire-ghost p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-4 py-1.5 text-sm transition-colors',
                tab === t.id
                  ? 'bg-empire-gold/10 text-empire-gold'
                  : 'text-empire-steel/60 hover:text-empire-ink'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-empire-steel/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full bg-empire-mist border border-empire-ghost text-empire-ink placeholder:text-empire-steel/50 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="ds-table-wrap">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-empire-mist animate-pulse rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-8 h-8 text-empire-ink/20 mx-auto mb-3" />
            <p className="text-empire-steel/50 text-sm">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ds-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Perfil</th>
                  <th>Consultor vinculado</th>
                  <th>Cadastro</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user) => {
                  const linkedConsultant = user.role === 'client' ? getLinkedConsultant(user.id) : null
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-empire-gold/10 flex items-center justify-center text-empire-gold text-xs font-medium flex-shrink-0">
                            {(user.full_name ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-empire-ink font-medium">
                            {user.full_name ?? <span className="text-empire-steel/50 italic">Sem nome</span>}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={cn(ROLE_CLASSES[user.role])}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="text-empire-steel/60">
                        {user.role === 'client'
                          ? linkedConsultant?.full_name ?? <span className="text-empire-steel/50 italic">Nenhum</span>
                          : '—'}
                      </td>
                      <td className="text-empire-steel/60">
                        {formatDate(user.created_at)}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleActive.mutate({ userId: user.id, isActive: !user.is_active })}
                          className={cn(
                            'flex items-center gap-1.5 cursor-pointer rounded-sm transition-colors',
                            user.is_active
                              ? 'badge-success hover:opacity-80'
                              : 'badge-danger hover:opacity-80'
                          )}
                        >
                          <Power className="w-3 h-3" />
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'client' && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setLinkingClient(user)}
                              className="flex items-center gap-1.5 text-xs text-empire-steel/50 hover:text-empire-ink transition-colors"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              Vincular
                            </button>
                            <button
                              onClick={() => handleImpersonate(user)}
                              className="flex items-center gap-1.5 text-xs text-empire-gold/70 hover:text-empire-gold transition-colors"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              Entrar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-empire-steel/50">
            Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 border border-empire-ghost text-empire-steel/60 hover:text-empire-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-empire-steel/60">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 border border-empire-ghost text-empire-steel/60 hover:text-empire-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showNewUser && <NewUserModal onClose={() => setShowNewUser(false)} />}
      {linkingClient && (
        <LinkConsultantModal
          client={linkingClient}
          consultants={consultants}
          onClose={() => setLinkingClient(null)}
        />
      )}
    </div>
  )
}
