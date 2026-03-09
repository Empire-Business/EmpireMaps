import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      email: string
      password: string
      role: Profile['role']
      fullName: string
    }): Promise<{ user_id: string }> => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: params.email,
          password: params.password,
          full_name: params.fullName,
          role: params.role,
        },
      })
      if (error) throw error
      const result = data as { success?: boolean; user_id?: string; error?: string }
      if (!result.success) throw new Error(result.error ?? 'Erro ao criar usuário')
      return { user_id: result.user_id! }
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário.')
    },
  })
}

export function useLinkConsultantClient() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      consultantId,
      clientId,
    }: {
      consultantId: string
      clientId: string
    }): Promise<ConsultantClientRow> => {
      // Check if link already exists
      const { data: existing } = await supabase
        .from('consultant_clients')
        .select('id')
        .eq('consultant_id', consultantId)
        .eq('client_id', clientId)
        .maybeSingle()

      if (existing) {
        throw new Error('Este cliente já está vinculado a este consultor.')
      }

      const { data, error } = await supabase
        .from('consultant_clients')
        .insert({
          consultant_id: consultantId,
          client_id: clientId,
          created_by: user?.id ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Consultor vinculado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['consultant_clients'] })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Erro ao vincular consultor.')
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
      toast.success('Vínculo removido.')
      queryClient.invalidateQueries({ queryKey: ['consultant_clients'] })
    },
    onError: () => {
      toast.error('Erro ao remover vínculo.')
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
