import { useRef, useState } from 'react'
import { Upload, AlertCircle, Loader2, CheckCircle2, FileText } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'

interface ProductionMapUploaderProps {
  clientId: string
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export function ProductionMapUploader({ clientId }: ProductionMapUploaderProps) {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdCount, setCreatedCount] = useState<number>(0)

  // Only for admin/consultant
  if (profile?.role === 'client') return null

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileInputRef.current) fileInputRef.current.value = ''

    setErrorMsg(null)

    if (!file.name.endsWith('.md')) {
      setErrorMsg('Apenas arquivos .md são aceitos.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg('O arquivo não pode ultrapassar 5MB.')
      return
    }

    setState('loading')
    try {
      const markdown = await file.text()
      const { data, error } = await supabase.functions.invoke('parse-production-map', {
        body: { client_id: clientId, markdown },
      })

      if (error) throw error

      const result = data as { success: boolean; created?: number; message?: string; error?: string }
      if (!result.success) throw new Error(result.error ?? 'Erro desconhecido')

      setCreatedCount(result.created ?? 0)
      setState('done')
      await queryClient.invalidateQueries({ queryKey: ['content-cards', clientId] })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao processar arquivo')
      setState('error')
    }
  }

  return (
    <div className="bg-empire-bone border border-empire-ghost p-5 space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-empire-gold" />
        <h3 className="text-sm font-medium text-empire-ink">Importar Mapa de Produção</h3>
        <span className="text-xs bg-empire-gold/10 text-empire-gold px-2 py-0.5 border border-empire-gold/20">
          IA
        </span>
      </div>
      <p className="text-xs text-empire-steel/50">
        Envie um arquivo .md e a IA criará os cards automaticamente no kanban.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={handleFile}
        className="hidden"
      />

      {state === 'idle' && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'w-full border-2 border-dashed border-empire-ghost hover:border-empire-gold/40',
            'py-6 flex flex-col items-center gap-2 transition-colors group'
          )}
        >
          <Upload className="w-5 h-5 text-empire-steel/30 group-hover:text-empire-gold/60 transition-colors" />
          <p className="text-empire-steel/60 text-sm">Selecionar arquivo .md</p>
        </button>
      )}

      {state === 'loading' && (
        <div className="py-5 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-empire-gold animate-spin" />
          <p className="text-empire-steel/60 text-sm">Processando com IA...</p>
        </div>
      )}

      {state === 'done' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-400 text-sm">
              {createdCount > 0
                ? `${createdCount} card${createdCount !== 1 ? 's' : ''} criado${createdCount !== 1 ? 's' : ''} com sucesso.`
                : 'Nenhum card identificado no documento.'}
            </p>
          </div>
          <button
            onClick={() => setState('idle')}
            className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors"
          >
            Importar outro arquivo
          </button>
        </div>
      )}

      {state === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-empire-danger flex-shrink-0 mt-0.5" />
            <p className="text-empire-danger text-sm">{errorMsg ?? 'Erro ao processar.'}</p>
          </div>
          <button
            onClick={() => { setState('idle'); setErrorMsg(null) }}
            className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
