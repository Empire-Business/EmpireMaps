import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/integrations/supabase/types'

type AttachmentRow = Database['public']['Tables']['card_attachments']['Row']

const BUCKET = 'card-attachments'
const MAX_BYTES = 20 * 1024 * 1024 // 20MB

export function useCardAttachments(cardId: string | undefined) {
  return useQuery({
    queryKey: ['card-attachments', cardId],
    enabled: !!cardId,
    queryFn: async (): Promise<AttachmentRow[]> => {
      const { data, error } = await supabase
        .from('card_attachments')
        .select('*')
        .eq('card_id', cardId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUploadAttachment(cardId: string | undefined) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File): Promise<AttachmentRow> => {
      if (file.size > MAX_BYTES) throw new Error('Arquivo muito grande. Máximo 20MB.')

      const ext = file.name.split('.').pop() ?? 'bin'
      const path = `${cardId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

      const { data, error } = await supabase
        .from('card_attachments')
        .insert({
          card_id: cardId!,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type || null,
          file_size: file.size,
          uploaded_by: user?.id ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Anexo adicionado.')
      queryClient.invalidateQueries({ queryKey: ['card-attachments', cardId] })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar anexo.')
    },
  })
}

export function useDeleteAttachment(cardId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (attachment: AttachmentRow): Promise<void> => {
      // Extract path from URL for storage deletion
      const url = new URL(attachment.file_url)
      const pathStart = url.pathname.indexOf(`/${BUCKET}/`) + `/${BUCKET}/`.length
      const storagePath = url.pathname.slice(pathStart)

      // Best-effort storage delete
      await supabase.storage.from(BUCKET).remove([storagePath])

      const { error } = await supabase
        .from('card_attachments')
        .delete()
        .eq('id', attachment.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Anexo removido.')
      queryClient.invalidateQueries({ queryKey: ['card-attachments', cardId] })
    },
    onError: () => {
      toast.error('Erro ao remover anexo.')
    },
  })
}
