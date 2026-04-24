-- Allow creation of first admin when table is empty
-- This is needed for initial setup via API

DROP POLICY IF EXISTS "Allow first admin creation" ON admins;

CREATE POLICY "Allow first admin creation"
  ON admins FOR INSERT
  TO anon
  WITH CHECK (
    (SELECT COUNT(*) FROM admins) = 0
  );

-- Allow anon to read admins (for login check)
DROP POLICY IF EXISTS "Allow anon to read admins" ON admins;

CREATE POLICY "Allow anon to read admins"
  ON admins FOR SELECT
  TO anon
  USING (true);
