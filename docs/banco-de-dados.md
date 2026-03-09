# Banco de Dados — Empire Maps

## Tabelas

### `profiles`
Estende `auth.users`. Criado automaticamente via trigger `handle_new_user`.

| Coluna       | Tipo      | Descrição                             |
|--------------|-----------|---------------------------------------|
| `id`         | `uuid`    | FK → `auth.users.id`                  |
| `email`      | `text`    | E-mail do usuário                     |
| `full_name`  | `text`    | Nome completo                         |
| `role`       | `text`    | `admin` \| `consultant` \| `client`   |
| `avatar_url` | `text`    | URL do avatar no Storage              |
| `created_at` | `timestamptz` | Data de criação                   |

### `consultant_clients`
Relacionamento N:N entre consultores e clientes.

| Coluna          | Tipo   | Descrição                  |
|-----------------|--------|----------------------------|
| `id`            | `uuid` | PK                         |
| `consultant_id` | `uuid` | FK → `profiles.id`         |
| `client_id`     | `uuid` | FK → `profiles.id`         |
| `created_at`    | `timestamptz` |                     |

### `client_diagnostics`
Formulário de diagnóstico da Fase 1 (preenchido pelo cliente).

| Coluna         | Tipo      | Descrição                          |
|----------------|-----------|------------------------------------|
| `id`           | `uuid`    | PK                                 |
| `client_id`    | `uuid`    | FK → `profiles.id` (UNIQUE)        |
| `full_name`    | `text`    | Nome completo                      |
| `email`        | `text`    | E-mail                             |
| `whatsapp_ddi` | `text`    | DDI (+55, +1, ...)                 |
| `whatsapp_ddd` | `text`    | DDD (2 dígitos)                    |
| `whatsapp_num` | `text`    | Número do WhatsApp                 |
| `social_links` | `jsonb`   | `{ instagram, linkedin, ... }`     |
| `objectives`   | `text`    | Objetivos da consultoria           |
| `is_locked`    | `boolean` | Bloqueado após envio               |
| `submitted_at` | `timestamptz` | Data de envio                  |

### `deliverables`
Entregáveis processados por IA (Mapa de Riscos, Brand Book, Linha Editorial).

| Coluna           | Tipo      | Descrição                              |
|------------------|-----------|----------------------------------------|
| `id`             | `uuid`    | PK                                     |
| `client_id`      | `uuid`    | FK → `profiles.id`                     |
| `type`           | `text`    | `risk_map` \| `brand_book` \| `editorial_line` |
| `status`         | `text`    | `locked` \| `in_progress` \| `ready`   |
| `markdown_path`  | `text`    | Caminho no Storage                     |
| `processed_json` | `jsonb`   | JSON estruturado pela IA               |
| `created_at`     | `timestamptz` |                                    |
| `updated_at`     | `timestamptz` |                                    |

Constraint: `UNIQUE(client_id, type)`

### `content_cards`
Cards do Mapa de Produção (Kanban).

| Coluna         | Tipo        | Descrição                               |
|----------------|-------------|-----------------------------------------|
| `id`           | `uuid`      | PK                                      |
| `client_id`    | `uuid`      | FK → `profiles.id`                      |
| `title`        | `text`      | Título do conteúdo                      |
| `description`  | `text`      | Descrição                               |
| `format`       | `text`      | Formato (Reels, Carrossel, ...)         |
| `channel`      | `text`      | Canal (Instagram, LinkedIn, ...)        |
| `status`       | `text`      | `idea` \| `script` \| `production` \| `review` \| `published` |
| `tags`         | `text[]`    | Array de tags                           |
| `publish_date` | `date`      | Data planejada de publicação            |
| `position`     | `integer`   | Ordem dentro da coluna (Kanban)         |
| `created_at`   | `timestamptz` |                                       |
| `updated_at`   | `timestamptz` |                                       |

### `card_attachments`
Arquivos anexados a content_cards.

| Coluna      | Tipo   | Descrição                        |
|-------------|--------|----------------------------------|
| `id`        | `uuid` | PK                               |
| `card_id`   | `uuid` | FK → `content_cards.id`          |
| `file_name` | `text` | Nome original do arquivo         |
| `file_path` | `text` | Caminho no Storage               |
| `file_size` | `integer` | Tamanho em bytes               |
| `mime_type` | `text` | Tipo MIME                        |
| `created_at`| `timestamptz` |                            |

### `content_formats`
Biblioteca de formatos de conteúdo (gerenciada por admins).

| Coluna          | Tipo      | Descrição                       |
|-----------------|-----------|---------------------------------|
| `id`            | `uuid`    | PK                              |
| `name`          | `text`    | Nome do formato                 |
| `description`   | `text`    | Descrição                       |
| `platforms`     | `text[]`  | Plataformas compatíveis         |
| `how_to`        | `text`    | Instruções (uma por linha)      |
| `tips`          | `text[]`  | Array de dicas                  |
| `tags`          | `text[]`  | Tags para busca                 |
| `thumbnail_url` | `text`    | URL da imagem no Storage        |
| `created_at`    | `timestamptz` |                             |
| `updated_at`    | `timestamptz` |                             |

### `impersonation_logs`
Auditoria de impersonation (admin/consultor acessando como cliente).

| Coluna         | Tipo          | Descrição                        |
|----------------|---------------|----------------------------------|
| `id`           | `uuid`        | PK                               |
| `impersonator_id` | `uuid`     | Quem impersonou                  |
| `client_id`    | `uuid`        | Quem foi impersonado             |
| `started_at`   | `timestamptz` | Início da sessão                 |
| `ended_at`     | `timestamptz` | Fim da sessão (nullable)         |

## Storage Buckets

| Bucket                 | Acesso   | Conteúdo                          |
|------------------------|----------|-----------------------------------|
| `deliverable-markdowns`| Privado  | Arquivos .md para processamento IA|
| `card-attachments`     | Privado  | Anexos de cards de conteúdo       |
| `format-thumbnails`    | Público  | Thumbnails do banco de formatos   |
| `avatars`              | Privado  | Fotos de perfil dos usuários      |

## Funções SQL

### `handle_new_user()`
Trigger `AFTER INSERT ON auth.users` — cria automaticamente um registro em `profiles`.

### `get_my_role()`
Retorna o `role` do usuário autenticado atual. Usada em políticas RLS.

### `is_my_client(uuid)`
Verifica se um `client_id` pertence ao consultor autenticado via `consultant_clients`. Usada em políticas RLS.
