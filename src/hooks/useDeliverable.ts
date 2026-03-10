import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/integrations/supabase/types'

type DeliverableRow = Database['public']['Tables']['deliverables']['Row']
type DeliverableType = DeliverableRow['type']
type VersionRow = Database['public']['Tables']['deliverable_versions']['Row']

export function useDeliverable(
  clientId: string | undefined,
  type: DeliverableType | undefined
) {
  return useQuery({
    queryKey: ['deliverable', clientId, type],
    enabled: !!clientId && !!type,
    queryFn: async (): Promise<DeliverableRow | null> => {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('client_id', clientId!)
        .eq('type', type!)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useAllDeliverables(clientId: string | undefined) {
  return useQuery({
    queryKey: ['deliverables', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<DeliverableRow[]> => {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .eq('client_id', clientId!)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUploadMarkdown(
  clientId: string | undefined,
  type: DeliverableType | undefined
) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rawMarkdown: string): Promise<DeliverableRow> => {
      const now = new Date().toISOString()
      const { data: existing } = await supabase
        .from('deliverables')
        .select('id')
        .eq('client_id', clientId!)
        .eq('type', type!)
        .maybeSingle()

      if (existing) {
        // Save current version before overwriting (best-effort)
        const { data: current } = await supabase
          .from('deliverables')
          .select('id, raw_markdown, processed_json')
          .eq('id', existing.id)
          .single()
        if (current?.raw_markdown) {
          const { data: lastVersion } = await supabase
            .from('deliverable_versions')
            .select('version_number')
            .eq('deliverable_id', current.id)
            .order('version_number', { ascending: false })
            .limit(1)
            .maybeSingle()
          const nextVersion = (lastVersion?.version_number ?? 0) + 1
          // best-effort version snapshot
          try {
            await supabase
              .from('deliverable_versions')
              .insert({
                deliverable_id: current.id,
                version_number: nextVersion,
                raw_markdown: current.raw_markdown,
                processed_json: current.processed_json,
                uploaded_by: user?.id ?? null,
              })
          } catch {
            // ignore — versioning is non-critical
          }
        }

        const { data, error } = await supabase
          .from('deliverables')
          .update({
            raw_markdown: rawMarkdown,
            status: 'in_progress',
            uploaded_by: user?.id ?? null,
            updated_at: now,
          })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('deliverables')
          .insert({
            client_id: clientId!,
            type: type!,
            raw_markdown: rawMarkdown,
            status: 'in_progress',
            uploaded_by: user?.id ?? null,
          })
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverable', clientId, type] })
      queryClient.invalidateQueries({ queryKey: ['deliverables', clientId] })
    },
    onError: () => {
      toast.error('Erro ao fazer upload do arquivo.')
    },
  })
}

export function useDeliverableVersions(deliverableId: string | undefined) {
  return useQuery({
    queryKey: ['deliverable-versions', deliverableId],
    enabled: !!deliverableId,
    queryFn: async (): Promise<VersionRow[]> => {
      const { data, error } = await supabase
        .from('deliverable_versions')
        .select('*')
        .eq('deliverable_id', deliverableId!)
        .order('version_number', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function usePublishDeliverable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deliverableId: string): Promise<DeliverableRow> => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('deliverables')
        .update({ status: 'published', published_at: now, updated_at: now })
        .eq('id', deliverableId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Entregável publicado para o cliente.')
      queryClient.invalidateQueries({ queryKey: ['deliverable'] })
      queryClient.invalidateQueries({ queryKey: ['deliverables'] })
    },
    onError: () => {
      toast.error('Erro ao publicar entregável.')
    },
  })
}
