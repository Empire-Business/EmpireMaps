-- ============================================================
-- Migration: Client Team Members
-- Allows clients to add team members with restricted access
-- ============================================================

-- 1. Add parent_client_id to profiles for team member linking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS parent_client_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_parent_client_id ON profiles(parent_client_id);

-- 3. RLS: Team members can read their parent client's content_cards
CREATE POLICY "Team members can view parent client cards"
  ON content_cards FOR SELECT
  USING (
    client_id IN (
      SELECT parent_client_id FROM profiles WHERE id = auth.uid() AND parent_client_id IS NOT NULL
    )
  );

-- 4. RLS: Team members can update parent client's content_cards
CREATE POLICY "Team members can update parent client cards"
  ON content_cards FOR UPDATE
  USING (
    client_id IN (
      SELECT parent_client_id FROM profiles WHERE id = auth.uid() AND parent_client_id IS NOT NULL
    )
  );

-- 5. RLS: Team members can insert content_cards for parent client
CREATE POLICY "Team members can insert parent client cards"
  ON content_cards FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT parent_client_id FROM profiles WHERE id = auth.uid() AND parent_client_id IS NOT NULL
    )
  );

-- 6. RLS: Team members can view parent client's social profiles
CREATE POLICY "Team members can view parent client social profiles"
  ON client_social_profiles FOR SELECT
  USING (
    client_id IN (
      SELECT parent_client_id FROM profiles WHERE id = auth.uid() AND parent_client_id IS NOT NULL
    )
  );

-- 7. RLS: Team members can view parent client's card attachments
CREATE POLICY "Team members can view parent client attachments"
  ON card_attachments FOR SELECT
  USING (
    card_id IN (
      SELECT id FROM content_cards WHERE client_id IN (
        SELECT parent_client_id FROM profiles WHERE id = auth.uid() AND parent_client_id IS NOT NULL
      )
    )
  );

-- Done!
