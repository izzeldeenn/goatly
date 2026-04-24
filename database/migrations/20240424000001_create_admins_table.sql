-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'admin',
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow admins to read all admins
CREATE POLICY "Admins can read all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to insert new admins (only super admins)
CREATE POLICY "Super admins can create admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()::text
      AND is_super_admin = TRUE
    )
  );

-- Allow admins to update their own profile
CREATE POLICY "Admins can update own profile"
  ON admins FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid()::text)
  WITH CHECK (admin_id = auth.uid()::text);

-- Allow super admins to update any admin
CREATE POLICY "Super admins can update any admin"
  ON admins FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()::text
      AND is_super_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()::text
      AND is_super_admin = TRUE
    )
  );

-- Allow super admins to delete admins
CREATE POLICY "Super admins can delete admins"
  ON admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admin_id = auth.uid()::text
      AND is_super_admin = TRUE
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_admin_id ON admins(admin_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_last_active ON admins(last_active DESC);

-- Create a function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_admin_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_active
CREATE TRIGGER trigger_update_admin_last_active
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_last_active();
