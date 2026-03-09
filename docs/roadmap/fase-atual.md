# Roadmap — Fase Atual (MVP)

## Status Geral: ✅ MVP Completo

---

## G1 — Setup do Projeto ✅
- [x] Vite + React 18 + TypeScript strict
- [x] Tailwind CSS com design system Empire
- [x] shadcn/ui configurado
- [x] Supabase client configurado
- [x] Path aliases (@/*)
- [x] Fontes Google (Cormorant Garamond + DM Sans)

## G2 — Banco de Dados ✅
- [x] 7 tabelas criadas com migrations SQL
- [x] RLS habilitado em todas as tabelas
- [x] Políticas de acesso por role
- [x] Storage buckets (4 buckets)
- [x] Trigger handle_new_user
- [x] Funções helper get_my_role(), is_my_client()

## G3 — Autenticação ✅
- [x] Login com email/senha
- [x] Recuperação de senha
- [x] AuthContext com profile
- [x] ProtectedRoute com roles
- [x] Redirecionamento por role após login

## G4 — Layout e Navegação ✅
- [x] Sidebar com links por role
- [x] Header com user info
- [x] AppLayout (Sidebar + Header + Outlet)
- [x] ImpersonationBanner (fixo no topo)

## G5 — Painel Admin ✅
- [x] AdminDashboard com stats e logs de impersonation
- [x] UsersPage com filtros e tabela
- [x] Criação de usuários via Auth Admin API
- [x] FormatLibraryAdminPage com CRUD completo

## G6 — Painel Consultor ✅
- [x] ConsultantDashboard com grid de clientes
- [x] Progress bars por fase
- [x] Botão de impersonation
- [x] ImpersonationContext

## G7 — Diagnóstico (Fase 1) ✅
- [x] Formulário completo (dados pessoais, redes sociais, objetivos)
- [x] Auto-save com debounce (2s)
- [x] Bloqueio após envio
- [x] Admin/consultor pode editar mesmo bloqueado

## G8 — Entregáveis (Fase 2) ✅
- [x] MarkdownUploader (upload + trigger Edge Function)
- [x] RiskMapPage + RiskMapView
- [x] BrandBookPage + BrandBookView
- [x] EditorialLinePage + EditorialLineView
- [x] Status locked → in_progress → ready

## G9 — Mapa de Produção (Fase 3) ✅
- [x] Kanban com 5 colunas (@dnd-kit)
- [x] Drag & drop entre colunas
- [x] Cards com título, formato, canal, tags, data
- [x] Modal de criação/edição de cards
- [x] FormatLibraryPage (banco de formatos com filtros)
- [x] DistributionMapPage (calendário mensal)

## G10 — Edge Functions ✅
- [x] process-deliverable (OpenRouter → JSON estruturado)
- [x] suggest-content-reuse (IA de reaproveitamento)
- [x] send-welcome-email (Resend)

## G11 — Documentação ✅
- [x] agents.md
- [x] docs/arquitetura.md
- [x] docs/banco-de-dados.md
- [x] docs/integracoes.md
- [x] docs/seguranca.md
- [x] docs/roadmap/

---

## Próximas Iterações

### Melhorias de UX
- [ ] Notificações toast (react-hot-toast ou sonner)
- [ ] Upload de avatar
- [ ] Busca global
- [ ] Atalhos de teclado no Kanban

### Funcionalidades novas
- [ ] Botão "Sugerir Reaproveitamento" nos cards (integração suggest-content-reuse)
- [ ] Anexos nos cards (card_attachments)
- [ ] Relatório de progresso por cliente (PDF export)
- [ ] Notificações in-app (Supabase Realtime)

### Infraestrutura
- [ ] Deploy no Vercel/Netlify
- [ ] Deploy das Edge Functions
- [ ] Configurar domínio empiremaps.com.br no Resend
- [ ] Configurar OPENROUTER_API_KEY e RESEND_API_KEY nos secrets
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics (Plausible ou similar)
