-- Add email column to free_scans for lead capture + auto-matching on signup
ALTER TABLE free_scans ADD COLUMN IF NOT EXISTS email text;
CREATE INDEX IF NOT EXISTS idx_free_scans_email ON free_scans(email) WHERE email IS NOT NULL;
