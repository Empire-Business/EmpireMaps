import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface ClientWithLink extends Profile {
  linkId: string
}

export function useMyClients() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['my-clients', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ClientWithLink[]> => {
      const { data, error } = await supabase
        .from('consultant_clients')
        .select('id, client_id, profiles!consultant_clients_client_id_fkey(*)')
        .eq('consultant_id', user!.id)

      if (error) throw error

      return (data ?? []).map((row) => {
        const profile = row.profiles as Profile
        return {
          ...profile,
          linkId: row.id,
        }
      })
    },
  })
}
