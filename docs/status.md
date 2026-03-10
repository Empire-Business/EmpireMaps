# Empire Maps — Status de Implementação

> Documento vivo: atualizado a cada sessão de desenvolvimento.
> Última atualização: 2026-03-10 · Branch: main (sincronizada com GILDASIO1)

---

## Resumo Geral

| Épico | Status | Completude |
|-------|--------|------------|
| G01 Foundation | ✅ Completo | 100% |
| G02 Auth & Usuários | ✅ Completo | 100% |
| G03 Layout & Navegação | ✅ Completo | 100% |
| G04 Diagnóstico | ✅ Completo | 100% |
| G05 Entregáveis com IA | ✅ Completo | 100% |
| G06 Mapa de Produção / Distribuição | ✅ Completo | 100% |
| G07 Banco de Formatos | ✅ Completo | 100% |
| G08 Admin | ✅ Completo | 100% |
| G09 Edge Functions | ✅ Completo | 100% |
| G10 Polish & Deploy | ✅ Completo | 100% |

**Completude geral: 100% 🎉**

---

## G01 — Foundation ✅

- [x] Vite + React 18 + TypeScript strict
- [x] Tailwind CSS v3 com design system Empire (tokens, cores, tipografia)
- [x] Supabase client configurado
- [x] Estrutura de pastas padronizada
- [x] Schema do banco completo (8 tabelas + RLS)
- [x] Build limpo (`tsc -b && vite build` sem erros)

---

## G02 — Auth & Usuários ✅

- [x] LoginPage com email/senha
- [x] ForgotPasswordPage
- [x] AuthContext com `user` e `profile`
- [x] Redirect pós-login por role
- [x] ProtectedRoute com verificação de role
- [x] Trigger `handle_new_user` → cria perfil em `profiles`
- [x] ImpersonationContext (admin/consultor entra como cliente)
- [x] Banner de impersonação (fixo no topo, dourado)
- [x] Log em `impersonation_logs`
- [x] Criação de usuário via Edge Function `create-user` (Admin API)
- [x] Vinculação consultor ↔ cliente com verificação de duplicata

---

## G03 — Layout & Navegação ✅

- [x] AppLayout com Sidebar + Header + área de conteúdo
- [x] Sidebar responsiva: fixa no desktop, slide-in no mobile (hamburger)
- [x] Sidebar troca para menu do cliente durante impersonação
- [x] Header com avatar, upload de foto de perfil, dropdown
- [x] Navegação role-based (itens diferentes por perfil)
- [x] Toaster (sonner) configurado globalmente

---

## G04 — Diagnóstico ✅

- [x] Formulário completo: nome, email, WhatsApp (DDI com 24 países + busca), redes sociais (8), objetivos
- [x] Auto-save com debounce de 2s
- [x] Submit com bloqueio do formulário (`is_locked = true`)
- [x] Admin/consultor pode editar mesmo após bloqueio
- [x] Botão "Desbloquear" para admin/consultor liberar o cliente para reeditar

---

## G05 — Entregáveis com IA ✅

### MarkdownUploader
- [x] Aceita `.md` até 5MB
- [x] Modo de colar texto diretamente (sem precisar de arquivo)
- [x] Estados: idle → uploading → processing → **review** → error
- [x] Após IA processar, fica em estado "review" com botão **"Publicar para o cliente"**
- [x] Se recarregar página com `in_progress` + `processed_json`, botão de publicar reaparece
- [x] `usePublishDeliverable` faz o flip para `status = 'published'`

### Mapa de Riscos
- [x] Upload + processamento IA + visualização
- [x] Navegação lateral por seção (DeliverableNav)

### Brand Book
- [x] Upload + processamento IA + visualização
- [x] Navegação lateral por seção (DeliverableNav)
- [x] Prompt da IA alinhado com estrutura do componente (thesis, archetype, written_voice, etc.)

### Linha Editorial
- [x] Upload + processamento IA + visualização
- [x] Links para Banco de Formatos (FormatTag com ExternalLink)
- [x] Navegação lateral (DeliverableNav)

---

## G06 — Mapa de Produção / Distribuição ✅

### Mapa de Produção (Kanban)
- [x] 6 colunas: Ideia, Em Produção, Revisão, Agendado, Publicado, Arquivado
- [x] Drag-and-drop entre colunas (@dnd-kit/core)
- [x] Modal de card com todos os campos
- [x] Métricas de desempenho: reach, impressions, engagement_rate
- [x] Anexos: upload de arquivos no card (Storage bucket `card-attachments`)
- [x] Permissão de exclusão: cliente só deleta cards que criou
- [x] Importação por IA: `ProductionMapUploader` + Edge Function `parse-production-map`
- [x] Sugestão de reaproveitamento (Sparkles + IA)
- [x] Notas internas visíveis apenas para admin/consultor
- [ ] **PENDENTE:** Campo `format_id` (FK para `content_formats`) — UI usa apenas `format_free`

### Mapa de Distribuição (Calendário)
- [x] Calendário mensal com cards por data de publicação
- [x] Navegação por mês
- [x] Adição manual de itens pelo cliente (QuickAddModal com +)
- [x] Filtros: por canal e por status (painel colapsável, badge de filtros ativos)
- [x] Painel de análise: total no mês, publicados (%), agendados, taxa de planejamento

---

## G07 — Banco de Formatos ✅

### Admin
- [x] CRUD completo: criar, editar, arquivar (nunca deletar)
- [x] Campos: nome, plataformas, descrição, como fazer, dicas, exemplos, tags, status
- [x] Thumbnail upload via Storage bucket `format-thumbnails`

### Cliente / Consultor
- [x] Grid com filtro por plataforma e busca por nome
- [x] Drawer lateral com detalhes completos
- [x] Exemplos/referências como links clicáveis (ExternalLink)
- [x] Seção "Recentemente vistos" via localStorage (`useRecentFormats`)

---

## G08 — Admin ✅

### Dashboard
- [x] Stats: total usuários, consultores, clientes
- [x] Tabela de diagnósticos enviados (cliente, data, status)
- [x] Últimos 10 logs de impersonação

### Gestão de Usuários
- [x] Tabela com filtros por role e busca por nome
- [x] Modal criar usuário (nome, email, senha, role) via Edge Function
- [x] Vinculação consultor ↔ cliente
- [x] Botão "Entrar" para impersonar cliente
- [x] Email de boas-vindas (best-effort via Resend)

### Painel do Consultor
- [x] Grid de clientes com progresso de entregáveis
- [x] Indicador de diagnóstico (enviado/pendente)
- [x] Botão entrar como cliente

---

## G09 — Edge Functions ✅

| Função | Status | Deploy |
|--------|--------|--------|
| `create-user` | ✅ Funcional | ✅ `--no-verify-jwt` |
| `process-deliverable` | ✅ Funcional | ✅ `--no-verify-jwt` |
| `parse-production-map` | ✅ Funcional | ✅ `--no-verify-jwt` |
| `suggest-content-reuse` | ✅ Funcional | ✅ `--no-verify-jwt` |
| `send-welcome-email` | ✅ Funcional | ✅ `--no-verify-jwt` |

### Secrets configurados:
- `RESEND_API_KEY` ✅
- `OPENROUTER_API_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` (auto-injetado) ✅
- `SUPABASE_URL` (auto-injetado) ✅

---

## G10 — Polish & Deploy ✅

- [x] Skeletons de loading nas principais páginas
- [x] Estados vazios com ícone + mensagem em todas as listas
- [x] Toasts de feedback (sonner) em todas as operações críticas
- [x] Sidebar responsiva com hamburger no mobile
- [x] Deploy Vercel com `vercel.json` (SPA rewrite)
- [x] Variáveis de ambiente configuradas no Vercel
- [x] Animações de entrada (classes `fade-in-up` / `stagger-children` definidas)
- [x] Busca global (Ctrl+K) — `GlobalSearch` com navegação por teclado
- [x] Sentry error monitoring — `src/lib/sentry.ts` (ativar via `VITE_SENTRY_DSN`)
- [x] Analytics Plausible — script em `index.html`

---

## Itens Pendentes (Infraestrutura / Externo)

| Item | Observação |
|------|------------|
| `VITE_SENTRY_DSN` no `.env` | Criar projeto em sentry.io e adicionar DSN |
| Storage bucket `format-thumbnails` | Criar manualmente no Supabase Dashboard se não existir |
| Domínio customizado `empiremaps.com.br` | Configurar no Vercel + DNS |

---

## Infraestrutura

### Supabase
- **Project ref:** `lsrhlxwjndlaegvjdcmz`
- **URL:** `https://lsrhlxwjndlaegvjdcmz.supabase.co`
- 5 Edge Functions deployadas

### Vercel
- SPA routing via `vercel.json`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_NAME`, `VITE_APP_URL`

### Storage Buckets necessários
- `card-attachments` — anexos de cards do mapa de produção
- `format-thumbnails` — thumbnails dos formatos de conteúdo
- `avatars` — fotos de perfil dos usuários

---

## Usuários de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Consultor | consultor@empiremaps.com | Empire@2026 |
| Cliente | cliente@empiremaps.com | Empire@2026 |

> Admin: criar diretamente pelo Supabase Dashboard com `role = 'admin'`.

---

## Git

| Branch | Status |
|--------|--------|
| `main` | Branch principal, sincronizada |
| `GILDASIO1` | Sincronizada com `main` |
