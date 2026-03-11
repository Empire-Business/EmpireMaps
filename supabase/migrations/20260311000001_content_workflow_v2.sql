-- ============================================================
-- Migration: Content Workflow v2
-- Adds: content_id, two-stage approval, separated responsibilities,
--        social profiles table, new card fields
-- ============================================================

-- 1. Sequence for auto-generated content IDs (ID-001, ID-002...)
CREATE SEQUENCE IF NOT EXISTS content_card_seq START 1;

-- Set sequence to max existing content count + 1
DO $$
DECLARE
  max_count integer;
BEGIN
  SELECT count(*) INTO max_count FROM content_cards;
  IF max_count > 0 THEN
    PERFORM setval('content_card_seq', max_count);
  END IF;
END $$;

-- 2. Add new columns to content_cards
ALTER TABLE content_cards
  ADD COLUMN IF NOT EXISTS content_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stage_tag text DEFAULT 'aguardando_roteiro',
  ADD COLUMN IF NOT EXISTS scriptwriter text,
  ADD COLUMN IF NOT EXISTS editor_name text,
  ADD COLUMN IF NOT EXISTS designer text,
  ADD COLUMN IF NOT EXISTS poster_name text,
  ADD COLUMN IF NOT EXISTS script_deadline date,
  ADD COLUMN IF NOT EXISTS edit_deadline date,
  ADD COLUMN IF NOT EXISTS source_file_url text,
  ADD COLUMN IF NOT EXISTS final_format text,
  ADD COLUMN IF NOT EXISTS destination_profiles text[],
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- 3. Add check constraint for stage_tag
ALTER TABLE content_cards
  ADD CONSTRAINT chk_stage_tag CHECK (
    stage_tag IN ('aguardando_roteiro', 'roteiro_aprovado', 'em_edicao', 'aprovado_final')
  );

-- 4. Trigger to auto-generate content_id on insert
CREATE OR REPLACE FUNCTION generate_content_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_id IS NULL THEN
    NEW.content_id := 'ID-' || LPAD(nextval('content_card_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_content_id ON content_cards;
CREATE TRIGGER trg_content_id
  BEFORE INSERT ON content_cards
  FOR EACH ROW
  EXECUTE FUNCTION generate_content_id();

-- 5. Backfill content_id for existing cards
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM content_cards
  WHERE content_id IS NULL
)
UPDATE content_cards c
SET content_id = 'ID-' || LPAD(numbered.rn::text, 3, '0')
FROM numbered
WHERE c.id = numbered.id;

-- 6. Migrate existing statuses to new workflow
-- Map old statuses to new ones + set stage_tag
UPDATE content_cards SET status = 'a_fazer', stage_tag = 'aguardando_roteiro'
  WHERE status = 'ideia';

UPDATE content_cards SET status = 'em_andamento', stage_tag = 'aguardando_roteiro'
  WHERE status = 'em_producao';

UPDATE content_cards SET status = 'aprovacao', stage_tag = 'aguardando_roteiro'
  WHERE status = 'revisao';

UPDATE content_cards SET stage_tag = 'aprovado_final'
  WHERE status IN ('agendado', 'publicado');

UPDATE content_cards SET stage_tag = 'aprovado_final'
  WHERE status = 'arquivado' AND stage_tag IS NULL;

-- 7. Update status check constraint (drop old if exists, add new)
ALTER TABLE content_cards DROP CONSTRAINT IF EXISTS content_cards_status_check;
ALTER TABLE content_cards DROP CONSTRAINT IF EXISTS chk_content_cards_status;
ALTER TABLE content_cards
  ADD CONSTRAINT chk_content_cards_status CHECK (
    status IN ('a_fazer', 'em_andamento', 'aprovacao', 'aprovado_final', 'agendado', 'publicado', 'arquivado')
  );

-- 8. Create client_social_profiles table
CREATE TABLE IF NOT EXISTS client_social_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  handle text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for client_social_profiles
ALTER TABLE client_social_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all social profiles"
  ON client_social_profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Consultants can view their clients social profiles"
  ON client_social_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM consultant_clients cc
    WHERE cc.consultant_id = auth.uid() AND cc.client_id = client_social_profiles.client_id
  ));

CREATE POLICY "Consultants can manage their clients social profiles"
  ON client_social_profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM consultant_clients cc
    WHERE cc.consultant_id = auth.uid() AND cc.client_id = client_social_profiles.client_id
  ));

CREATE POLICY "Clients can view own social profiles"
  ON client_social_profiles FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can manage own social profiles"
  ON client_social_profiles FOR ALL
  USING (client_id = auth.uid());

-- 9. Make content_id NOT NULL after backfill (for future inserts the trigger handles it)
-- ALTER TABLE content_cards ALTER COLUMN content_id SET NOT NULL;
-- Commenting out in case there are edge cases; the trigger ensures it's always set.

-- Done!
