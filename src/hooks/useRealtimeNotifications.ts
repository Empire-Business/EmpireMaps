import { useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'

const TYPE_LABELS: Record<string, string> = {
  risk_map: 'Mapa de Riscos',
  brand_book: 'Brand Book',
  editorial_line: 'Linha Editorial',
}

export function useRealtimeNotifications() {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user || !profile) return

    // Listen for deliverable status changes (client gets notified when published)
    const deliverableChannel = supabase
      .channel('deliverable-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deliverables',
          filter: profile.role === 'client' ? `client_id=eq.${user.id}` : undefined,
        },
        (payload) => {
          const newStatus = payload.new?.status
          const type = payload.new?.type as string
          const label = TYPE_LABELS[type] ?? type

          if (newStatus === 'published' && profile.role === 'client') {
            toast.success(`${label} foi publicado! Confira na página do entregável.`)
          }

          // Invalidate queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ['deliverable'] })
          queryClient.invalidateQueries({ queryKey: ['deliverables'] })
        }
      )
      .subscribe()

    // Listen for new content cards (client gets notified)
    const cardsChannel = supabase
      .channel('card-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'content_cards',
          filter: profile.role === 'client' ? `client_id=eq.${user.id}` : undefined,
        },
        (payload) => {
          const title = payload.new?.title
          const createdBy = payload.new?.created_by

          // Only notify if created by someone else
          if (createdBy && createdBy !== user.id) {
            toast.info(`Novo conteúdo adicionado: "${title}"`)
          }

          queryClient.invalidateQueries({ queryKey: ['content-cards'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(deliverableChannel)
      supabase.removeChannel(cardsChannel)
    }
  }, [user?.id, profile?.role])
}
