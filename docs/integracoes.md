# Integrações — Empire Maps

## Supabase

**Tipo:** Backend-as-a-Service (PostgreSQL + Auth + Storage + Edge Functions)

**Configuração:** `src/integrations/supabase/client.ts`
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Variáveis necessárias:**
- `VITE_SUPABASE_URL` — URL do projeto
- `VITE_SUPABASE_ANON_KEY` — Chave anon pública

**Recursos utilizados:**
- Auth (email/senha, JWT, session management)
- Database (PostgreSQL com RLS)
- Storage (4 buckets)
- Edge Functions (Deno)

---

## OpenRouter

**Tipo:** Gateway de IA — acesso unificado a múltiplos modelos

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Modelos usados:**
| Função                 | Modelo                    |
|------------------------|---------------------------|
| process-deliverable    | `anthropic/claude-3.5-sonnet` |
| suggest-content-reuse  | `anthropic/claude-3.5-haiku`  |

**Variável necessária (Edge Functions):**
- `OPENROUTER_API_KEY` — Chave da API OpenRouter

**Como configurar:**
```bash
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-...
```

**Headers obrigatórios:**
```
Authorization: Bearer {OPENROUTER_API_KEY}
HTTP-Referer: https://empiremaps.com.br
X-Title: Empire Maps
```

---

## Resend

**Tipo:** Serviço de envio de e-mail transacional

**Endpoint:** `https://api.resend.com/emails`

**Uso:** Envio de e-mail de boas-vindas para novos usuários (Edge Function `send-welcome-email`)

**Variável necessária (Edge Functions):**
- `RESEND_API_KEY` — Chave da API Resend

**Como configurar:**
```bash
supabase secrets set RESEND_API_KEY=re_...
```

**Remetente:** `Empire Maps <noreply@empiremaps.com.br>`
(Domínio deve estar verificado no Resend)

---

## Google Fonts

**Tipo:** CDN de fontes web

**Integração:** `index.html` com preconnect + stylesheet

**Fontes carregadas:**
- `Cormorant+Garamond:wght@300;400;500;600;700` — Display/Headings
- `DM+Sans:wght@300;400;500;600` — Body/UI

---

## Supabase Management API

**Tipo:** API REST para gerenciamento do projeto Supabase

**Uso:** Aplicação de migrations SQL sem CLI (apenas desenvolvimento)

**Endpoint:** `https://api.supabase.com/v1/projects/{project_ref}/database/query`

**Autenticação:** Personal Access Token (nunca em produção)

---

## Variáveis de Ambiente Resumo

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Edge Functions (Supabase Secrets)
```bash
OPENROUTER_API_KEY=sk-or-v1-...
RESEND_API_KEY=re_...
# SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetados automaticamente
```
