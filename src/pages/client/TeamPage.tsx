import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Users, Power, Trash2, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useEffectiveClientId } from '@/hooks/useEffectiveClientId'
import {
  useTeamMembers,
  useAddTeamMember,
  useRemoveTeamMember,
  useToggleTeamMemberActive,
} from '@/hooks/useTeamMembers'
import { cn, formatDate } from '@/lib/utils'


const newMemberSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})
type NewMemberData = z.infer<typeof newMemberSchema>

interface AddMemberModalProps {
  clientId: string
  onClose: () => void
}

function AddMemberModal({ clientId, onClose }: AddMemberModalProps) {
  const addMember = useAddTeamMember(clientId)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewMemberData>({
    resolver: zodResolver(newMemberSchema),
  })

  async function onSubmit(data: NewMemberData) {
    try {
      await addMember.mutateAsync({
        email: data.email,
        password: data.password,
        fullName: data.full_name,
      })
      onClose()
    } catch {
      // toast handled in hook
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-empire-surface rounded-lg border border-empire-ghost w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-empire-ink">Novo Membro da Equipe</h2>
          <button onClick={onClose} className="text-empire-steel/40 hover:text-empire-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-empire-steel/50 text-sm mb-4">
          O membro terá acesso apenas ao espaço deste cliente — não poderá ver dados de outros clientes.
        </p>

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

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary justify-center">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-premium justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Criando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const { profile } = useAuth()
  const { impersonatedClient } = useImpersonation()
  const clientId = useEffectiveClientId()

  // Only the main client (not a team member) can manage the team
  const effectiveProfile = impersonatedClient ?? profile
  const isMainClient = !effectiveProfile?.parent_client_id
  const isAdminOrConsultant = profile?.role === 'admin' || profile?.role === 'consultant'
  const canManage = isMainClient || isAdminOrConsultant

  const { data: members, isLoading } = useTeamMembers(clientId)
  const removeMember = useRemoveTeamMember(clientId)
  const toggleActive = useToggleTeamMemberActive(clientId)

  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  async function handleRemove(memberId: string) {
    await removeMember.mutateAsync(memberId)
    setConfirmRemoveId(null)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="section-label">Configuração</div>
          <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Minha Equipe</h1>
          <p className="text-empire-steel/60 mt-1 text-sm">
            Gerencie os membros da sua equipe. Eles terão acesso ao mapa de produção e distribuição.
          </p>
        </div>
        {canManage && (
          <button onClick={() => setShowAddModal(true)} className="btn-premium">
            <UserPlus className="w-4 h-4" />
            Novo Membro
          </button>
        )}
      </div>

      {/* Info card */}
      <div className="bg-empire-surface rounded-lg border border-empire-ghost px-4 py-3">
        <p className="text-xs text-empire-steel/50">
          Membros da equipe possuem acesso <span className="text-empire-steel/80">restrito ao espaço deste cliente</span>.
          Eles podem visualizar e trabalhar nos mapas de produção e distribuição, mas não podem ver dados de outros clientes.
        </p>
      </div>

      {/* Members list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-empire-surface rounded-lg border border-empire-ghost animate-pulse" />
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-8 h-8 text-empire-ink/20 mx-auto mb-3" />
          <p className="text-empire-steel/40 text-sm">Nenhum membro na equipe.</p>
          {canManage && (
            <p className="text-empire-steel/30 text-xs mt-1">
              Adicione membros para que eles possam acessar e colaborar nos seus conteúdos.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-empire-surface rounded-lg border border-empire-ghost overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-empire-ghost">
                <th className="text-left px-6 py-3 text-empire-steel/50 font-normal">Nome</th>
                <th className="text-left px-6 py-3 text-empire-steel/50 font-normal">Cadastro</th>
                <th className="text-left px-6 py-3 text-empire-steel/50 font-normal">Status</th>
                {canManage && <th className="px-6 py-3" />}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-empire-ghost/50 hover:bg-empire-mist/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-empire-gold/10 flex items-center justify-center text-empire-gold text-xs font-medium flex-shrink-0">
                        {(member.full_name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-empire-ink font-medium">
                        {member.full_name ?? <span className="text-empire-steel/40 italic">Sem nome</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-empire-steel/60">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    {canManage ? (
                      <button
                        onClick={() => toggleActive.mutate({ memberId: member.id, isActive: !member.is_active })}
                        className={cn(
                          'flex items-center gap-1.5 text-xs px-2 py-1 border transition-colors',
                          member.is_active
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 border-red-500/20 text-empire-danger hover:bg-red-500/20'
                        )}
                      >
                        <Power className="w-3 h-3" />
                        {member.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    ) : (
                      <span className={cn(
                        'text-xs px-2 py-1 border',
                        member.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border-red-500/20 text-empire-danger'
                      )}>
                        {member.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-6 py-4">
                      {confirmRemoveId === member.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-xs text-empire-steel/50 hover:text-empire-ink transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleRemove(member.id)}
                            disabled={removeMember.isPending}
                            className="text-xs text-empire-danger hover:text-red-300 transition-colors"
                          >
                            Confirmar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRemoveId(member.id)}
                          className="flex items-center gap-1.5 text-xs text-empire-steel/30 hover:text-empire-danger transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remover
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && clientId && (
        <AddMemberModal
          clientId={clientId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
