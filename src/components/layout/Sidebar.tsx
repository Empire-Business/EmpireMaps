import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Share2,
  Library,
  BarChart3,
  ClipboardList,
} from 'lucide-react'

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/banco-formatos', label: 'Banco de Formatos', icon: Library },
]

const consultantLinks = [
  { to: '/consultant/dashboard', label: 'Meus Clientes', icon: Users },
]

const clientLinks = [
  { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/client/diagnostico', label: 'Diagnóstico', icon: ClipboardList },
  { to: '/client/mapa-riscos', label: 'Mapa de Riscos', icon: BarChart3 },
  { to: '/client/brand-book', label: 'Brand Book', icon: BookOpen },
  { to: '/client/linha-editorial', label: 'Linha Editorial', icon: FileText },
  { to: '/client/mapa-producao', label: 'Mapa de Produção', icon: Calendar },
  { to: '/client/mapa-distribuicao', label: 'Mapa de Distribuição', icon: Share2 },
  { to: '/client/banco-formatos', label: 'Banco de Formatos', icon: Library },
]

export function Sidebar() {
  const { profile } = useAuth()

  const links = profile?.role === 'admin'
    ? adminLinks
    : profile?.role === 'consultant'
      ? consultantLinks
      : clientLinks

  return (
    <aside className="w-64 min-h-screen bg-empire-surface border-r border-empire-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-empire-border">
        <h1 className="font-display text-2xl font-semibold text-gold-gradient">Empire Maps</h1>
        <p className="text-empire-text/40 text-xs tracking-widest uppercase mt-0.5">
          {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'consultant' ? 'Consultor' : 'Cliente'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-empire-gold/10 text-empire-gold border-l-2 border-empire-gold'
                  : 'text-empire-text/60 hover:text-empire-text hover:bg-empire-card border-l-2 border-transparent',
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
