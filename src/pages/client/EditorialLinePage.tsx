import { Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { useDeliverable } from '@/hooks/useDeliverable'
import { MarkdownUploader } from '@/components/deliverables/MarkdownUploader'
import { EditorialLineView, type EditorialLineData } from '@/components/deliverables/EditorialLineView'
import type { Database } from '@/integrations/supabase/types'

type Json = Database['public']['Tables']['deliverables']['Row']['processed_json']

function parseEditorialLineData(json: Json): EditorialLineData {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {}
  return json as EditorialLineData
}

export default function EditorialLinePage() {
  const { user, profile } = useAuth()
  const { impersonatedClient } = useImpersonation()

  const effectiveProfile = impersonatedClient ?? profile
  const clientId = effectiveProfile?.id ?? user?.id

  const { data: deliverable, isLoading } = useDeliverable(clientId, 'editorial_line')

  return (
    <div className="p-8 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-empire-gold text-sm tracking-widest uppercase mb-1">Fase 3</p>
        <h1 className="font-display text-3xl font-semibold text-empire-text">Linha Editorial</h1>
        <p className="text-empire-text/60 mt-1 text-sm">
          Sua estratégia de conteúdo personalizada.
        </p>
      </div>

      {/* Uploader for admin/consultant */}
      {clientId && (
        <MarkdownUploader clientId={clientId} type="editorial_line" />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-empire-card border border-empire-border animate-pulse" />
          ))}
        </div>
      ) : !deliverable || deliverable.status === 'locked' ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-empire-card border border-empire-border flex items-center justify-center">
            <Lock className="w-7 h-7 text-empire-text/30" />
          </div>
          <div>
            <p className="text-empire-text/60 font-medium">Conteúdo ainda não disponível</p>
            <p className="text-empire-text/40 text-sm mt-1">
              A Linha Editorial será liberada após as Fases 1 e 2 serem concluídas.
            </p>
          </div>
        </div>
      ) : deliverable.status === 'in_progress' ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-empire-gold/60 animate-spin" />
          <div>
            <p className="text-empire-text/60 font-medium">Processando...</p>
            <p className="text-empire-text/40 text-sm mt-1">
              Sua Linha Editorial está sendo gerada. Aguarde alguns instantes.
            </p>
          </div>
        </div>
      ) : (
        <EditorialLineView data={parseEditorialLineData(deliverable.processed_json)} />
      )}
    </div>
  )
}
