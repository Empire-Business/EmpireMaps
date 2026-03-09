import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ImpersonationBanner } from '@/components/impersonation/ImpersonationBanner'
import { useImpersonation } from '@/contexts/ImpersonationContext'

export function AppLayout() {
  const { isImpersonating } = useImpersonation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`flex min-h-screen bg-empire-bg ${isImpersonating ? 'pt-9' : ''}`}>
      <ImpersonationBanner />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
