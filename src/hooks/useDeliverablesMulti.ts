import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type DeliverableRow = Database['public']['Tables']['deliverables']['Row']

export function useDeliverablesMulti(clientIds: string[]) {
  return useQuery({
    queryKey: ['deliverables-multi', clientIds],
    enabled: clientIds.length > 0,
    queryFn: async (): Promise<Record<string, DeliverableRow[]>> => {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .in('client_id', clientIds)
      if (error) throw error
      const map: Record<string, DeliverableRow[]> = {}
      for (const row of data ?? []) {
        if (!map[row.client_id]) map[row.client_id] = []
        map[row.client_id].push(row)
      }
      return map
    },
  })
}
