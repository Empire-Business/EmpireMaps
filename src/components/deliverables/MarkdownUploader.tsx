import { useRef, useState } from 'react'
import { Upload, AlertCircle, Loader2, Eye, Send, FileText } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useUploadMarkdown, useDeliverable, usePublishDeliverable } from '@/hooks/useDeliverable'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

type DeliverableType = Database['public']['Tables']['deliverables']['Row']['type']

type UploadState = 'idle' | 'uploading' | 'processing' | 'review' | 'error'

interface MarkdownUploaderProps {
  clientId: string
  type: DeliverableType
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

const TYPE_LABELS: Record<DeliverableType, string> = {
  risk_map: 'Mapa de Riscos',
  brand_book: 'Brand Book',
  editorial_line: 'Linha Editorial',
}

export function MarkdownUploader({ clientId, type }: MarkdownUploaderProps) {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const uploadMutation = useUploadMarkdown(clientId, type)
  const publishMutation = usePublishDeliverable()
  const { data: deliverable } = useDeliverable(clientId, type)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState('')

  // Only visible to admin/consultant
  if (profile?.role === 'client') return null

  async function processText(text: string, name: string) {
    setErrorMsg(null)
    setFileName(name)
    setUploadState('uploading')
    try {
      await uploadMutation.mutateAsync(text)
      setUploadState('processing')
      const { error: fnError } = await supabase.functions.invoke('process-deliverable', {
        body: { client_id: clientId, type },
      })
      if (fnError) {
        setErrorMsg('Processamento com IA falhou, mas o conteúdo foi salvo. Tente novamente.')
        setUploadState('error')
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['deliverable', clientId, type] })
      setUploadState('review')
    } catch (err) {
      setUploadState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao processar')
    }
  }

  async function handlePasteSubmit() {
    if (!pasteText.trim()) return
    setPasteMode(false)
    await processText(pasteText.trim(), 'colado')
    setPasteText('')
  }

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

    if (fileInputRef.current) fileInputRef.current.value = ''
    const text = await file.text()
    await processText(text, file.name)
  }

  async function handlePublish() {
    if (!deliverable) return
    try {
      await publishMutation.mutateAsync(deliverable.id)
      setUploadState('idle')
      setFileName(null)
    } catch {
      // toast handled in hook
    }
  }

  function handleClick() {
    fileInputRef.current?.click()
  }

  const isAlreadyPublished = deliverable?.status === 'published'

  return (
    <div className="bg-empire-card border border-empire-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-empire-gold" />
          <h3 className="text-sm font-medium text-empire-text">Upload de Markdown</h3>
          <span className="text-xs bg-empire-gold/10 text-empire-gold px-2 py-0.5 border border-empire-gold/20">
            {profile?.role === 'admin' ? 'Admin' : 'Consultor'}
          </span>
        </div>

        {isAlreadyPublished && uploadState === 'idle' && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5">
            Publicado
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploadState === 'idle' && !pasteMode && (
        <div className="space-y-2">
          <button
            onClick={handleClick}
            className={cn(
              'w-full border-2 border-dashed border-empire-border hover:border-empire-gold/40',
              'py-6 flex flex-col items-center gap-2 transition-colors group'
            )}
          >
            <Upload className="w-6 h-6 text-empire-text/30 group-hover:text-empire-gold/60 transition-colors" />
            <div className="text-center">
              <p className="text-empire-text/60 text-sm">
                {isAlreadyPublished ? 'Reenviar arquivo .md' : 'Clique para selecionar um arquivo .md'}
              </p>
              <p className="text-empire-text/30 text-xs mt-0.5">Máximo 5MB</p>
            </div>
          </button>
          <button
            onClick={() => setPasteMode(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-empire-text/40 hover:text-empire-text/70 transition-colors border border-empire-border/50 hover:border-empire-border"
          >
            <FileText className="w-3.5 h-3.5" />
            Ou cole o texto diretamente
          </button>
        </div>
      )}

      {uploadState === 'idle' && pasteMode && (
        <div className="space-y-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Cole o conteúdo em markdown aqui..."
            rows={10}
            className="w-full bg-empire-surface border border-empire-border text-empire-text text-sm px-4 py-3 focus:outline-none focus:border-empire-gold/50 transition-colors resize-none font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setPasteMode(false); setPasteText('') }}
              className="flex-1 btn-secondary justify-center text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={!pasteText.trim()}
              className="flex-1 btn-premium justify-center text-sm disabled:opacity-50"
            >
              Processar
            </button>
          </div>
        </div>
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
          <p className="text-empire-text/60 text-sm">Processando com IA...</p>
          <p className="text-empire-text/30 text-xs">Isso pode levar alguns segundos</p>
        </div>
      )}

      {uploadState === 'review' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 px-4 py-3">
            <Eye className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 text-sm font-medium">Processamento concluído.</p>
              <p className="text-blue-400/70 text-xs mt-0.5">
                Revise o {TYPE_LABELS[type]} nas seções abaixo e publique quando estiver pronto.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setUploadState('idle'); setFileName(null) }}
              className="flex-1 btn-secondary justify-center text-sm"
            >
              Reenviar arquivo
            </button>
            <button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="flex-1 btn-premium justify-center text-sm disabled:opacity-50"
            >
              {publishMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
              ) : (
                <><Send className="w-4 h-4" /> Publicar para o cliente</>
              )}
            </button>
          </div>
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

      {/* When deliverable is in_progress and we're in idle (e.g. refreshed page) */}
      {uploadState === 'idle' && deliverable?.status === 'in_progress' && deliverable.processed_json && (
        <div className="space-y-3 border-t border-empire-border pt-3">
          <p className="text-sm text-empire-text/60">
            Existe uma versão processada aguardando publicação.
          </p>
          <button
            onClick={handlePublish}
            disabled={publishMutation.isPending}
            className="btn-premium text-sm disabled:opacity-50"
          >
            {publishMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
            ) : (
              <><Send className="w-4 h-4" /> Publicar para o cliente</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
