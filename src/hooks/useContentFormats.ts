import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/integrations/supabase/types'

type ContentFormatRow = Database['public']['Tables']['content_formats']['Row']
type ContentFormatInsert = Database['public']['Tables']['content_formats']['Insert']
type ContentFormatUpdate = Database['public']['Tables']['content_formats']['Update']

export function useContentFormats() {
  return useQuery({
    queryKey: ['content-formats'],
    queryFn: async (): Promise<ContentFormatRow[]> => {
      const { data, error } = await supabase
        .from('content_formats')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAllContentFormats() {
  return useQuery({
    queryKey: ['content-formats', 'all'],
    queryFn: async (): Promise<ContentFormatRow[]> => {
      const { data, error } = await supabase
        .from('content_formats')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateFormat() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      formatData: Omit<ContentFormatInsert, 'created_by'>
    ): Promise<ContentFormatRow> => {
      const { data, error } = await supabase
        .from('content_formats')
        .insert({ ...formatData, created_by: user?.id ?? null })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Formato criado com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['content-formats'] })
    },
    onError: () => {
      toast.error('Erro ao criar formato.')
    },
  })
}

export function useUpdateFormat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data: formatData,
    }: {
      id: string
      data: ContentFormatUpdate
    }): Promise<ContentFormatRow> => {
      const { data, error } = await supabase
        .from('content_formats')
        .update({ ...formatData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Formato atualizado.')
      queryClient.invalidateQueries({ queryKey: ['content-formats'] })
    },
    onError: () => {
      toast.error('Erro ao atualizar formato.')
    },
  })
}
