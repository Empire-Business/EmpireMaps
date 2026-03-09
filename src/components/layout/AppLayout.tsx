import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ImpersonationBanner } from '@/components/impersonation/ImpersonationBanner'
import { useImpersonation } from '@/contexts/ImpersonationContext'

export function AppLayout() {
  const { isImpersonating } = useImpersonation()

  return (
    <div className={`flex min-h-screen bg-empire-bg ${isImpersonating ? 'pt-9' : ''}`}>
      <ImpersonationBanner />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
