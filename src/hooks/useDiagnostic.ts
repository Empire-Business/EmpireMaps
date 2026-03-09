import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type DiagnosticRow = Database['public']['Tables']['client_diagnostics']['Row']
type DiagnosticUpdate = Database['public']['Tables']['client_diagnostics']['Update']

export function useDiagnostic(clientId: string | undefined) {
  return useQuery({
    queryKey: ['diagnostic', clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<DiagnosticRow | null> => {
      const { data, error } = await supabase
        .from('client_diagnostics')
        .select('*')
        .eq('client_id', clientId!)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useSaveDiagnostic(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: DiagnosticUpdate): Promise<DiagnosticRow> => {
      const { data: existing } = await supabase
        .from('client_diagnostics')
        .select('id')
        .eq('client_id', clientId!)
        .maybeSingle()

      if (existing) {
        const { data, error } = await supabase
          .from('client_diagnostics')
          .update({ ...values, updated_at: new Date().toISOString() })
          .eq('client_id', clientId!)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('client_diagnostics')
          .insert({ client_id: clientId!, ...values })
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic', clientId] })
    },
    onError: () => {
      toast.error('Erro ao salvar diagnóstico.')
    },
  })
}

export function useSubmitDiagnostic(clientId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<DiagnosticRow> => {
      const now = new Date().toISOString()
      const { data: existing } = await supabase
        .from('client_diagnostics')
        .select('id')
        .eq('client_id', clientId!)
        .maybeSingle()

      if (existing) {
        const { data, error } = await supabase
          .from('client_diagnostics')
          .update({ submitted_at: now, is_locked: true, updated_at: now })
          .eq('client_id', clientId!)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('client_diagnostics')
          .insert({ client_id: clientId!, submitted_at: now, is_locked: true })
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      toast.success('Diagnóstico enviado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['diagnostic', clientId] })
    },
    onError: () => {
      toast.error('Erro ao enviar diagnóstico.')
    },
  })
}
