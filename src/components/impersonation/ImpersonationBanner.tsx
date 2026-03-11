import { useImpersonation } from '@/contexts/ImpersonationContext'

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedClient, stopImpersonation } = useImpersonation()

  if (!isImpersonating || !impersonatedClient) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-empire text-empire-platinum px-4 py-2 flex items-center justify-between text-sm font-medium border-b border-empire-gold/30">
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-empire-gold animate-pulse" />
        Você está visualizando como:{' '}
        <strong className="text-white">{impersonatedClient.full_name ?? 'Cliente'}</strong>
      </span>
      <button
        onClick={stopImpersonation}
        className="border border-empire-gold/30 text-empire-gold hover:bg-empire-gold/10 px-3 py-1 transition-colors text-xs tracking-wide uppercase cursor-pointer"
      >
        Sair do modo cliente
      </button>
    </div>
  )
}
