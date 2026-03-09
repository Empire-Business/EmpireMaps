# PRD Técnico — Empire Maps
**Portal de Entrega de Consultoria**
**Versão:** 1.0 — Documento somente leitura após criação
**Gerado em:** 2026-03-09
**Arquivo de instrução da IA:** `agents.md`

---

> ⚠️ Este arquivo é `docs/prd.md`. É somente leitura. Nunca edite após a criação.
> A primeira ação ao iniciar o projeto é criar este arquivo em `docs/prd.md` com exatamente este conteúdo.

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Explicação em Linguagem Simples](#2-explicação-em-linguagem-simples)
3. [Usuários e Permissões](#3-usuários-e-permissões)
4. [Funcionalidades Detalhadas](#4-funcionalidades-detalhadas)
5. [Design System](#5-design-system)
6. [Arquitetura Técnica](#6-arquitetura-técnica)
7. [Schema do Banco de Dados](#7-schema-do-banco-de-dados)
8. [Integrações Externas](#8-integrações-externas)
9. [Segurança](#9-segurança)
10. [Estrutura de Pastas](#10-estrutura-de-pastas)
11. [Documentação a Criar](#11-documentação-a-criar)
12. [Roadmap e Épicos](#12-roadmap-e-épicos)
13. [Ordem de Execução](#13-ordem-de-execução)
14. [Variáveis de Ambiente](#14-variáveis-de-ambiente)
15. [Regras de Código](#15-regras-de-código)

---

## 1. Visão Geral do Produto

**Nome:** Empire Maps
**Tipo:** Portal SaaS de entrega de consultoria — ambiente visual e centralizado por cliente
**Stack obrigatória:** React 18+ · TypeScript strict · Vite · Tailwind CSS · shadcn/ui · Lucide React · Supabase · React Router v6 · TanStack Query v5
**Ambiente de desenvolvimento:** Cursor / Windsurf / Claude Code / outro vibe coding
**Arquivo de IA:** `agents.md`

### O que é

Empire Maps é um portal de entrega de consultoria de comunicação digital. Em vez de entregar planilhas, documentos no Notion e arquivos soltos, cada cliente recebe um ambiente digital exclusivo e permanente — organizado, bonito, navegável — onde ficam centralizados todos os entregáveis da consultoria.

O acesso do cliente é permanente ("é seu para sempre"). O consultor é quem alimenta e atualiza o ambiente de cada cliente. Um administrador central gerencia todos os usuários e vinculações.

---

## 2. Explicação em Linguagem Simples

Imagine que você é consultor de comunicação. Ao final de um projeto, em vez de mandar 10 arquivos no Google Drive, você abre o Empire Maps, entra na conta do seu cliente (impersonamento) e sobe tudo num ambiente bonito, organizado em fases.

O cliente faz login e encontra tudo pronto: seu diagnóstico, seu brand book, sua linha editorial, seu calendário de conteúdo — tudo navegável, visual e permanente.

**Quem acessa o quê:**
- **Admin** — vê e gerencia todos os usuários, cria vínculos entre consultores e clientes, tem acesso total
- **Consultor** — vê seus clientes, pode "entrar" na conta de qualquer cliente vinculado a ele e subir conteúdo
- **Cliente** — vê apenas o próprio ambiente, não pode editar os entregáveis principais (mas pode usar o calendário)

**O que tem dentro do ambiente de cada cliente:**
1. **Formulário de Diagnóstico** — o cliente preenche seus dados básicos
2. **Mapa de Riscos e Oportunidades** — auditoria da presença digital do cliente
3. **Brand Book** — identidade narrativa da marca
4. **Linha Editorial** — plano estratégico de conteúdo
5. **Mapa de Produção** — calendário completo de conteúdo (tipo Trello/Notion)
6. **Mapa de Distribuição** — calendário de publicação e análise de métricas
7. **Banco de Formatos** — biblioteca de referências de formatos de conteúdo

---

## 3. Usuários e Permissões

### 3.1 Papéis (Roles)

| Role | Descrição |
|------|-----------|
| `admin` | Super administrador. Acesso total ao sistema. Gerencia todos os usuários e vínculos. |
| `consultant` | Consultor. Acessa apenas seus clientes vinculados. Pode impersonar qualquer cliente vinculado. |
| `client` | Cliente. Acessa apenas seu próprio ambiente. |

### 3.2 Matriz de Permissões

| Ação | Admin | Consultor | Cliente |
|------|-------|-----------|---------|
| Ver todos os usuários | ✅ | ❌ | ❌ |
| Criar usuários | ✅ | ❌ | ❌ |
| Vincular consultor ↔ cliente | ✅ | ❌ | ❌ |
| Impersonar qualquer cliente | ✅ | ❌ | ❌ |
| Impersonar cliente vinculado | ✅ | ✅ | ❌ |
| Upload de Markdown nos entregáveis | ✅ | ✅ (apenas clientes vinculados) | ❌ |
| Preencher formulário de diagnóstico | ✅ | ✅ | ✅ |
| Ver formulário de diagnóstico | ✅ | ✅ (apenas clientes vinculados) | ✅ (apenas o próprio) |
| Usar e atualizar o Mapa de Produção | ✅ | ✅ | ✅ |
| Ver entregáveis do próprio ambiente | — | — | ✅ |
| Acessar banco de formatos de conteúdo | ✅ | ✅ | ✅ |

### 3.3 Impersonamento de Cliente

O consultor pode clicar em "Entrar como cliente" no painel. O sistema gera uma sessão com contexto do cliente selecionado. O consultor opera como se fosse o cliente, com indicação visual permanente no topo da tela ("Você está visualizando como: [Nome do Cliente]"). Ao encerrar, retorna ao painel de consultor.

A sessão de impersonamento deve:
- Ser registrada em log com timestamp, id do consultor e id do cliente
- Ser visível apenas para o admin no painel de auditoria
- Não confundir os tokens de autenticação do Supabase — implementar via contexto de sessão separado, não substituindo o usuário autenticado

### 3.4 Implementação de Roles no Supabase

- Tabela `profiles` com campo `role: 'admin' | 'consultant' | 'client'`
- Tabela `consultant_clients` para vincular consultores a clientes
- RLS ativado em todas as tabelas — políticas baseadas em `auth.uid()` e `role`
- Verificação de role sempre no banco (RLS), nunca apenas no cliente

---

## 4. Funcionalidades Detalhadas

### 4.1 Autenticação e Navegação Base

**Tela de Login**
- Email + senha via Supabase Auth
- Após login, redirecionar conforme role:
  - `admin` → `/admin/dashboard`
  - `consultant` → `/consultant/dashboard`
  - `client` → `/client/dashboard`
- Recuperação de senha via e-mail (Supabase Auth built-in)
- Design seguindo o design system Empire (fundo escuro, acento dourado)

**Layout Base**
- Sidebar lateral com navegação entre seções
- Header com nome do usuário, role badge, botão de logout
- Para consultores em modo impersonamento: banner persistente no topo com nome do cliente e botão "Sair do modo cliente"
- Responsivo: sidebar collapsa em mobile para menu hambúrguer

---

### 4.2 Painel Admin

**Dashboard Admin (`/admin/dashboard`)**
- Tabela de todos os usuários com filtros por: role, nome, e-mail, data de criação
- Colunas: nome, e-mail, role, consultor vinculado (se cliente), data de criação, status (ativo/inativo)
- Ações por linha: editar role, vincular a consultor (para clientes), desativar, acessar ambiente do cliente

**Criação de Usuário pelo Admin**
- Form: nome, e-mail, role, senha temporária
- Se role = `client`: campo para vincular a um consultor
- Envio de e-mail de boas-vindas com credenciais (via Edge Function + Supabase Auth)

**Gestão de Vínculos**
- Admin pode criar/remover vínculo consultor ↔ cliente
- Um cliente pode ter apenas um consultor vinculado
- Um consultor pode ter múltiplos clientes

**Log de Impersonamento**
- Tabela com: consultor, cliente, data/hora início, data/hora fim
- Visível apenas para admin

---

### 4.3 Painel Consultor

**Dashboard Consultor (`/consultant/dashboard`)**
- Grid de cards com todos os clientes vinculados
- Cada card: foto/avatar, nome, e-mail, progresso dos entregáveis (quantos estão preenchidos), botão "Entrar como cliente"
- Filtro por nome

**Acesso ao Ambiente do Cliente**
- Botão "Entrar como cliente" ativa o modo impersonamento
- O consultor vê exatamente o que o cliente vê, mas com permissões adicionais (upload de markdown, edição de cards)
- Banner de impersonamento visível o tempo todo

---

### 4.4 Painel Cliente

**Dashboard Cliente (`/client/dashboard`)**
- Visão geral do ambiente: cards de cada entregável com status (bloqueado, em progresso, disponível)
- Progresso visual da jornada (Fase 1 → Fase 2 → Fase 3)
- Navegação lateral para cada seção

---

### 4.5 FASE 1 — Diagnóstico e Auditoria

#### 4.5.1 Formulário de Diagnóstico (`/client/diagnostico`)

**Campos do formulário:**
- Nome completo `(text, obrigatório)`
- E-mail `(email, obrigatório)`
- WhatsApp:
  - Seletor de país com bandeira e código DDI (componente dedicado com busca)
  - Campo DDD `(text, 2-3 dígitos)`
  - Número `(text)`
- Links de redes sociais (campos opcionais para cada rede):
  - Instagram
  - LinkedIn
  - YouTube
  - TikTok
  - Twitter/X
  - Facebook
  - Pinterest
  - Outros (campo livre)
- Objetivos com redes sociais `(textarea, obrigatório)` — pergunta: "O que você quer alcançar com sua presença digital?"

**Comportamento:**
- Validação com React Hook Form + Zod
- Salva rascunho automaticamente (debounce de 2s)
- Após envio: exibe mensagem de confirmação e bloqueia edição (com botão para admin/consultor habilitarem re-edição)
- Admin e consultor podem visualizar e editar o formulário a qualquer momento

#### 4.5.2 Mapa de Riscos e Oportunidades (`/client/mapa-riscos`)

**O que é:** Documento estratégico de auditoria comunicacional produzido pelo consultor, exibido de forma visual e navegável para o cliente.

**Fluxo — Consultor:**
1. Em modo impersonamento, acessa `/client/mapa-riscos`
2. Vê botão "Carregar Markdown" (visível apenas para admin/consultor)
3. Faz upload de arquivo `.md`
4. Sistema envia o conteúdo para OpenRouter (Claude Sonnet 4.6) com prompt de formatação
5. IA retorna o conteúdo estruturado e formatado
6. Sistema salva o HTML/structured content gerado no banco
7. Exibe preview para o consultor confirmar antes de publicar
8. Consultor clica em "Publicar para o cliente"

**Fluxo — Cliente:**
- Vê o mapa formatado de forma visual e elegante
- Não vê botão de upload
- Pode navegar entre seções do documento (índice lateral se o markdown tiver headings)

**Prompt sugerido para a IA (ajustar no `.env` / Edge Function):**
> "Você é um formatador de documentos estratégicos premium. Receberá um documento markdown com um Mapa de Riscos e Oportunidades de consultoria de comunicação digital. Transforme-o em um documento estruturado em JSON com seções, títulos, subtítulos, listas de riscos, listas de oportunidades, destaques e observações. Mantenha todo o conteúdo original, apenas organize-o de forma clara, elegante e navegável. Responda apenas com o JSON, sem texto adicional."

**Status do entregável:** `locked | in_progress | published`

---

### 4.6 FASE 2 — Identidade de Marca

#### 4.6.1 Brand Book (`/client/brand-book`)

**O que é:** Documento de identidade narrativa da marca — tom de voz, arquétipo, posicionamento, mensagens-chave.

**Fluxo idêntico ao Mapa de Riscos:**
- Consultor faz upload de markdown
- IA (OpenRouter / Claude Sonnet 4.6) processa e formata
- Consultor confirma e publica
- Cliente visualiza resultado formatado

**Seções esperadas no Brand Book (a IA deve tentar identificar e organizar):**
- Tese de Marca
- Arquétipo
- Tom de Voz (escrito)
- Tom de Voz (falado / vídeo)
- Mensagens-chave
- Posicionamento
- Paleta de Cores sugerida (se presente no markdown)
- Fontes sugeridas (se presente)

**Exibição:**
- Layout visual com seções navegáveis via sidebar ou tabs
- Arquétipo exibido com card visual destacado
- Tom de voz com exemplos em cards (correto vs. incorreto, se houver)

---

### 4.7 FASE 3 — Conteúdo e Distribuição

#### 4.7.1 Linha Editorial (`/client/linha-editorial`)

**O que é:** Plano estratégico de conteúdo — temas, formatos, cadência, canais.

**Fluxo idêntico ao Brand Book e Mapa de Riscos.**

**Diferencial:** A Linha Editorial deve ser **linkada** ao Banco de Formatos de Conteúdo.
- Quando a IA formatar o documento e identificar formatos de conteúdo (ex: "Reels educativos", "Carrossel de posicionamento"), cada formato deve gerar um link clicável para o card correspondente no Banco de Formatos.
- Se o formato não existir no banco, exibir como texto sem link.

#### 4.7.2 Mapa de Produção — Calendário (`/client/mapa-producao`)

**O que é:** Calendário visual completo de conteúdo, inspirado em Trello e Notion. Funciona como um kanban + calendário com cards ricos.

**Consultor pode:**
- Fazer upload de markdown com o calendário pré-preenchido (IA formata e popula os cards)
- Criar, editar e deletar cards manualmente
- Definir status de cada card

**Cliente pode:**
- Ver todos os cards
- Editar cards existentes (atualizar status, adicionar notas, fazer upload de arquivos)
- Criar novos cards
- Não pode apagar cards criados pelo consultor (somente marcar como arquivado)

**Visualizações:**
- Visualização Kanban (colunas por status: `ideia | em_producao | revisao | agendado | publicado | arquivado`)
- Visualização Calendário mensal (cards posicionados pela data de publicação)
- Toggle entre as duas visualizações

**Card de Conteúdo — campos:**
- Título `(text, obrigatório)`
- Descrição / briefing `(textarea com markdown support)`
- Canal de publicação `(select: Instagram | LinkedIn | YouTube | TikTok | Twitter/X | Facebook | Pinterest | Blog | Email | Outro)`
- Formato de conteúdo `(link para Banco de Formatos ou text livre)`
- Status `(select: ideia | em_producao | revisao | agendado | publicado | arquivado)`
- Data de produção `(date)`
- Data de publicação `(date)`
- Responsável `(text ou link para usuário)`
- Arquivos anexados `(upload via Supabase Storage — imagens, vídeos, docs)`
- Labels/tags `(multi-select livre)`
- Notas internas `(textarea — visível apenas para consultor e admin)`
- Link de publicação `(url — preenchido após publicação)`
- Métricas `(campos livres: alcance, impressões, engajamento, etc.)`

**Abrir card:** clique no card abre um modal/drawer lateral completo com todos os campos editáveis (comportamento igual ao Notion/Trello).

**Upload de markdown pelo consultor:**
- Consultor pode subir um `.md` com o calendário já estruturado
- IA (OpenRouter / Claude Sonnet 4.6) interpreta o markdown e cria os cards automaticamente no banco
- Consultor revisa os cards gerados antes de confirmar

#### 4.7.3 Mapa de Distribuição (`/client/mapa-distribuicao`)

**O que é:** Calendário operacional de publicação e análise, integrado com o Mapa de Produção.

**Comportamento:**
- Exibe os mesmos cards do Mapa de Produção, mas com foco em datas de publicação e métricas
- Visualização calendário mensal como padrão
- Cada card exibe: título, canal, status, data de publicação, link de publicação (se preenchido), métricas resumidas
- Filtros: por canal, por status, por período, por formato
- Painel de análise simples: total publicado no mês, por canal, taxa de conclusão do planejamento

**Integração:**
- Compartilha a mesma tabela de cards do Mapa de Produção (`content_cards`)
- Não duplica dados — são views diferentes dos mesmos dados
- Atualizar status/métricas no Mapa de Distribuição reflete automaticamente no Mapa de Produção

#### 4.7.4 Banco de Formatos de Conteúdo (`/admin/banco-formatos` e acessível por consultores e clientes como referência)

**O que é:** Biblioteca de referência com formatos de conteúdo digital — o que é cada formato, como produzir, exemplos e referências visuais.

**Quem pode gerenciar:**
- Admin: criar, editar, arquivar formatos
- Consultor: visualizar (com acesso de leitura)
- Cliente: visualizar (com acesso de leitura), acessado via links da Linha Editorial

**Estrutura de um card de Formato:**
- Nome do formato `(ex: "Reels Educativo 60s")`
- Plataformas `(multi-select: Instagram | LinkedIn | YouTube | TikTok | etc.)`
- Descrição `(markdown)`
- Como produzir `(markdown step-by-step)`
- Exemplos e referências `(URLs, imagens, embeds se possível)`
- Dicas de boas práticas `(lista)`
- Thumbnail/preview `(imagem uploadada via Supabase Storage)`
- Tags `(multi-select)`
- Status `(ativo | arquivado)`

**Grid de exibição:**
- Cards visuais com thumbnail, nome, plataformas e tags
- Filtro por plataforma, por tag
- Busca por nome
- Ao clicar: drawer ou página dedicada com detalhes completos

---

### 4.8 Funcionalidades Transversais de IA

**Processamento de Markdown via OpenRouter**

Todos os entregáveis que aceitam upload de markdown seguem o mesmo padrão:
1. Consultor faz upload de `.md`
2. Frontend envia para Edge Function `process-deliverable`
3. Edge Function chama OpenRouter (Claude Sonnet 4.6) com:
   - System prompt específico para o tipo de entregável
   - Conteúdo do markdown
   - Instrução para retornar JSON estruturado
4. Edge Function salva o resultado no Supabase
5. Frontend exibe o resultado formatado

**Nota sobre a implementação:**
- A Edge Function deve usar a API do OpenRouter (não a API da Anthropic diretamente), pois o usuário especificou OpenRouter
- Pesquisar documentação oficial: `https://openrouter.ai/docs`
- Modelo: `anthropic/claude-sonnet-4-5` (verificar nome exato do modelo no OpenRouter no momento da implementação)
- A chave da API do OpenRouter (`OPENROUTER_API_KEY`) fica exclusivamente nos secrets da Edge Function — nunca no cliente

**Sugestão de Reaproveitamento de Conteúdo (Feature de IA)**

Na seção do Mapa de Produção, adicionar um campo/botão: "Sugerir reaproveitamentos".
- Usuário insere URL de um conteúdo existente (vídeo, artigo, post)
- Edge Function chama OpenRouter com o título/descrição/URL
- IA sugere formatos derivados (ex: "5 Reels curtos", "10 cards de carrossel", "3 threads")
- Resultado exibido como lista de sugestões que podem ser convertidas em cards de calendário com 1 clique

---

## 5. Design System

O projeto usa o **Design System Empire** conforme documentado em `docs/design-system.md`.

### 5.1 Tokens Principais

```css
/* src/index.css */
:root {
  /* Empire Colors */
  --empire-bg: #0a0a0b;
  --empire-surface: #111113;
  --empire-card: #18181b;
  --empire-border: #27272a;
  --empire-text: #fafafa;
  --empire-gold: #c9a962;
  --empire-gold-light: #e4d4a5;
  --empire-gold-dark: #9a7b3c;

  /* Gradients */
  --gold-gradient: linear-gradient(135deg, #c9a962 0%, #e4d4a5 50%, #c9a962 100%);
  --green-gradient: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%);

  /* shadcn/ui tokens mapeados para o Empire */
  --background: 0 0% 4%;           /* #0a0a0b */
  --foreground: 0 0% 98%;          /* #fafafa */
  --card: 240 4% 11%;              /* #18181b */
  --card-foreground: 0 0% 98%;
  --primary: 40 45% 58%;           /* #c9a962 gold */
  --primary-foreground: 0 0% 4%;
  --secondary: 240 4% 7%;          /* #111113 */
  --secondary-foreground: 0 0% 98%;
  --muted: 240 4% 16%;             /* #27272a */
  --muted-foreground: 0 0% 60%;
  --accent: 40 45% 58%;
  --accent-foreground: 0 0% 4%;
  --destructive: 0 72% 71%;        /* #f87171 */
  --destructive-foreground: 0 0% 98%;
  --border: 240 4% 16%;
  --input: 240 4% 16%;
  --ring: 40 45% 58%;
  --radius: 0.125rem;              /* border-radius quase zero = estética premium */
}
```

### 5.2 Tailwind Config

```typescript
// tailwind.config.ts
colors: {
  empire: {
    bg: '#0a0a0b',
    surface: '#111113',
    card: '#18181b',
    border: '#27272a',
    text: '#fafafa',
    gold: '#c9a962',
    goldLight: '#e4d4a5',
    goldDark: '#9a7b3c',
  }
},
fontFamily: {
  display: ['Cormorant Garamond', 'serif'],
  body: ['DM Sans', 'sans-serif'],
}
```

### 5.3 Tipografia

- **Títulos/Display:** Cormorant Garamond (serif) — carregar via Google Fonts
- **Corpo/UI:** DM Sans (sans-serif) — carregar via Google Fonts
- Carregar fontes no `index.html` com `rel="preconnect"` para performance

### 5.4 Componentes shadcn/ui a Instalar

```bash
npx shadcn-ui@latest add button card input label textarea select
npx shadcn-ui@latest add dialog drawer sheet
npx shadcn-ui@latest add table badge avatar
npx shadcn-ui@latest add skeleton toast
npx shadcn-ui@latest add tabs accordion
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add form
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add progress
```

### 5.5 Regras Visuais Inegociáveis

- ❌ Nenhuma cor hardcoded — sempre tokens via Tailwind
- ✅ Fundo principal: `bg-empire-bg`
- ✅ Cards: `bg-empire-card border border-empire-border`
- ✅ Textos secundários: `text-empire-text/70`
- ✅ Acentos: `text-empire-gold`
- ✅ Botão primário: gradiente verde (`btn-premium`)
- ✅ Botão secundário: borda dourada (`btn-secondary`)
- ✅ Skeletons obrigatórios em todos os componentes com dados assíncronos
- ✅ Animações: `fade-in-up`, `stagger-children`, `card-hover`
- ✅ Scrollbar customizada (conforme design system)

---

## 6. Arquitetura Técnica

### 6.1 Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                     │
│  React 18 + TypeScript + Vite                           │
│  Tailwind CSS + shadcn/ui + Lucide React                │
│  React Router v6 + TanStack Query v5                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────┐
│                   SUPABASE                               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ PostgreSQL  │  │   Auth       │  │    Storage     │  │
│  │ + RLS       │  │ (JWT/email)  │  │ (arquivos/imgs)│  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Edge Functions (Deno/TS)              │   │
│  │  process-deliverable | suggest-reuse |           │   │
│  │  send-welcome-email  | audit-log     |           │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS (apenas Edge Functions)
┌────────────────────▼────────────────────────────────────┐
│              SERVIÇOS EXTERNOS                          │
│  OpenRouter API (LLM — Claude Sonnet 4.6)               │
│  Resend (e-mail transacional)                           │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Roteamento

```
/                           → redirect para /login
/login                      → tela de login (pública)
/esqueci-senha              → recuperação de senha (pública)

/admin/dashboard            → painel admin (role: admin)
/admin/usuarios             → gestão de usuários
/admin/banco-formatos       → gestão do banco de formatos

/consultant/dashboard       → painel consultor (role: consultant)
/consultant/cliente/:id     → ambiente do cliente em modo impersonamento

/client/dashboard           → painel do cliente (role: client)
/client/diagnostico         → formulário de diagnóstico
/client/mapa-riscos         → mapa de riscos e oportunidades
/client/brand-book          → brand book
/client/linha-editorial     → linha editorial
/client/mapa-producao       → mapa de produção (calendário)
/client/mapa-distribuicao   → mapa de distribuição
/client/banco-formatos      → banco de formatos (visualização)

/404                        → página não encontrada
```

### 6.3 Proteção de Rotas

```typescript
// src/components/ProtectedRoute.tsx
// Verifica: usuário autenticado + role autorizado para a rota
// Se não autenticado → redirect para /login
// Se role errado → redirect para o dashboard correto do role
```

### 6.4 Contextos React

```typescript
// src/contexts/AuthContext.tsx
// - usuário atual (id, email, nome, role)
// - sessão Supabase
// - funções: login, logout, resetPassword

// src/contexts/ImpersonationContext.tsx
// - clienteAtivo (quando consultor está em modo impersonamento)
// - funções: startImpersonation, stopImpersonation
// - log automático de início/fim da sessão
```

### 6.5 TanStack Query — Padrões

```typescript
// Queries com chaves semânticas
useQuery({ queryKey: ['deliverable', clientId, 'brand-book'], ... })
useQuery({ queryKey: ['content-cards', clientId], ... })
useQuery({ queryKey: ['format-library'], ... })

// Mutations com invalidação
useMutation({ onSuccess: () => queryClient.invalidateQueries(['deliverable', clientId]) })
```

---

## 7. Schema do Banco de Dados

> ⚠️ Antes de criar qualquer tabela, ler `docs/banco-de-dados.md` e verificar se a migration já existe em `supabase/migrations/`.
> Sempre criar mudanças de schema via arquivo de migration versionado — nunca editar o banco diretamente.
> Após mudanças no schema: `supabase gen types typescript --local > src/integrations/supabase/types.ts`

### 7.1 Tabelas

#### `profiles`
Estende a tabela `auth.users` do Supabase com dados adicionais.
```sql
id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
role        text NOT NULL CHECK (role IN ('admin', 'consultant', 'client'))
full_name   text
avatar_url  text
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()
```

#### `consultant_clients`
Vínculo entre consultores e clientes.
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
consultant_id  uuid NOT NULL REFERENCES profiles(id)
client_id      uuid NOT NULL REFERENCES profiles(id)
created_by     uuid REFERENCES profiles(id)
created_at     timestamptz DEFAULT now()
UNIQUE(consultant_id, client_id)
```

#### `client_diagnostics`
Formulário de diagnóstico do cliente.
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id      uuid NOT NULL REFERENCES profiles(id) UNIQUE
full_name      text
email          text
whatsapp_ddi   text
whatsapp_ddd   text
whatsapp_num   text
social_links   jsonb  -- { instagram: '', linkedin: '', youtube: '', tiktok: '', twitter: '', facebook: '', pinterest: '', outros: '' }
objectives     text
submitted_at   timestamptz
is_locked      boolean DEFAULT false
created_at     timestamptz DEFAULT now()
updated_at     timestamptz DEFAULT now()
```

#### `deliverables`
Entregáveis processados por IA (mapa de riscos, brand book, linha editorial).
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id        uuid NOT NULL REFERENCES profiles(id)
type             text NOT NULL CHECK (type IN ('risk_map', 'brand_book', 'editorial_line'))
status           text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'published'))
raw_markdown     text         -- markdown original enviado pelo consultor
processed_json   jsonb        -- resultado estruturado da IA
published_at     timestamptz
uploaded_by      uuid REFERENCES profiles(id)
created_at       timestamptz DEFAULT now()
updated_at       timestamptz DEFAULT now()
UNIQUE(client_id, type)
```

#### `content_cards`
Cards do Mapa de Produção e Distribuição (compartilhados).
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
client_id         uuid NOT NULL REFERENCES profiles(id)
title             text NOT NULL
description       text         -- markdown
channel           text         -- instagram | linkedin | youtube | tiktok | twitter | facebook | pinterest | blog | email | outro
format_id         uuid REFERENCES content_formats(id)
format_free       text         -- formato livre se não vinculado ao banco
status            text NOT NULL DEFAULT 'ideia' CHECK (status IN ('ideia', 'em_producao', 'revisao', 'agendado', 'publicado', 'arquivado'))
production_date   date
publish_date      date
responsible       text
labels            text[]
internal_notes    text         -- visível apenas para admin/consultor
publish_url       text
metrics           jsonb        -- { alcance: 0, impressoes: 0, engajamento: 0, ... }
created_by        uuid REFERENCES profiles(id)
created_at        timestamptz DEFAULT now()
updated_at        timestamptz DEFAULT now()
```

#### `card_attachments`
Arquivos anexados a cards de conteúdo.
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
card_id     uuid NOT NULL REFERENCES content_cards(id) ON DELETE CASCADE
file_name   text NOT NULL
file_url    text NOT NULL  -- URL do Supabase Storage
file_type   text
file_size   bigint
uploaded_by uuid REFERENCES profiles(id)
created_at  timestamptz DEFAULT now()
```

#### `content_formats`
Banco de formatos de conteúdo.
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
name          text NOT NULL
platforms     text[]  -- ['instagram', 'linkedin', ...]
description   text    -- markdown
how_to        text    -- markdown step-by-step
examples      jsonb   -- [{ type: 'url' | 'image', value: '...' }]
tips          text[]
thumbnail_url text
tags          text[]
status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'))
created_by    uuid REFERENCES profiles(id)
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

#### `impersonation_logs`
Log de sessões de impersonamento.
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
consultant_id   uuid NOT NULL REFERENCES profiles(id)
client_id       uuid NOT NULL REFERENCES profiles(id)
started_at      timestamptz DEFAULT now()
ended_at        timestamptz
action_summary  text  -- resumo opcional das ações realizadas
```

### 7.2 RLS Policies

> Implementar as seguintes políticas. Pesquisar documentação do Supabase sobre RLS antes de implementar: `https://supabase.com/docs/guides/database/row-level-security`

| Tabela | Policy | Regra |
|--------|--------|-------|
| `profiles` | SELECT | Próprio perfil OU admin OU consultor (apenas clientes vinculados) |
| `profiles` | INSERT | Apenas via trigger (criado junto com auth.user) |
| `profiles` | UPDATE | Próprio perfil OU admin |
| `consultant_clients` | SELECT | Consultor (seus vínculos) OU admin |
| `consultant_clients` | INSERT/UPDATE/DELETE | Apenas admin |
| `client_diagnostics` | SELECT | Próprio cliente OU consultor vinculado OU admin |
| `client_diagnostics` | INSERT/UPDATE | Próprio cliente OU consultor vinculado OU admin |
| `deliverables` | SELECT | Próprio cliente OU consultor vinculado OU admin |
| `deliverables` | INSERT/UPDATE | Consultor vinculado OU admin |
| `content_cards` | SELECT | Próprio cliente OU consultor vinculado OU admin |
| `content_cards` | INSERT/UPDATE | Próprio cliente OU consultor vinculado OU admin |
| `content_cards` | DELETE | Apenas criador OU admin (cliente não deleta cards de consultor) |
| `card_attachments` | SELECT | Via card (mesma política do card pai) |
| `card_attachments` | INSERT | Via card (mesma política) |
| `content_formats` | SELECT | Qualquer usuário autenticado |
| `content_formats` | INSERT/UPDATE/DELETE | Apenas admin |
| `impersonation_logs` | SELECT | Apenas admin |
| `impersonation_logs` | INSERT | Via Edge Function (service role) |

### 7.3 Storage Buckets

| Bucket | Acesso | Uso |
|--------|--------|-----|
| `deliverable-markdowns` | Privado (apenas service role) | Markdowns originais enviados |
| `card-attachments` | Privado (autenticado + RLS) | Arquivos dos cards de conteúdo |
| `format-thumbnails` | Público (read) | Thumbnails do banco de formatos |
| `avatars` | Público (read) | Fotos de perfil |

---

## 8. Integrações Externas

### 8.1 OpenRouter (IA)

**Documentação oficial:** `https://openrouter.ai/docs`
**Modelo:** `anthropic/claude-sonnet-4-5` (verificar nome exato no OpenRouter)
**Variável de ambiente:** `OPENROUTER_API_KEY` — exclusivamente nos secrets da Edge Function

**Edge Function: `process-deliverable`**
- Recebe: `{ client_id, deliverable_type, markdown_content }`
- Chama OpenRouter com system prompt específico por tipo
- Salva resultado estruturado em `deliverables.processed_json`
- Atualiza status para `in_progress`
- Retorna: `{ success, deliverable_id }`

**Edge Function: `suggest-content-reuse`**
- Recebe: `{ content_url, content_title, content_description }`
- Chama OpenRouter com prompt de sugestão de reaproveitamento
- Retorna: `{ suggestions: [{ format, description, quantity }] }`

**System Prompts (armazenar como constantes na Edge Function, não no cliente):**

Para `risk_map`:
```
Você é um especialista em auditoria de comunicação digital. Receberá um documento 
markdown com um Mapa de Riscos e Oportunidades. Transforme-o em um JSON estruturado 
com as seguintes seções: summary (string), risks (array de {title, description, severity: 'high'|'medium'|'low'}), 
opportunities (array de {title, description, potential: 'high'|'medium'|'low'}), 
recommendations (array de strings), highlights (array de strings). 
Mantenha todo o conteúdo original. Responda APENAS com o JSON, sem texto adicional.
```

Para `brand_book`:
```
Você é um especialista em identidade de marca. Receberá um Brand Book em markdown. 
Transforme-o em JSON estruturado com: thesis (string), archetype (string), 
written_voice (object com tone, examples[]), spoken_voice (object com tone, examples[]), 
key_messages (string[]), positioning (string), color_palette (array de {name, hex, usage} se presente), 
fonts (array de {name, usage} se presente), sections (array de {title, content} para demais seções). 
Responda APENAS com o JSON, sem texto adicional.
```

Para `editorial_line`:
```
Você é um especialista em estratégia de conteúdo. Receberá uma Linha Editorial em markdown.
Transforme-o em JSON com: objective (string), pillars (array de {name, description, formats[]}), 
cadence (object com frequencia por canal), channels (array de {name, strategy}), 
content_formats (array de {name, description, channel} — extrair formatos mencionados para linkar ao banco), 
sections (array de {title, content} para demais seções). 
Responda APENAS com o JSON, sem texto adicional.
```

Para `production_map` (calendário via markdown):
```
Você é um assistente de planejamento de conteúdo. Receberá um Mapa de Produção em markdown.
Extraia todos os conteúdos mencionados e retorne um JSON com um array de cards: 
[{ title, description, channel, format, status, production_date (YYYY-MM-DD ou null), 
publish_date (YYYY-MM-DD ou null), labels[] }]. 
Responda APENAS com o JSON array, sem texto adicional.
```

### 8.2 Resend (E-mail Transacional)

**Documentação oficial:** `https://resend.com/docs`
**Variável de ambiente:** `RESEND_API_KEY` — exclusivamente nos secrets da Edge Function

**Edge Function: `send-welcome-email`**
- Disparada quando admin cria novo usuário
- Envia e-mail com: credenciais de acesso, link para o portal, nome do consultor responsável
- Template: HTML simples seguindo o design system Empire (fundo escuro, logo, acento dourado)

---

## 9. Segurança

Criar `docs/seguranca.md` com o conteúdo da Seção M das instruções fixas, adaptado:

**Regras absolutas:**
- Chave do OpenRouter: apenas nos Secrets da Edge Function `process-deliverable`
- Chave do Resend: apenas nos Secrets da Edge Function `send-welcome-email`
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`: únicas variáveis no cliente
- `.env` no `.gitignore` desde o primeiro commit
- Logs de impersonamento: apenas via Edge Function com service role, nunca do cliente

**Pontos de atenção específicos deste projeto:**
- O impersonamento de cliente é uma operação sensível — implementar com cuidado, garantindo que o consultor nunca confunda sua sessão com a do cliente
- Cards com `internal_notes`: garantir via RLS que o campo não seja retornado para clientes
- Uploads de markdown: validar tipo e tamanho do arquivo antes do upload (máx 5MB, apenas `.md`)
- Uploads de anexos: validar tipo (imagens, PDFs, documentos) e tamanho (máx 20MB por arquivo)

---

## 10. Estrutura de Pastas

```
src/
├── components/
│   ├── ui/                        → componentes shadcn/ui
│   ├── auth/                      → LoginForm, ProtectedRoute
│   ├── admin/                     → UserTable, UserForm, ImpersonationLog
│   ├── consultant/                → ClientGrid, ClientCard
│   ├── client/                    → DeliverableView, PhaseProgress
│   ├── deliverables/              → MarkdownUploader, DeliverableRenderer
│   │   ├── RiskMapView.tsx
│   │   ├── BrandBookView.tsx
│   │   └── EditorialLineView.tsx
│   ├── calendar/                  → ContentCard, CalendarView, KanbanView
│   │   ├── ContentCardModal.tsx
│   │   ├── KanbanBoard.tsx
│   │   └── CalendarGrid.tsx
│   ├── formats/                   → FormatCard, FormatGrid, FormatDetail
│   ├── diagnostics/               → DiagnosticForm
│   ├── impersonation/             → ImpersonationBanner
│   └── layout/                   → AppLayout, Sidebar, Header, MobileMenu
├── hooks/
│   ├── useAuth.ts
│   ├── useImpersonation.ts
│   ├── useDeliverable.ts
│   ├── useContentCards.ts
│   └── useContentFormats.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts              → gerado automaticamente
├── lib/
│   └── utils.ts                  → cn(), formatDate(), etc.
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── UsersPage.tsx
│   │   └── FormatLibraryAdminPage.tsx
│   ├── consultant/
│   │   └── ConsultantDashboard.tsx
│   ├── client/
│   │   ├── ClientDashboard.tsx
│   │   ├── DiagnosticPage.tsx
│   │   ├── RiskMapPage.tsx
│   │   ├── BrandBookPage.tsx
│   │   ├── EditorialLinePage.tsx
│   │   ├── ProductionMapPage.tsx
│   │   ├── DistributionMapPage.tsx
│   │   └── FormatLibraryPage.tsx
│   └── NotFound.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── ImpersonationContext.tsx
├── types/
│   └── index.ts                  → interfaces globais
├── App.tsx
├── main.tsx
└── index.css                     → tokens CSS globais

supabase/
├── config.toml
├── migrations/                   → SQL migrations versionadas
└── functions/
    ├── process-deliverable/      → IA para entregáveis
    ├── suggest-content-reuse/    → IA para reaproveitamento
    └── send-welcome-email/       → e-mail transacional

public/
docs/
.env.example
.env
vite.config.ts
tailwind.config.ts
tsconfig.json
components.json
agents.md
```

---

## 11. Documentação a Criar

Durante a execução, criar os seguintes arquivos **nesta ordem:**

1. **`docs/prd.md`** — PRIMEIRO arquivo a ser criado. Este documento. Somente leitura.
2. **`agents.md`** — Regras de comportamento da IA (conteúdo da Seção P das instruções fixas)
3. **`docs/arquitetura.md`** — Diagrama e descrição da arquitetura técnica completa
4. **`docs/design-system.md`** — Tokens CSS, componentes shadcn/ui, padrões visuais Empire
5. **`docs/banco-de-dados.md`** — Schema completo, tabelas, RLS policies, storage buckets, Edge Functions
6. **`docs/integracoes.md`** — OpenRouter (system prompts, formato de chamada), Resend (templates)
7. **`docs/seguranca.md`** — Regras de segurança, checklists, pontos de atenção do projeto
8. **`.env.example`** — Template de variáveis de ambiente
9. **`docs/roadmap/`** — Estrutura completa com `_index.md` e todos os arquivos de story

---

## 12. Roadmap e Épicos

### 12.1 Visão Geral dos Épicos

| Épico | Objetivo | Stories |
|-------|----------|---------|
| G01 — Foundation | Setup técnico e infraestrutura base | T01, T02, T03, T04 |
| G02 — Auth & Users | Autenticação, roles e gestão de usuários | T01, T02, T03 |
| G03 — Layout & Navigation | Layout base, sidebar, navegação | T01, T02 |
| G04 — Diagnóstico | Formulário de diagnóstico do cliente | T01 |
| G05 — Entregáveis IA | Mapa de Riscos, Brand Book, Linha Editorial | T01, T02, T03, T04 |
| G06 — Calendário | Mapa de Produção e Distribuição | T01, T02, T03 |
| G07 — Banco de Formatos | Biblioteca de formatos de conteúdo | T01, T02 |
| G08 — Admin | Painel administrativo completo | T01, T02 |
| G09 — Edge Functions | IA + e-mail via Edge Functions | T01, T02, T03 |
| G10 — Polish & Deploy | Skeletons, animações, responsivo, deploy | T01, T02 |

### 12.2 DAG de Dependências

```
G01-T01 (setup: Vite + React + TS + Tailwind + shadcn/ui)
    └──> G01-T02 (design-system: tokens CSS + tailwind.config.ts)         ┐
    └──> G01-T03 (supabase: schema + migrations + storage buckets)        ├── paralelos
    └──> G01-T04 (edge functions: estrutura base + config)                ┘
              └──> G02-T01 (supabase auth: login/logout/recovery)
                       └──> G02-T02 (roles + profiles + consultant_clients)
                                └──> G02-T03 (impersonamento + ImpersonationContext)
                                └──> G03-T01 (layout base: AppLayout, Sidebar, Header)
                                          └──> G03-T02 (roteamento protegido por role)
                                                    └──> G04-T01 (formulário diagnóstico)   ┐
                                                    └──> G05-T01 (markdown uploader)        │
                                                    └──> G07-T01 (banco de formatos admin)  ├── paralelos
                                                    └──> G08-T01 (painel admin: usuários)   │
                                                                 └──> G05-T02 (edge fn process-deliverable)
                                                                          └──> G05-T03 (risk map view)  ┐
                                                                          └──> G05-T04 (brand book view)│ paralelos
                                                                          └──> G05-T05 (editorial view) ┘
                                                                 └──> G06-T01 (content cards schema + CRUD)
                                                                          └──> G06-T02 (kanban view)
                                                                          └──> G06-T03 (calendar view)
                                                                 └──> G09-T01 (edge fn suggest-reuse)
                                                                 └──> G09-T02 (edge fn welcome-email)
                                                                 └──> G10-T01 (skeletons + animações)
                                                                          └──> G10-T02 (responsivo + deploy)

[PARALELOS DISPONÍVEIS PÓS-FOUNDATION]
- G01-T02, G01-T03, G01-T04 podem rodar simultaneamente após G01-T01
- G04-T01, G07-T01, G08-T01 podem rodar simultaneamente após G03-T02
- G05-T03, G05-T04, G05-T05 podem rodar simultaneamente após G05-T02
- G06-T02, G06-T03 podem rodar simultaneamente após G06-T01
```

### 12.3 Stories Detalhadas (criar como arquivos em `docs/roadmap/`)

#### G01 — Foundation

**G01-T01** — Setup do projeto
- Criar projeto Vite + React + TypeScript (strict mode)
- Instalar e configurar Tailwind CSS
- Instalar shadcn/ui e configurar `components.json`
- Instalar Lucide React, React Router v6, TanStack Query v5, Zustand
- Configurar `tsconfig.json` com `"strict": true`
- Criar `.env.example` com todas as variáveis
- Inicializar Supabase CLI e `supabase/config.toml`
- Commit inicial com `.gitignore` incluindo `.env`

**G01-T02** — Design System Empire
- Configurar tokens Empire em `src/index.css` (CSS variables)
- Configurar `tailwind.config.ts` com cores Empire e fontes
- Adicionar Google Fonts (Cormorant Garamond + DM Sans) no `index.html`
- Criar classes utilitárias: `.text-gold-gradient`, `.border-gold-gradient`, `.btn-premium`, `.btn-secondary`, `.card-hover`, `.fade-in-up`, `.stagger-children`, `.grid-pattern`
- Criar scrollbar customizada
- Instalar todos os componentes shadcn/ui listados
- Criar `docs/design-system.md`

**G01-T03** — Schema Supabase
- Criar todas as migrations SQL para as tabelas listadas na Seção 7
- Criar RLS policies para todas as tabelas
- Criar storage buckets
- Executar migrations localmente e verificar
- Gerar types TypeScript: `supabase gen types typescript`
- Criar `docs/banco-de-dados.md`

**G01-T04** — Edge Functions — Estrutura Base
- Criar estrutura de pastas para as 3 Edge Functions
- Configurar Supabase Secrets (variáveis sensíveis)
- Criar cliente Supabase com service role para as Edge Functions
- Pesquisar documentação oficial do Supabase Edge Functions antes de implementar: `https://supabase.com/docs/guides/functions`

#### G02 — Auth & Users

**G02-T01** — Autenticação
- Criar `src/integrations/supabase/client.ts`
- Criar `src/contexts/AuthContext.tsx`
- Criar `src/pages/auth/LoginPage.tsx` (design Empire)
- Criar `src/pages/auth/ForgotPasswordPage.tsx`
- Criar hook `useAuth.ts`

**G02-T02** — Roles e Perfis
- Criar trigger no Supabase: ao criar `auth.user`, criar `profiles` automaticamente
- Criar `src/components/auth/ProtectedRoute.tsx`
- Verificar e aplicar RLS de `profiles` e `consultant_clients`

**G02-T03** — Impersonamento
- Criar `src/contexts/ImpersonationContext.tsx`
- Criar `src/components/impersonation/ImpersonationBanner.tsx`
- Registrar log de impersonamento via chamada ao Supabase (tabela `impersonation_logs`)

#### G03 — Layout & Navigation

**G03-T01** — Layout Base
- Criar `src/components/layout/AppLayout.tsx`
- Criar `src/components/layout/Sidebar.tsx` (items diferentes por role)
- Criar `src/components/layout/Header.tsx`
- Criar `src/components/layout/MobileMenu.tsx`

**G03-T02** — Roteamento
- Criar `src/App.tsx` com todas as rotas listadas na Seção 6.2
- Aplicar `ProtectedRoute` em todas as rotas privadas
- Criar dashboards placeholder para cada role (a preencher nas stories seguintes)

#### G04 — Diagnóstico

**G04-T01** — Formulário de Diagnóstico
- Criar `src/pages/client/DiagnosticPage.tsx`
- Criar `src/components/diagnostics/DiagnosticForm.tsx`
- Implementar todos os campos (React Hook Form + Zod)
- Criar seletor de país para WhatsApp (pesquisar biblioteca ou implementar com lista de países)
- Auto-save com debounce de 2s
- Lógica de bloqueio após envio

#### G05 — Entregáveis com IA

**G05-T01** — Markdown Uploader (componente compartilhado)
- Criar `src/components/deliverables/MarkdownUploader.tsx`
- Upload de `.md` para Supabase Storage bucket `deliverable-markdowns`
- Visível apenas para admin e consultor (verificar role)
- Estado: `idle | uploading | processing | done | error`
- Skeleton durante processamento

**G05-T02** — Edge Function `process-deliverable`
- Implementar a Edge Function completa
- Pesquisar API do OpenRouter: `https://openrouter.ai/docs`
- Implementar os 4 system prompts (risk_map, brand_book, editorial_line, production_map)
- Salvar resultado em `deliverables.processed_json`
- Atualizar status do entregável

**G05-T03** — Mapa de Riscos View
- Criar `src/pages/client/RiskMapPage.tsx`
- Criar `src/components/deliverables/RiskMapView.tsx`
- Renderizar `processed_json` de forma visual (cards de risco/oportunidade, código de cores por severidade)
- Sidebar com índice de navegação se documento for longo

**G05-T04** — Brand Book View
- Criar `src/pages/client/BrandBookPage.tsx`
- Criar `src/components/deliverables/BrandBookView.tsx`
- Seções navegáveis (tabs ou sidebar)
- Card especial para Arquétipo
- Cards de Tom de Voz com exemplos

**G05-T05** — Linha Editorial View
- Criar `src/pages/client/EditorialLinePage.tsx`
- Criar `src/components/deliverables/EditorialLineView.tsx`
- Links de formatos de conteúdo para o Banco de Formatos (resolver via `format_id`)

#### G06 — Calendário (Mapa de Produção e Distribuição)

**G06-T01** — Content Cards CRUD
- Criar todos os hooks TanStack Query para `content_cards`
- Criar `src/components/calendar/ContentCardModal.tsx` (modal/drawer com todos os campos)
- Upload de anexos para bucket `card-attachments`
- Implementar lógica de permissões: cliente não deleta cards do consultor

**G06-T02** — Visualização Kanban
- Criar `src/components/calendar/KanbanBoard.tsx`
- 6 colunas de status
- Drag-and-drop (pesquisar: `@dnd-kit/core` ou `react-beautiful-dnd`)
- Filtros por canal, label, responsável

**G06-T03** — Visualização Calendário
- Criar `src/components/calendar/CalendarGrid.tsx`
- Calendário mensal com cards posicionados por `publish_date`
- Navegação entre meses
- Toggle Kanban ↔ Calendário

#### G07 — Banco de Formatos

**G07-T01** — Admin de Formatos
- Criar `src/pages/admin/FormatLibraryAdminPage.tsx`
- CRUD completo de formatos (criar, editar, arquivar)
- Upload de thumbnail para bucket `format-thumbnails`
- Rich text editor para `description` e `how_to` (pesquisar: `@tiptap/react` ou similar, compatível com shadcn/ui)

**G07-T02** — Visualização de Formatos (para consultores e clientes)
- Criar `src/pages/client/FormatLibraryPage.tsx`
- Grid de cards com thumbnail, nome, plataformas, tags
- Filtros por plataforma e tag, busca por nome
- Drawer com detalhes completos ao clicar

#### G08 — Admin

**G08-T01** — Gestão de Usuários
- Criar `src/pages/admin/UsersPage.tsx`
- Tabela com todos os usuários, filtros, paginação
- Modal de criação de usuário (form: nome, e-mail, role, senha temporária)
- Ação de vincular cliente a consultor
- Acionar Edge Function `send-welcome-email` ao criar usuário

**G08-T02** — Dashboard Admin
- Criar `src/pages/admin/AdminDashboard.tsx`
- Cards de estatísticas: total usuários, clientes ativos, consultores
- Tabela de últimas ações (últimos logins, últimos impersonamentos)
- Log de impersonamentos

#### G09 — Edge Functions Restantes

**G09-T01** — Edge Function `suggest-content-reuse`
- Implementar sugestão de reaproveitamento de conteúdo
- Integração com OpenRouter
- Resposta: array de sugestões com format + description + quantity

**G09-T02** — Edge Function `send-welcome-email`
- Implementar com Resend
- Pesquisar documentação Resend: `https://resend.com/docs`
- Template HTML seguindo design Empire

#### G10 — Polish & Deploy

**G10-T01** — Skeletons e Animações
- Adicionar `<Skeleton />` em TODOS os componentes com dados assíncronos
- Aplicar `fade-in-up` e `stagger-children` nas páginas
- Verificar `card-hover` em todos os cards
- Verificar estados de erro e empty states em todas as telas

**G10-T02** — Responsivo e Deploy
- Testar todos os breakpoints (mobile, tablet, desktop)
- Ajustar sidebar para mobile (drawer em vez de fixo)
- Configurar deploy (Vercel recomendado)
- Configurar variáveis de ambiente no painel de deploy
- Configurar domínio customizado se necessário

---

## 13. Ordem de Execução

```
1.  G01-T01 — Setup do projeto (Vite + React + TS + Tailwind + shadcn/ui)
2.  G01-T02 — Design System Empire (paralelo com G01-T03 e G01-T04)
3.  G01-T03 — Schema Supabase (paralelo com G01-T02 e G01-T04)
4.  G01-T04 — Edge Functions estrutura base (paralelo com G01-T02 e G01-T03)
5.  G02-T01 — Autenticação (depende de G01-T01, G01-T02, G01-T03)
6.  G02-T02 — Roles e Perfis (depende de G02-T01)
7.  G02-T03 — Impersonamento (depende de G02-T02)
8.  G03-T01 — Layout Base (depende de G02-T02)
9.  G03-T02 — Roteamento (depende de G03-T01 e G02-T03)
10. G04-T01 — Formulário Diagnóstico (depende de G03-T02)   ┐
11. G07-T01 — Admin de Formatos (depende de G03-T02)        ├── paralelos
12. G08-T01 — Gestão de Usuários (depende de G03-T02)       ┘
13. G05-T01 — Markdown Uploader (depende de G03-T02)
14. G05-T02 — Edge Function process-deliverable (depende de G05-T01, G01-T04)
15. G05-T03 — Risk Map View (depende de G05-T02)             ┐
16. G05-T04 — Brand Book View (depende de G05-T02)           ├── paralelos
17. G05-T05 — Editorial Line View (depende de G05-T02)       ┘
18. G06-T01 — Content Cards CRUD (depende de G03-T02)
19. G06-T02 — Kanban View (depende de G06-T01)              ┐
20. G06-T03 — Calendar View (depende de G06-T01)            ┘ paralelos
21. G07-T02 — Format Library View (depende de G07-T01)
22. G08-T02 — Dashboard Admin (depende de G08-T01)
23. G09-T01 — Edge Fn suggest-reuse (depende de G01-T04)
24. G09-T02 — Edge Fn welcome-email (depende de G08-T01)
25. G10-T01 — Skeletons e Animações
26. G10-T02 — Responsivo e Deploy
```

---

## 14. Variáveis de Ambiente

Criar `.env.example` com o seguinte conteúdo:

```env
# Supabase (expostos no cliente via VITE_)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Supabase (apenas para Edge Functions — via Supabase Secrets, nunca no .env do cliente)
# SUPABASE_SERVICE_ROLE_KEY=  ← NÃO colocar aqui. Configurar nos Secrets do Supabase Dashboard.

# OpenRouter (apenas para Edge Functions — via Supabase Secrets)
# OPENROUTER_API_KEY=  ← NÃO colocar aqui. Configurar nos Secrets do Supabase Dashboard.

# Resend (apenas para Edge Functions — via Supabase Secrets)
# RESEND_API_KEY=  ← NÃO colocar aqui. Configurar nos Secrets do Supabase Dashboard.

# App
VITE_APP_NAME=Empire Maps
VITE_APP_URL=http://localhost:5173
```

**Como configurar Secrets no Supabase:**
- Dashboard → Settings → Edge Functions → Secrets
- OU via CLI: `supabase secrets set OPENROUTER_API_KEY=xxx`
- Documentação: `https://supabase.com/docs/guides/functions/secrets`

---

## 15. Regras de Código

Criar `agents.md` com o conteúdo completo da Seção P das instruções fixas, adicionando as seguintes regras específicas deste projeto:

```markdown
## Regras específicas — Empire Maps

### Impersonamento
- NUNCA confundir a sessão do consultor com a do cliente durante impersonamento
- O ImpersonationContext é SEPARADO do AuthContext
- Logs de impersonamento são criados via Edge Function com service role — nunca do cliente

### Entregáveis com IA
- Markdowns são processados SEMPRE via Edge Function `process-deliverable`
- NUNCA chamar OpenRouter diretamente do cliente
- Sempre validar o tipo e tamanho do arquivo antes do upload

### Cards de Conteúdo
- `internal_notes` NUNCA deve ser retornado para clientes — garantir via RLS e via query
- Clientes NÃO podem deletar cards criados por consultores — verificar `created_by` na RLS

### Design System Empire
- Border-radius quase zero em botões (--radius: 0.125rem) — estética premium
- Títulos SEMPRE em Cormorant Garamond (font-display)
- UI/texto SEMPRE em DM Sans (sem classe = DM Sans)
- Gold gradient em textos de destaque: `text-gold-gradient`
```

---

*Este PRD é somente leitura. A primeira ação ao iniciar o projeto é criar `docs/prd.md` com exatamente este conteúdo.*
*Qualquer mudança de escopo deve seguir o Protocolo de Mudança de Feature (PCF) descrito nas instruções fixas.*
