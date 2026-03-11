import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

/** Fetch all team members for a given client (users with parent_client_id = clientId) */
export function useTeamMembers(clientId: string | undefined) {
  return useQuery({
    queryKey: ['team-members', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('parent_client_id', clientId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

/** Add a team member: create user via Edge Function, then set parent_client_id */
export function useAddTeamMember(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      email: string
      password: string
      fullName: string
    }): Promise<{ user_id: string }> => {
      // 1. Create user via Edge Function (role = client)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: params.email,
          password: params.password,
          full_name: params.fullName,
          role: 'client',
        },
      })
      if (error) throw error
      const result = data as { success?: boolean; user_id?: string; error?: string }
      if (!result.success) throw new Error(result.error ?? 'Erro ao criar membro')

      // 2. Set parent_client_id to link them to the client
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          parent_client_id: clientId!,
          updated_at: new Date().toISOString(),
        })
        .eq('id', result.user_id!)
      if (updateError) throw updateError

      return { user_id: result.user_id! }
    },
    onSuccess: () => {
      toast.success('Membro da equipe adicionado.')
      queryClient.invalidateQueries({ queryKey: ['team-members', clientId] })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar membro.')
    },
  })
}

/** Remove a team member: unset parent_client_id and deactivate */
export function useRemoveTeamMember(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string): Promise<void> => {
      const { error } = await supabase
        .from('profiles')
        .update({
          parent_client_id: null,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Membro removido da equipe.')
      queryClient.invalidateQueries({ queryKey: ['team-members', clientId] })
    },
    onError: () => {
      toast.error('Erro ao remover membro.')
    },
  })
}

/** Toggle team member active/inactive */
export function useToggleTeamMemberActive(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, isActive }: { memberId: string; isActive: boolean }): Promise<void> => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', memberId)
      if (error) throw error
    },
    onSuccess: (_, { isActive }) => {
      toast.success(isActive ? 'Membro ativado.' : 'Membro desativado.')
      queryClient.invalidateQueries({ queryKey: ['team-members', clientId] })
    },
    onError: () => {
      toast.error('Erro ao alterar status do membro.')
    },
  })
}
