import { useRef, useState, useEffect } from 'react'
import { LogOut, Menu, Camera, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GlobalSearch } from '@/components/search/GlobalSearch'

const ROLE_LABELS = {
  admin: 'Admin',
  consultant: 'Consultor',
  client: 'Cliente',
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 3MB.')
      return
    }

    setUploading(true)
    setAvatarMenuOpen(false)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      toast.success('Foto atualizada com sucesso.')
      // Force reload to refresh AuthContext profile
      window.location.reload()
    } catch (err) {
      toast.error('Erro ao atualizar foto.')
      console.error(err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    <header className="h-16 bg-empire-surface border-b border-empire-border flex items-center justify-between px-4 lg:px-6">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-empire-text/50 hover:text-empire-text transition-colors p-1"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search trigger — desktop */}
      <button
        onClick={() => setSearchOpen(true)}
        className="hidden lg:flex items-center gap-2 bg-empire-bg border border-empire-border px-3 py-1.5 text-sm text-empire-text/40 hover:text-empire-text/70 hover:border-empire-border/80 transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Buscar...</span>
        <kbd className="flex items-center gap-0.5 text-xs bg-empire-surface border border-empire-border px-1.5 py-0.5 ml-4">
          Ctrl K
        </kbd>
      </button>

      <div className="flex items-center gap-4">
        {/* Search trigger — mobile */}
        <button
          onClick={() => setSearchOpen(true)}
          className="lg:hidden text-empire-text/50 hover:text-empire-text transition-colors p-1"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Avatar + name */}
        <div className="relative">
          <button
            onClick={() => setAvatarMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 group"
          >
            <div className={cn(
              'w-8 h-8 rounded-full bg-empire-gold/10 border border-empire-gold/20 flex items-center justify-center overflow-hidden relative',
              uploading && 'opacity-50'
            )}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-empire-gold text-xs font-semibold uppercase">
                  {(profile?.full_name ?? 'U').charAt(0)}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm text-empire-text leading-none">
                {profile?.full_name ?? 'Usuário'}
              </p>
              {profile?.role && (
                <span className="text-xs text-empire-gold/70 tracking-wide">
                  {ROLE_LABELS[profile.role]}
                </span>
              )}
            </div>
          </button>

          {/* Avatar dropdown */}
          {avatarMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setAvatarMenuOpen(false)}
              />
              <div className="absolute right-0 top-10 z-20 bg-empire-card border border-empire-border shadow-xl w-48 py-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-empire-text/70 hover:text-empire-text hover:bg-empire-surface transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Alterar foto'}
                </button>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-empire-text/50 hover:text-empire-text/80 transition-colors text-sm"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
    </>
  )
}
