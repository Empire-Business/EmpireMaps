-- Add is_active to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create deliverable_versions table for version history
CREATE TABLE IF NOT EXISTS public.deliverable_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id uuid NOT NULL REFERENCES public.deliverables(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  raw_markdown text,
  processed_json jsonb,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_deliverable_versions_deliverable_id
  ON public.deliverable_versions(deliverable_id, version_number DESC);

-- RLS for deliverable_versions
ALTER TABLE public.deliverable_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and consultant can view versions"
  ON public.deliverable_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'consultant')
    )
  );

-- Create format-thumbnails storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('format-thumbnails', 'format-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for format-thumbnails
CREATE POLICY "Admin can upload thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'format-thumbnails' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Anyone can view thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'format-thumbnails');
