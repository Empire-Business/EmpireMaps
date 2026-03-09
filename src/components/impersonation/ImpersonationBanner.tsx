import { useImpersonation } from '@/contexts/ImpersonationContext'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedClient, stopImpersonation } = useImpersonation()

  if (!isImpersonating || !impersonatedClient) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-empire-gold text-empire-bg px-4 py-2 flex items-center justify-between text-sm font-medium">
      <span>
        Você está visualizando como:{' '}
        <strong>{impersonatedClient.full_name ?? 'Cliente'}</strong>
      </span>
      <button
        onClick={stopImpersonation}
        className="bg-empire-bg/20 hover:bg-empire-bg/30 px-3 py-1 transition-colors text-xs tracking-wide uppercase"
      >
        Sair do modo cliente
      </button>
    </div>
  )
}
