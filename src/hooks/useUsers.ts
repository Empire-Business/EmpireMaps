import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ConsultantClientRow = Database['public']['Tables']['consultant_clients']['Row']

export interface ProfileWithEmail extends Profile {
  email?: string
}

export function useUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateUser() {
  return useMutation({
    mutationFn: async (_params: {
      email: string
      password: string
      role: Profile['role']
      fullName: string
    }): Promise<void> => {
      throw new Error(
        'Esta ação requer a Edge Function send-welcome-email. Configure a CLI do Supabase para habilitar.'
      )
    },
  })
}

export function useLinkConsultantClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      consultantId,
      clientId,
    }: {
      consultantId: string
      clientId: string
    }): Promise<ConsultantClientRow> => {
      const { data, error } = await supabase
        .from('consultant_clients')
        .insert({ consultant_id: consultantId, client_id: clientId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['consultant_clients'] })
    },
  })
}

export function useUnlinkConsultantClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('consultant_clients')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultant_clients'] })
    },
  })
}

export function useConsultantClients() {
  return useQuery({
    queryKey: ['consultant_clients'],
    queryFn: async (): Promise<ConsultantClientRow[]> => {
      const { data, error } = await supabase
        .from('consultant_clients')
        .select('*')
      if (error) throw error
      return data ?? []
    },
  })
}
