import { Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useDeliverable } from '@/hooks/useDeliverable'
import { MarkdownUploader } from '@/components/deliverables/MarkdownUploader'
import { BrandBookView, getBrandBookNavItems, type BrandBookData } from '@/components/deliverables/BrandBookView'
import { DeliverableNav } from '@/components/deliverables/DeliverableNav'
import type { Database } from '@/integrations/supabase/types'

type Json = Database['public']['Tables']['deliverables']['Row']['processed_json']

function parseBrandBookData(json: Json): BrandBookData {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {}
  return json as BrandBookData
}

export default function BrandBookPage() {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()

  const effectiveProfile = impersonatedClient ?? profile
  const clientId = effectiveProfile?.id ?? user?.id

  const { data: deliverable, isLoading } = useDeliverable(clientId, 'brand_book')
  const isReady = deliverable?.status === 'published'
  const parsedData = isReady ? parseBrandBookData(deliverable!.processed_json) : {}
  const navItems = getBrandBookNavItems(parsedData)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="max-w-5xl">
        <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Fase 2</p>
        <h1 className="font-display text-3xl font-semibold text-empire-text">Brand Book</h1>
        <p className="text-empire-text/60 mt-1 text-sm">
          Sua identidade de marca completa.
        </p>
      </div>

      {/* Uploader for admin/consultant */}
      {clientId && (
        <div className="max-w-5xl">
          <MarkdownUploader clientId={clientId} type="brand_book" />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4 max-w-5xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-empire-card border border-empire-border animate-pulse" />
          ))}
        </div>
      ) : !deliverable || deliverable.status === 'locked' ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center max-w-5xl">
          <div className="w-16 h-16 bg-empire-card border border-empire-border flex items-center justify-center">
            <Lock className="w-7 h-7 text-empire-text/30" />
          </div>
          <div>
            <p className="text-empire-text/60 font-medium">Conteúdo ainda não disponível</p>
            <p className="text-empire-text/40 text-sm mt-1">
              O Brand Book será disponibilizado após a Fase 1 ser concluída.
            </p>
          </div>
        </div>
      ) : deliverable.status === 'in_progress' ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center max-w-5xl">
          <Loader2 className="w-10 h-10 text-empire-gold/60 animate-spin" />
          <div>
            <p className="text-empire-text/60 font-medium">Processando...</p>
            <p className="text-empire-text/40 text-sm mt-1">
              Seu Brand Book está sendo gerado. Aguarde alguns instantes.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-8">
          <div className="flex-1 min-w-0 max-w-4xl">
            <BrandBookView data={parsedData} />
          </div>
          <DeliverableNav items={navItems} />
        </div>
      )}
    </div>
  )
}
