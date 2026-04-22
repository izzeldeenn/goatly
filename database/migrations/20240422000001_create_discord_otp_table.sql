-- Create discord_otps table for storing Discord linking OTP codes
CREATE TABLE IF NOT EXISTS discord_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_hash_key VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_hash_key)
);

-- Disable RLS on discord_otps table for unrestricted access
ALTER TABLE discord_otps DISABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_discord_otps_user_hash_key ON discord_otps(user_hash_key);
CREATE INDEX IF NOT EXISTS idx_discord_otps_otp_code ON discord_otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_discord_otps_expires_at ON discord_otps(expires_at);

-- Create function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_discord_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM discord_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
