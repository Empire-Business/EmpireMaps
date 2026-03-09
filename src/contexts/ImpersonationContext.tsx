import { createContext, useContext, useState, type ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './AuthContext'
import type { Profile } from '@/types'

interface ImpersonationContextType {
  impersonatedClient: Profile | null
  isImpersonating: boolean
  startImpersonation: (client: Profile) => Promise<void>
  stopImpersonation: () => Promise<void>
}

const ImpersonationContext = createContext<ImpersonationContextType | null>(null)

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [impersonatedClient, setImpersonatedClient] = useState<Profile | null>(null)
  const [logId, setLogId] = useState<string | null>(null)

  async function startImpersonation(client: Profile) {
    if (!user) return

    const { data } = await supabase
      .from('impersonation_logs')
      .insert({ consultant_id: user.id, client_id: client.id })
      .select('id')
      .single()

    if (data) setLogId(data.id)
    setImpersonatedClient(client)
  }

  async function stopImpersonation() {
    if (logId) {
      await supabase
        .from('impersonation_logs')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', logId)
    }
    setImpersonatedClient(null)
    setLogId(null)
  }

  return (
    <ImpersonationContext.Provider
      value={{
        impersonatedClient,
        isImpersonating: impersonatedClient !== null,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  )
}

export function useImpersonation() {
  const ctx = useContext(ImpersonationContext)
  if (!ctx) throw new Error('useImpersonation must be used within ImpersonationProvider')
  return ctx
}
