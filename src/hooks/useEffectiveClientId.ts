import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'

/**
 * Returns the effective client ID for data queries.
 * - If impersonating: uses the impersonated client's ID
 * - If user is a team member (has parent_client_id): uses parent's ID
 * - Otherwise: uses the user's own ID
 */
export function useEffectiveClientId(): string | undefined {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()

  if (impersonatedClient) {
    return impersonatedClient.id
  }

  // Team member → use parent client's ID
  if (profile?.parent_client_id) {
    return profile.parent_client_id
  }

  return profile?.id ?? user?.id
}
