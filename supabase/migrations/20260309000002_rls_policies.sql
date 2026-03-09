-- ============================================================
-- Migration 002 — RLS Policies
-- Empire Maps
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultant_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: verificar role do usuário atual
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: verificar se consultor está vinculado ao cliente
CREATE OR REPLACE FUNCTION public.is_my_client(client_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.consultant_clients
    WHERE consultant_id = auth.uid()
    AND client_id = client_uuid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(id))
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid()
    OR public.get_my_role() = 'admin'
  );

-- ============================================================
-- CONSULTANT_CLIENTS
-- ============================================================
CREATE POLICY "consultant_clients_select" ON public.consultant_clients
  FOR SELECT USING (
    consultant_id = auth.uid()
    OR public.get_my_role() = 'admin'
  );

CREATE POLICY "consultant_clients_insert" ON public.consultant_clients
  FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "consultant_clients_update" ON public.consultant_clients
  FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "consultant_clients_delete" ON public.consultant_clients
  FOR DELETE USING (public.get_my_role() = 'admin');

-- ============================================================
-- CLIENT_DIAGNOSTICS
-- ============================================================
CREATE POLICY "client_diagnostics_select" ON public.client_diagnostics
  FOR SELECT USING (
    client_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

CREATE POLICY "client_diagnostics_insert" ON public.client_diagnostics
  FOR INSERT WITH CHECK (
    client_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

CREATE POLICY "client_diagnostics_update" ON public.client_diagnostics
  FOR UPDATE USING (
    client_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

-- ============================================================
-- DELIVERABLES
-- ============================================================
CREATE POLICY "deliverables_select" ON public.deliverables
  FOR SELECT USING (
    client_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

CREATE POLICY "deliverables_insert" ON public.deliverables
  FOR INSERT WITH CHECK (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

CREATE POLICY "deliverables_update" ON public.deliverables
  FOR UPDATE USING (
    public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

-- ============================================================
-- CONTENT_CARDS
-- ============================================================
CREATE POLICY "content_cards_select" ON public.content_cards
  FOR SELECT USING (
    client_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

CREATE POLICY "content_cards_insert" ON public.content_cards
  FOR INSERT WITH CHECK (
    client_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

CREATE POLICY "content_cards_update" ON public.content_cards
  FOR UPDATE USING (
    client_id = auth.uid()
    OR public.get_my_role() = 'admin'
    OR (public.get_my_role() = 'consultant' AND public.is_my_client(client_id))
  );

-- Cliente NÃO pode deletar cards criados por consultores
CREATE POLICY "content_cards_delete" ON public.content_cards
  FOR DELETE USING (
    public.get_my_role() = 'admin'
    OR (
      created_by = auth.uid()
      AND (
        public.get_my_role() = 'consultant'
        OR public.get_my_role() = 'client'
      )
    )
  );

-- ============================================================
-- CARD_ATTACHMENTS
-- ============================================================
CREATE POLICY "card_attachments_select" ON public.card_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.content_cards cc
      WHERE cc.id = card_id
      AND (
        cc.client_id = auth.uid()
        OR public.get_my_role() = 'admin'
        OR (public.get_my_role() = 'consultant' AND public.is_my_client(cc.client_id))
      )
    )
  );

CREATE POLICY "card_attachments_insert" ON public.card_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.content_cards cc
      WHERE cc.id = card_id
      AND (
        cc.client_id = auth.uid()
        OR public.get_my_role() = 'admin'
        OR (public.get_my_role() = 'consultant' AND public.is_my_client(cc.client_id))
      )
    )
  );

-- ============================================================
-- CONTENT_FORMATS
-- ============================================================
CREATE POLICY "content_formats_select" ON public.content_formats
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "content_formats_insert" ON public.content_formats
  FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "content_formats_update" ON public.content_formats
  FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "content_formats_delete" ON public.content_formats
  FOR DELETE USING (public.get_my_role() = 'admin');

-- ============================================================
-- IMPERSONATION_LOGS
-- ============================================================
CREATE POLICY "impersonation_logs_select" ON public.impersonation_logs
  FOR SELECT USING (public.get_my_role() = 'admin');

-- INSERT via cliente autenticado (consultor registra sua própria sessão)
CREATE POLICY "impersonation_logs_insert" ON public.impersonation_logs
  FOR INSERT WITH CHECK (
    consultant_id = auth.uid()
    AND (
      public.get_my_role() = 'consultant'
      OR public.get_my_role() = 'admin'
    )
  );

CREATE POLICY "impersonation_logs_update" ON public.impersonation_logs
  FOR UPDATE USING (
    consultant_id = auth.uid()
    OR public.get_my_role() = 'admin'
  );
