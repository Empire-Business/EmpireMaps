# Empire Maps — Agentes de IA

Este documento descreve os agentes (Edge Functions) de IA que compõem o Empire Maps.

---

## 1. `process-deliverable`

**Propósito:** Processa um arquivo Markdown enviado por admin/consultor e gera JSON estruturado para exibição no portal do cliente.

**Trigger:** Chamada manual via `MarkdownUploader` após upload no Storage.

**Fluxo:**
1. Recebe `{ client_id, type, markdown_path }`
2. Marca o deliverable como `in_progress` no banco
3. Baixa o arquivo `.md` do bucket `deliverable-markdowns`
4. Envia para OpenRouter (Claude 3.5 Sonnet) com system prompt especializado por tipo
5. Salva `processed_json` no banco e marca como `ready`

**Tipos suportados:**
- `risk_map` — Extrai riscos com probabilidade, impacto, categoria e mitigação
- `brand_book` — Extrai identidade visual, tom de voz, público-alvo
- `editorial_line` — Extrai pilares de conteúdo, canais, frequência, KPIs

**Variáveis de ambiente necessárias:**
- `OPENROUTER_API_KEY`
- `SUPABASE_URL` (automática)
- `SUPABASE_SERVICE_ROLE_KEY` (automática)

---

## 2. `suggest-content-reuse`

**Propósito:** Analisa um card de conteúdo existente e sugere formas de reaproveitamento em outros formatos e canais.

**Trigger:** Botão "Sugerir Reaproveitamento" no ProductionMapPage (futuro).

**Fluxo:**
1. Recebe `{ client_id, card_id }`
2. Busca o card completo no banco
3. Busca a linha editorial do cliente para contexto
4. Envia para OpenRouter (Claude 3.5 Haiku — mais rápido e barato)
5. Retorna sugestões com formato, canal, racional e dicas de adaptação

**Variáveis de ambiente necessárias:**
- `OPENROUTER_API_KEY`
- `SUPABASE_URL` (automática)
- `SUPABASE_SERVICE_ROLE_KEY` (automática)

---

## 3. `send-welcome-email`

**Propósito:** Envia e-mail de boas-vindas para novos usuários criados pela equipe.

**Trigger:** Chamada manual após criação de usuário via Admin Panel (UsersPage).

**Fluxo:**
1. Recebe `{ user_id, email, full_name, temp_password? }`
2. Verifica se o usuário existe no banco
3. Envia e-mail HTML elegante via Resend API
4. Inclui dados de acesso (e-mail + senha temporária se fornecida)

**Variáveis de ambiente necessárias:**
- `RESEND_API_KEY`
- `SUPABASE_URL` (automática)
- `SUPABASE_SERVICE_ROLE_KEY` (automática)

---

## Modelo de IA

| Edge Function         | Modelo              | Justificativa                        |
|-----------------------|---------------------|--------------------------------------|
| process-deliverable   | claude-3.5-sonnet   | Maior precisão para análise complexa |
| suggest-content-reuse | claude-3.5-haiku    | Velocidade e custo para sugestões    |

Todos os modelos são acessados via **OpenRouter** para flexibilidade de fallback e controle de custo.

---

## Deploy

```bash
# Deploy individual
supabase functions deploy process-deliverable
supabase functions deploy suggest-content-reuse
supabase functions deploy send-welcome-email

# Configurar secrets
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase secrets set RESEND_API_KEY=re_...
```

## Desenvolvimento local

```bash
supabase start
supabase functions serve process-deliverable --env-file .env.local
```
