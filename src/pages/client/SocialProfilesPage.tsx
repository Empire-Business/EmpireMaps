import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Trash2, Edit3, AtSign, Globe } from 'lucide-react'
import { useEffectiveClientId } from '@/hooks/useEffectiveClientId'
import {
  useSocialProfiles,
  useCreateSocialProfile,
  useUpdateSocialProfile,
  useDeleteSocialProfile,
} from '@/hooks/useSocialProfiles'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type SocialProfile = Database['public']['Tables']['client_social_profiles']['Row']

const PLATFORM_OPTIONS = [
  'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Twitter/X',
  'Facebook', 'Pinterest', 'Blog', 'Threads', 'Outro',
]

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  LinkedIn: 'bg-blue-600/10 text-blue-400 border-blue-600/20',
  YouTube: 'bg-red-500/10 text-empire-danger border-red-500/20',
  TikTok: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Twitter/X': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Facebook: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Pinterest: 'bg-red-600/10 text-empire-danger border-red-600/20',
  Blog: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Threads: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Outro: 'bg-empire-mist text-empire-steel/50 border-empire-ghost',
}

const profileSchema = z.object({
  platform: z.string().min(1, 'Selecione a rede social'),
  handle: z.string().min(1, 'Informe o @ ou nome do perfil'),
  notes: z.string().optional(),
})
type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileModalProps {
  profile?: SocialProfile
  clientId: string
  onClose: () => void
}

function ProfileModal({ profile: editingProfile, clientId, onClose }: ProfileModalProps) {
  const createProfile = useCreateSocialProfile(clientId)
  const updateProfile = useUpdateSocialProfile(clientId)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      platform: editingProfile?.platform ?? '',
      handle: editingProfile?.handle ?? '',
      notes: editingProfile?.notes ?? '',
    },
  })

  async function onSubmit(data: ProfileFormData) {
    setError(null)
    try {
      if (editingProfile) {
        await updateProfile.mutateAsync({
          profileId: editingProfile.id,
          data: {
            platform: data.platform,
            handle: data.handle,
            notes: data.notes || null,
          },
        })
      } else {
        await createProfile.mutateAsync({
          platform: data.platform,
          handle: data.handle,
          notes: data.notes || null,
        })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-empire-surface rounded-lg border border-empire-ghost w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-empire-ink">
            {editingProfile ? 'Editar Perfil' : 'Novo Perfil'}
          </h2>
          <button onClick={onClose} className="text-empire-steel/40 hover:text-empire-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="text-empire-danger text-sm bg-red-400/10 border border-red-400/20 px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Rede Social *</label>
            <select
              {...register('platform')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
            >
              <option value="">Selecione...</option>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.platform && <p className="text-empire-danger text-xs mt-1">{errors.platform.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">@ ou Nome do Perfil *</label>
            <input
              {...register('handle')}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors"
              placeholder="@nomedoperfil"
            />
            {errors.handle && <p className="text-empire-danger text-xs mt-1">{errors.handle.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-empire-steel/80 mb-1.5">Observações</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full bg-empire-mist border border-empire-ghost text-empire-ink px-4 py-2.5 text-sm focus:outline-none focus:border-empire-gold/50 transition-colors resize-none"
              placeholder="Ex: Perfil pessoal, perfil da marca..."
            />
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
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SocialProfilesPage() {
  const clientId = useEffectiveClientId()

  const { data: profiles, isLoading } = useSocialProfiles(clientId)
  const deleteProfile = useDeleteSocialProfile(clientId)

  const [showModal, setShowModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<SocialProfile | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function openNew() {
    setEditingProfile(null)
    setShowModal(true)
  }

  function openEdit(profile: SocialProfile) {
    setEditingProfile(profile)
    setShowModal(true)
  }

  async function handleDelete(profileId: string) {
    await deleteProfile.mutateAsync(profileId)
    setConfirmDeleteId(null)
  }

  // Group profiles by platform
  const grouped = profiles?.reduce<Record<string, SocialProfile[]>>((acc, p) => {
    const key = p.platform
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {}) ?? {}

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="section-label">Configuração</div>
          <h1 className="font-display text-[2.5rem] font-bold text-empire-ink tracking-[-0.02em] leading-tight">Perfis de Redes Sociais</h1>
          <p className="text-empire-steel/60 mt-1 text-sm">
            Cadastre os perfis de redes sociais do cliente. Eles ficarão disponíveis para seleção nos mapas de produção e distribuição.
          </p>
        </div>
        <button onClick={openNew} className="btn-premium">
          <Plus className="w-4 h-4" />
          Novo Perfil
        </button>
      </div>

      {/* Profiles List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-empire-surface rounded-lg border border-empire-ghost animate-pulse" />
          ))}
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="py-16 text-center">
          <Globe className="w-8 h-8 text-empire-ink/20 mx-auto mb-3" />
          <p className="text-empire-steel/40 text-sm">Nenhum perfil cadastrado.</p>
          <p className="text-empire-steel/30 text-xs mt-1">
            Adicione perfis de redes sociais para usá-los nos mapas de produção e distribuição.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([platform, platformProfiles]) => (
            <div key={platform}>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('text-xs px-2 py-0.5 border', PLATFORM_COLORS[platform] ?? PLATFORM_COLORS['Outro'])}>
                  {platform}
                </span>
                <span className="text-xs text-empire-steel/40">
                  {platformProfiles.length} perfil{platformProfiles.length !== 1 ? 'is' : ''}
                </span>
              </div>

              <div className="space-y-1.5">
                {platformProfiles.map((p) => (
                  <div
                    key={p.id}
                    className="bg-empire-surface rounded-lg border border-empire-ghost px-4 py-3 flex items-center justify-between group hover:border-empire-gold/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AtSign className="w-4 h-4 text-empire-steel/30 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-empire-ink font-medium truncate">{p.handle}</p>
                        {p.notes && (
                          <p className="text-xs text-empire-steel/40 truncate">{p.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-empire-steel/50 hover:text-empire-ink transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleteProfile.isPending}
                            className="text-xs text-empire-danger hover:text-red-300 transition-colors"
                          >
                            Confirmar
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(p)}
                            className="text-empire-ink/20 hover:text-empire-gold transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="text-empire-ink/20 hover:text-empire-danger transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && clientId && (
        <ProfileModal
          profile={editingProfile ?? undefined}
          clientId={clientId}
          onClose={() => { setShowModal(false); setEditingProfile(null) }}
        />
      )}
    </div>
  )
}
