import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/integrations/supabase/types'

type ContentCardRow = Database['public']['Tables']['content_cards']['Row']
type ContentCardInsert = Database['public']['Tables']['content_cards']['Insert']
type ContentCardUpdate = Database['public']['Tables']['content_cards']['Update']

export function useContentCards(clientId: string | undefined) {
  return useQuery({
    queryKey: ['content-cards', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<ContentCardRow[]> => {
      const { data, error } = await supabase
        .from('content_cards')
        .select('*')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateCard(clientId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      cardData: Omit<ContentCardInsert, 'client_id' | 'created_by'>
    ): Promise<ContentCardRow> => {
      const { data, error } = await supabase
        .from('content_cards')
        .insert({
          ...cardData,
          client_id: clientId!,
          created_by: user?.id ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-cards', clientId] })
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cardId,
      data: cardData,
    }: {
      cardId: string
      data: ContentCardUpdate
    }): Promise<ContentCardRow> => {
      const { data, error } = await supabase
        .from('content_cards')
        .update({ ...cardData, updated_at: new Date().toISOString() })
        .eq('id', cardId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-cards'] })
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cardId: string): Promise<void> => {
      const { error } = await supabase
        .from('content_cards')
        .delete()
        .eq('id', cardId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-cards'] })
    },
  })
}
