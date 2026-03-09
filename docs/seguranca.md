# Segurança — Empire Maps

## Modelo de Autenticação

- **Protocolo:** JWT via Supabase Auth
- **Sessão:** Persistida no `localStorage` (padrão Supabase)
- **Expiração:** Configurável no dashboard Supabase (padrão: 1 hora com refresh automático)

## Papéis (Roles)

| Role         | Acesso                                                    |
|--------------|-----------------------------------------------------------|
| `admin`      | Acesso total: gerenciar usuários, todos os clientes, formatos |
| `consultant` | Acesso aos próprios clientes + impersonation              |
| `client`     | Acesso apenas aos próprios dados                          |

## Row Level Security (RLS)

RLS está **habilitado em todas as tabelas**. Nenhuma query retorna dados não autorizados, mesmo com acesso direto à API.

### Funções helper

```sql
-- Retorna o role do usuário autenticado
CREATE FUNCTION get_my_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Verifica se um client_id pertence ao consultor autenticado
CREATE FUNCTION is_my_client(p_client_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.consultant_clients
    WHERE consultant_id = auth.uid() AND client_id = p_client_id
  )
$$;
```

### Políticas por tabela

#### `profiles`
- **SELECT:** Próprio perfil OU admin OU consultor (seus clientes)
- **UPDATE:** Próprio perfil OU admin

#### `client_diagnostics`
- **SELECT/UPDATE:** Próprio (client) OU admin OU consultor responsável
- **INSERT:** Apenas o próprio cliente

#### `deliverables`
- **SELECT:** Próprio (client, se ready) OU admin OU consultor responsável
- **INSERT/UPDATE:** Apenas admin ou consultor responsável

#### `content_cards`
- **SELECT/INSERT/UPDATE/DELETE:** Próprio cliente OU admin OU consultor responsável

#### `content_formats`
- **SELECT:** Qualquer autenticado
- **INSERT/UPDATE/DELETE:** Apenas admin

#### `impersonation_logs`
- **SELECT:** Admin vê todos; consultor vê os próprios
- **INSERT:** Admin ou consultor
- **UPDATE:** Apenas o próprio consultor (para setar `ended_at`)

## Storage Security

As políticas de Storage **não podem usar funções do schema `public`** (limitação do Supabase). Usam subqueries diretas:

```sql
-- Exemplo: policy de upload para deliverable-markdowns
CREATE POLICY "Admins and consultants can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deliverable-markdowns' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'consultant')
  )
);
```

## Impersonation

- Admins e consultores podem "impersonar" clientes para visualizar o portal como eles
- **Cada sessão de impersonation é logada** em `impersonation_logs` com timestamp de início e fim
- O banner de impersonation é sempre visível durante a sessão
- O impersonator mantém seu próprio JWT — não há troca de credenciais

## Boas Práticas

1. **Nunca expor** `SUPABASE_SERVICE_ROLE_KEY` no frontend
2. **VITE_** variables são bundle-exposed — usar apenas anon key
3. Senhas temporárias devem ser alteradas no primeiro login (recomendado implementar força de troca)
4. Migrations sempre usar `IF NOT EXISTS` para idempotência
5. Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` injetada automaticamente pelo runtime
6. Arquivos `.env` não devem ser commitados (ver `.gitignore`)
