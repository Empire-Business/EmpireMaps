# Arquitetura — Empire Maps

## Visão Geral

Empire Maps é um portal SaaS de consultoria de conteúdo construído como uma Single Page Application (SPA) com backend serverless via Supabase.

```
┌─────────────────────────────────────────────────────┐
│                    Cliente (Browser)                  │
│         React 18 + TypeScript + Vite + TailwindCSS   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────┐
│                    Supabase                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  PostgreSQL  │  │  Auth (JWT)  │  │  Storage   │ │
│  │  + RLS       │  │  + Policies  │  │  (S3-like) │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │            Edge Functions (Deno)                  ││
│  │  process-deliverable | suggest-content-reuse      ││
│  │  send-welcome-email                               ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────┐
│              Serviços Externos                         │
│  OpenRouter (Claude 3.5) │ Resend (e-mail)            │
└───────────────────────────────────────────────────────┘
```

## Stack Frontend

| Categoria       | Tecnologia                    |
|-----------------|-------------------------------|
| Framework       | React 18                      |
| Linguagem       | TypeScript (strict mode)      |
| Build           | Vite + SWC                    |
| Estilo          | Tailwind CSS v3 customizado   |
| Roteamento      | React Router v6               |
| Estado servidor | TanStack Query v5             |
| Formulários     | React Hook Form + Zod         |
| Drag & Drop     | @dnd-kit/core + @dnd-kit/sortable |
| Ícones          | Lucide React                  |
| Markdown        | react-markdown                |

## Design System

Paleta de cores definida em `tailwind.config.ts`:

| Token              | Valor      | Uso                          |
|--------------------|------------|------------------------------|
| `empire-bg`        | `#0a0a0a`  | Fundo principal              |
| `empire-surface`   | `#111111`  | Superfícies secundárias      |
| `empire-card`      | `#151515`  | Cards e painéis              |
| `empire-border`    | `#1e1e1e`  | Bordas e divisores           |
| `empire-text`      | `#f5f5f0`  | Texto principal              |
| `empire-gold`      | `#c9a84c`  | Destaque premium / brand     |
| `empire-goldLight` | `#e8c96d`  | Hover / gradiente claro      |
| `empire-goldDark`  | `#a8853a`  | Sombras / gradiente escuro   |

Fontes:
- **Display:** Cormorant Garamond (títulos, headings)
- **Body:** DM Sans (texto corrido, UI)

## Fluxo de Autenticação

```
1. Login (email + senha) → Supabase Auth
2. Auth emite JWT → armazenado automaticamente
3. AuthContext.fetchProfile() → busca perfil na tabela `profiles`
4. ProtectedRoute.tsx → redireciona baseado em profile.role
   - admin    → /admin
   - consultant → /consultant
   - client   → /client
```

## Segurança

- **RLS (Row Level Security):** Habilitado em todas as tabelas
- **Funções helper:** `get_my_role()`, `is_my_client()` para políticas
- **Impersonation:** Log completo em `impersonation_logs`
- **Storage:** Políticas separadas por bucket com verificação de role

## Fluxo de Entregáveis (Deliverables)

```
Admin/Consultor faz upload .md
         ↓
MarkdownUploader → Storage bucket
         ↓
Supabase upsert deliverable { status: 'locked', markdown_path }
         ↓
Chama Edge Function process-deliverable
         ↓
status = 'in_progress' → IA processa → status = 'ready'
         ↓
Cliente vê conteúdo renderizado (RiskMapView / BrandBookView / EditorialLineView)
```
