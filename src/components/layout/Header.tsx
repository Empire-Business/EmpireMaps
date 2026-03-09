import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const ROLE_LABELS = {
  admin: 'Admin',
  consultant: 'Consultor',
  client: 'Cliente',
}

export function Header() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-16 bg-empire-surface border-b border-empire-border flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-empire-gold/10 border border-empire-gold/20 flex items-center justify-center">
            <User className="w-4 h-4 text-empire-gold" />
          </div>
          <div>
            <p className="text-sm text-empire-text leading-none">
              {profile?.full_name ?? 'Usuário'}
            </p>
            {profile?.role && (
              <span className="text-xs text-empire-gold/70 tracking-wide">
                {ROLE_LABELS[profile.role]}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-empire-text/50 hover:text-empire-text/80 transition-colors text-sm"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
