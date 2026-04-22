-- Add discord_linked column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_linked BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_discord_linked ON users(discord_linked);
