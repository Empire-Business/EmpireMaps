-- ============================================================
-- Migration 003 — Storage Buckets
-- Empire Maps
-- ============================================================

-- Bucket: markdowns originais (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deliverable-markdowns',
  'deliverable-markdowns',
  false,
  5242880, -- 5MB
  ARRAY['text/markdown', 'text/plain', 'text/x-markdown']
);

-- Bucket: anexos de cards (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'card-attachments',
  'card-attachments',
  false,
  20971520 -- 20MB
);

-- Bucket: thumbnails de formatos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'format-thumbnails',
  'format-thumbnails',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Bucket: avatares (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================================
-- Storage Policies
-- Nota: storage policies usam subquery no profiles para checar role
-- pois funções do schema public não são acessíveis diretamente aqui
-- ============================================================

-- deliverable-markdowns: apenas admin e consultor
CREATE POLICY "deliverable_markdowns_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'deliverable-markdowns'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'consultant')
    )
  );

CREATE POLICY "deliverable_markdowns_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'deliverable-markdowns'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'consultant')
    )
  );

CREATE POLICY "deliverable_markdowns_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'deliverable-markdowns'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'consultant')
    )
  );

-- card-attachments: qualquer usuário autenticado
CREATE POLICY "card_attachments_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'card-attachments'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "card_attachments_storage_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'card-attachments'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "card_attachments_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'card-attachments'
    AND auth.uid() IS NOT NULL
  );

-- format-thumbnails: público para leitura, apenas admin para escrita
CREATE POLICY "format_thumbnails_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'format-thumbnails');

CREATE POLICY "format_thumbnails_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'format-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "format_thumbnails_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'format-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "format_thumbnails_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'format-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- avatars: público para leitura, autenticado para escrita
CREATE POLICY "avatars_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
  );
