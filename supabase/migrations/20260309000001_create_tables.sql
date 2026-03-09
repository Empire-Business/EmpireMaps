-- ============================================================
-- Migration 001 — Tabelas principais
-- Empire Maps
-- ============================================================

-- PROFILES
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('admin', 'consultant', 'client')),
  full_name   text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Trigger: criar profile automaticamente ao criar auth.user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CONSULTANT_CLIENTS
CREATE TABLE public.consultant_clients (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by     uuid REFERENCES public.profiles(id),
  created_at     timestamptz DEFAULT now(),
  UNIQUE(consultant_id, client_id)
);

-- CLIENT_DIAGNOSTICS
CREATE TABLE public.client_diagnostics (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  full_name      text,
  email          text,
  whatsapp_ddi   text,
  whatsapp_ddd   text,
  whatsapp_num   text,
  social_links   jsonb,
  objectives     text,
  submitted_at   timestamptz,
  is_locked      boolean DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- DELIVERABLES
CREATE TABLE public.deliverables (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type             text NOT NULL CHECK (type IN ('risk_map', 'brand_book', 'editorial_line')),
  status           text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'published')),
  raw_markdown     text,
  processed_json   jsonb,
  published_at     timestamptz,
  uploaded_by      uuid REFERENCES public.profiles(id),
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  UNIQUE(client_id, type)
);

-- CONTENT_FORMATS
CREATE TABLE public.content_formats (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  platforms     text[],
  description   text,
  how_to        text,
  examples      jsonb,
  tips          text[],
  thumbnail_url text,
  tags          text[],
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by    uuid REFERENCES public.profiles(id),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- CONTENT_CARDS
CREATE TABLE public.content_cards (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             text NOT NULL,
  description       text,
  channel           text,
  format_id         uuid REFERENCES public.content_formats(id),
  format_free       text,
  status            text NOT NULL DEFAULT 'ideia' CHECK (status IN ('ideia', 'em_producao', 'revisao', 'agendado', 'publicado', 'arquivado')),
  production_date   date,
  publish_date      date,
  responsible       text,
  labels            text[],
  internal_notes    text,
  publish_url       text,
  metrics           jsonb,
  created_by        uuid REFERENCES public.profiles(id),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- CARD_ATTACHMENTS
CREATE TABLE public.card_attachments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id     uuid NOT NULL REFERENCES public.content_cards(id) ON DELETE CASCADE,
  file_name   text NOT NULL,
  file_url    text NOT NULL,
  file_type   text,
  file_size   bigint,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at  timestamptz DEFAULT now()
);

-- IMPERSONATION_LOGS
CREATE TABLE public.impersonation_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id   uuid NOT NULL REFERENCES public.profiles(id),
  client_id       uuid NOT NULL REFERENCES public.profiles(id),
  started_at      timestamptz DEFAULT now(),
  ended_at        timestamptz,
  action_summary  text
);

-- Índices para performance
CREATE INDEX idx_consultant_clients_consultant ON public.consultant_clients(consultant_id);
CREATE INDEX idx_consultant_clients_client ON public.consultant_clients(client_id);
CREATE INDEX idx_deliverables_client ON public.deliverables(client_id);
CREATE INDEX idx_content_cards_client ON public.content_cards(client_id);
CREATE INDEX idx_content_cards_status ON public.content_cards(status);
CREATE INDEX idx_content_cards_publish_date ON public.content_cards(publish_date);
CREATE INDEX idx_impersonation_logs_consultant ON public.impersonation_logs(consultant_id);
