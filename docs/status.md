# Empire Maps — Status de Implementação

> Documento vivo: atualizado a cada sessão de desenvolvimento.
> Última atualização: 2026-03-09 · Branch: main (merge de GILDASIO1)

---

## Resumo Geral

| Épico | Status | Completude |
|-------|--------|------------|
| G01 Foundation | ✅ Completo | 100% |
| G02 Auth & Usuários | ✅ Completo | 95% |
| G03 Layout & Navegação | ✅ Completo | 100% |
| G04 Diagnóstico | ✅ Completo | 100% |
| G05 Entregáveis com IA | ✅ Completo | 90% |
| G06 Mapa de Produção / Distribuição | ✅ Completo | 90% |
| G07 Banco de Formatos | ✅ Completo | 85% |
| G08 Admin | ✅ Completo | 85% |
| G09 Edge Functions | ✅ Completo | 85% |
| G10 Polish & Deploy | ⚠️ Parcial | 30% |

**Completude geral estimada: ~87%**

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
- [x] ImpersonationContext (consultor entra como cliente)
- [x] Banner de impersonação
- [x] Log em `impersonation_logs`
- [ ] **PENDENTE:** Verificar se RLS bloqueia `internal_notes` para clientes no nível de query (atualmente o hook não filtra explicitamente)

---

## G03 — Layout & Navegação ✅

- [x] AppLayout com Sidebar + Header + área de conteúdo
- [x] Sidebar responsiva: fixa no desktop, slide-in no mobile (hamburger)
- [x] Header com avatar, upload de foto de perfil, dropdown
- [x] Navegação role-based (itens diferentes por perfil)
- [x] Toaster (sonner) configurado globalmente

---

## G04 — Diagnóstico ✅

- [x] Formulário completo: nome, email, WhatsApp (DDI com 24 países + busca), redes sociais (8), objetivos
- [x] Auto-save com debounce de 2s
- [x] Submit com bloqueio do formulário (`is_locked = true`)
- [x] Admin/consultor pode editar mesmo após bloqueio
- [ ] **PENDENTE:** Botão "Desbloquear para o cliente reeditar" (o campo `is_locked` existe no banco, só falta o botão na UI)

---

## G05 — Entregáveis com IA ✅

### MarkdownUploader
- [x] Aceita `.md` até 5MB
- [x] Estados: idle → uploading → processing → **review** → error
- [x] Após IA processar, fica em estado "review" com botão **"Publicar para o cliente"** (fluxo com revisão)
- [x] Se recarregar página com `in_progress` + `processed_json`, botão de publicar reaparece
- [x] `usePublishDeliverable` faz o flip para `status = 'published'`

### Mapa de Riscos
- [x] Upload + processamento IA + visualização
- [x] Navegação lateral por seção (DeliverableNav)
- [x] Sections: summary, risks, opportunities, recommendations, highlights

### Brand Book
- [x] Upload + processamento IA + visualização
- [x] Paleta de cores com preview visual (hex)
- [ ] **PENDENTE:** DeliverableNav (navegação lateral) não foi adicionado na BrandBookPage

### Linha Editorial
- [x] Upload + processamento IA + visualização
- [x] Links para Banco de Formatos (FormatTag com ExternalLink)
- [x] Navegação lateral (DeliverableNav)
- [x] Hint: "Formatos em dourado estão disponíveis no Banco de Formatos"

---

## G06 — Mapa de Produção / Distribuição ✅

### Mapa de Produção (Kanban)
- [x] 6 colunas: Ideia, Em Produção, Revisão, Agendado, Publicado, Arquivado
- [x] Drag-and-drop entre colunas (@dnd-kit/core)
- [x] Modal de card com todos os campos
- [x] **Métricas de desempenho:** reach, impressions, engagement_rate (visível quando status = publicado)
- [x] **Anexos:** upload de arquivos no card (Storage bucket `card-attachments`, hook `useCardAttachments`)
- [x] **Permissão de exclusão:** cliente só pode deletar cards que ele mesmo criou; cards do consultor são protegidos (botão de lixeira com confirmação)
- [x] **Importação por IA:** `ProductionMapUploader` sobe `.md` e Edge Function `parse-production-map` cria os cards automaticamente
- [x] Sugestão de reaproveitamento (Sparkles + IA)
- [x] Notas internas visíveis apenas para admin/consultor
- [ ] **PENDENTE:** Campo `format_id` (FK para `content_formats`) nunca é preenchido — UI usa apenas `format_free` (texto livre)

### Mapa de Distribuição (Calendário)
- [x] Calendário mensal com cards por data de publicação
- [x] Navegação por mês
- [x] **Filtros:** por canal e por status (painel colapsável, badge de filtros ativos)
- [x] **Painel de análise:** total no mês, publicados (%), agendados, taxa de planejamento
- [x] Summary bar por canal

---

## G07 — Banco de Formatos ✅

### Admin
- [x] CRUD completo: criar, editar, arquivar (nunca deletar)
- [x] Campos: nome, plataformas, descrição, como fazer, dicas (array), exemplos/referências (links), tags, status
- [ ] **PENDENTE:** Thumbnail upload no admin (campo `thumbnail_url` existe no banco mas só aceita URL digitada)

### Cliente / Consultor
- [x] Grid com filtro por plataforma e busca por nome
- [x] Drawer lateral com detalhes completos
- [x] Exemplos/referências como links clicáveis (ExternalLink)

---

## G08 — Admin ✅

### Dashboard
- [x] Stats: total usuários, consultores, clientes
- [x] Últimos 10 logs de impersonação

### Gestão de Usuários
- [x] Tabela com filtros por role e busca por nome
- [x] Modal criar usuário (nome, email, senha, role)
- [x] Vinculação consultor ↔ cliente
- [x] Chama `send-welcome-email` na criação
- [ ] **PENDENTE:** Status ativo/inativo para usuários
- [ ] **PENDENTE:** Visualização central de diagnósticos submetidos
- [ ] **PENDENTE:** Indicador no grid do consultor: se cliente já submeteu diagnóstico

---

## G09 — Edge Functions ✅

| Função | Status | Descrição |
|--------|--------|-----------|
| `process-deliverable` | ✅ Funcional | Processa `.md` → JSON estruturado para os 3 tipos de entregável. Mantém `in_progress` após processar (consultor revisa antes de publicar) |
| `suggest-content-reuse` | ✅ Funcional | Analisa card e sugere formatos/canais para reaproveitamento de conteúdo |
| `parse-production-map` | ✅ Funcional | Recebe markdown de pauta → IA extrai conteúdos → cria cards em `content_cards` |
| `send-welcome-email` | ⚠️ Incompleto | Código pronto, mas precisa `RESEND_API_KEY` nos Secrets do Supabase para funcionar |

### Para ativar `send-welcome-email`:
```bash
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref lsrhlxwjndlaegvjdcmz
```

### Para fazer deploy das Edge Functions em produção:
```bash
supabase functions deploy process-deliverable --project-ref lsrhlxwjndlaegvjdcmz
supabase functions deploy suggest-content-reuse --project-ref lsrhlxwjndlaegvjdcmz
supabase functions deploy parse-production-map --project-ref lsrhlxwjndlaegvjdcmz
supabase functions deploy send-welcome-email --project-ref lsrhlxwjndlaegvjdcmz

supabase secrets set OPENROUTER_API_KEY=sk-or-v1-... --project-ref lsrhlxwjndlaegvjdcmz
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ... --project-ref lsrhlxwjndlaegvjdcmz
```

---

## G10 — Polish & Deploy ⚠️

- [x] Skeletons de loading nas principais páginas
- [x] Estados vazios com ícone + mensagem em todas as listas
- [x] Toasts de feedback (sonner) em todas as operações críticas
- [x] Sidebar responsiva com hamburger no mobile
- [ ] **PENDENTE:** Deploy (nenhum `vercel.json` / `netlify.toml` configurado)
- [ ] **PENDENTE:** Animações de entrada (classes `fade-in-up` / `stagger-children` definidas mas não aplicadas uniformemente)

---

## Itens Pendentes Priorizados

### Alta prioridade
| Item | Arquivo | Esforço |
|------|---------|---------|
| DeliverableNav no BrandBookPage | `src/pages/client/BrandBookPage.tsx` | Baixo |
| Deploy da aplicação (Vercel/Netlify) | configuração de projeto | Médio |
| Deploy das Edge Functions + Secrets | `supabase secrets set` | Baixo |
| Ativar `send-welcome-email` (Resend key) | secrets do Supabase | Baixo |

### Média prioridade
| Item | Arquivo | Esforço |
|------|---------|---------|
| Botão desbloquear diagnóstico para cliente | `DiagnosticPage.tsx` | Baixo |
| Thumbnail upload no admin de formatos | `FormatLibraryAdminPage.tsx` | Médio |
| Seletor de `format_id` no modal do card | `ProductionMapPage.tsx` | Médio |
| Indicador de diagnóstico submetido no painel do consultor | `ConsultantDashboard.tsx` | Baixo |

### Baixa prioridade
| Item | Esforço |
|------|---------|
| Paginação em listas grandes | Médio |
| Rich text editor no "Como fazer" do formato | Alto |
| Histórico de versões dos entregáveis | Alto |
| Notificações em tempo real | Alto |
| Analytics de uso dos formatos | Médio |
| Auditoria de diagnósticos no painel admin | Médio |

---

## Usuários de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Consultor | consultor@empiremaps.com | Empire@2026 |
| Cliente | cliente@empiremaps.com | Empire@2026 |

> Admin: criar diretamente pelo Supabase Dashboard com `role = 'admin'`.

---

## Git

| Branch | Commits | Última alteração |
|--------|---------|-----------------|
| `main` | 4 | 2026-03-09 — merge GILDASIO1 |
| `GILDASIO1` | 3 | 2026-03-09 — alta prioridade |
