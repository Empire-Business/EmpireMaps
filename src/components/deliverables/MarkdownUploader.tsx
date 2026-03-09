import { useRef, useState } from 'react'
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useUploadMarkdown } from '@/hooks/useDeliverable'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type DeliverableType = Database['public']['Tables']['deliverables']['Row']['type']

type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface MarkdownUploaderProps {
  clientId: string
  type: DeliverableType
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export function MarkdownUploader({ clientId, type }: MarkdownUploaderProps) {
  const { profile } = useAuth()
  const uploadMutation = useUploadMarkdown(clientId, type)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  // Only visible to admin/consultant
  if (profile?.role === 'client') return null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)

    if (!file.name.endsWith('.md')) {
      setErrorMsg('Apenas arquivos .md são aceitos.')
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg('O arquivo não pode ultrapassar 5MB.')
      return
    }

    setFileName(file.name)
    setUploadState('uploading')

    try {
      const text = await file.text()
      setUploadState('uploading')
      await uploadMutation.mutateAsync(text)

      // Invoke Edge Function to process with AI
      setUploadState('processing')
      const { error: fnError } = await supabase.functions.invoke('process-deliverable', {
        body: { client_id: clientId, type },
      })
      if (fnError) {
        // Non-fatal: file was uploaded, processing failed
        console.warn('Edge Function error:', fnError)
      }

      setUploadState('done')
    } catch (err) {
      setUploadState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleClick() {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-empire-card border border-empire-border p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-empire-gold" />
        <h3 className="text-sm font-medium text-empire-text">Upload de Markdown</h3>
        <span className="text-xs bg-empire-gold/10 text-empire-gold px-2 py-0.5 border border-empire-gold/20">
          {profile?.role === 'admin' ? 'Admin' : 'Consultor'}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadState === 'idle' && (
        <button
          onClick={handleClick}
          className={cn(
            'w-full border-2 border-dashed border-empire-border hover:border-empire-gold/40',
            'py-8 flex flex-col items-center gap-2 transition-colors group'
          )}
        >
          <Upload className="w-6 h-6 text-empire-text/30 group-hover:text-empire-gold/60 transition-colors" />
          <div className="text-center">
            <p className="text-empire-text/60 text-sm">Clique para selecionar um arquivo .md</p>
            <p className="text-empire-text/30 text-xs mt-0.5">Máximo 5MB</p>
          </div>
        </button>
      )}

      {uploadState === 'uploading' && (
        <div className="py-6 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-empire-gold animate-spin" />
          <p className="text-empire-text/60 text-sm">Enviando {fileName}...</p>
        </div>
      )}

      {uploadState === 'processing' && (
        <div className="py-6 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-empire-gold animate-spin" />
          <p className="text-empire-text/60 text-sm">Processando...</p>
        </div>
      )}

      {uploadState === 'done' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-400 text-sm font-medium">Arquivo recebido.</p>
              <p className="text-emerald-400/70 text-xs mt-0.5">
                O conteúdo está sendo processado pela IA. Aguarde alguns instantes e recarregue a página.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUploadState('idle')}
            className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors"
          >
            Enviar outro arquivo
          </button>
        </div>
      )}

      {uploadState === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{errorMsg ?? 'Erro ao processar arquivo.'}</p>
          </div>
          <button
            onClick={() => { setUploadState('idle'); setErrorMsg(null) }}
            className="text-xs text-empire-gold/70 hover:text-empire-gold transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
