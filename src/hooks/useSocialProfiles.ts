import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type SocialProfileRow = Database['public']['Tables']['client_social_profiles']['Row']
type SocialProfileInsert = Database['public']['Tables']['client_social_profiles']['Insert']
type SocialProfileUpdate = Database['public']['Tables']['client_social_profiles']['Update']

export function useSocialProfiles(clientId: string | undefined) {
  return useQuery({
    queryKey: ['social-profiles', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<SocialProfileRow[]> => {
      const { data, error } = await supabase
        .from('client_social_profiles')
        .select('*')
        .eq('client_id', clientId!)
        .order('platform', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateSocialProfile(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      profileData: Omit<SocialProfileInsert, 'client_id'>
    ): Promise<SocialProfileRow> => {
      const { data, error } = await supabase
        .from('client_social_profiles')
        .insert({ ...profileData, client_id: clientId! })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Perfil adicionado.')
      queryClient.invalidateQueries({ queryKey: ['social-profiles', clientId] })
    },
    onError: () => {
      toast.error('Erro ao adicionar perfil.')
    },
  })
}

export function useUpdateSocialProfile(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      profileId,
      data: profileData,
    }: {
      profileId: string
      data: SocialProfileUpdate
    }): Promise<SocialProfileRow> => {
      const { data, error } = await supabase
        .from('client_social_profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', profileId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-profiles', clientId] })
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil.')
    },
  })
}

export function useDeleteSocialProfile(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileId: string): Promise<void> => {
      const { error } = await supabase
        .from('client_social_profiles')
        .delete()
        .eq('id', profileId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Perfil removido.')
      queryClient.invalidateQueries({ queryKey: ['social-profiles', clientId] })
    },
    onError: () => {
      toast.error('Erro ao remover perfil.')
    },
  })
}
