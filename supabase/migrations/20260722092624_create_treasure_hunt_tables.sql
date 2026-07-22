/*
# Treasure Hunt — Shared Team Progress (no auth, single-tenant)

1. New Tables
- `validations` — one row per (team, balise) pair validated.
  - `id` (uuid PK)
  - `team` (text, 'youinou' | 'bourdon')
  - `balise_id` (int, 1-10)
  - `pts` (int, points awarded)
  - `created_at` (timestamptz)
  - UNIQUE (team, balise_id) so a balise can only be validated once per team.
2. Security
- RLS enabled, anon + authenticated CRUD (intentionally public/shared data).
*/

CREATE TABLE IF NOT EXISTS validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team text NOT NULL CHECK (team IN ('youinou', 'bourdon')),
  balise_id int NOT NULL,
  pts int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (team, balise_id)
);

ALTER TABLE validations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_validations" ON validations;
CREATE POLICY "anon_select_validations" ON validations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_validations" ON validations;
CREATE POLICY "anon_insert_validations" ON validations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_validations" ON validations;
CREATE POLICY "anon_update_validations" ON validations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_validations" ON validations;
CREATE POLICY "anon_delete_validations" ON validations FOR DELETE
  TO anon, authenticated USING (true);
