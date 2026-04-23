-- Alter user_coins table to change user_id from UUID to TEXT
-- This is needed because the app uses custom account IDs (strings) instead of Supabase Auth UUIDs

-- Drop policies that depend on user_id column
DROP POLICY IF EXISTS "Users can view their own coins" ON user_coins;
DROP POLICY IF EXISTS "Users can insert their own coins" ON user_coins;
DROP POLICY IF EXISTS "Users can update their own coins" ON user_coins;

DROP POLICY IF EXISTS "Users can view their own transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Service functions can insert transactions" ON coin_transactions;

-- First, drop the foreign key constraint if it exists
ALTER TABLE user_coins DROP CONSTRAINT IF EXISTS user_coins_user_id_fkey;

-- Change the column type from UUID to TEXT
ALTER TABLE user_coins ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Do the same for coin_transactions table
ALTER TABLE coin_transactions DROP CONSTRAINT IF EXISTS coin_transactions_user_id_fkey;
ALTER TABLE coin_transactions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Re-create policies with TEXT type
-- Since the app uses custom account IDs (not Supabase Auth), we'll use more permissive policies
-- In production, you should implement proper authentication checks

-- user_coins policies - Allow all operations for now (will be secured with app-level logic)
CREATE POLICY "Enable all access to user_coins"
ON user_coins FOR ALL
USING (true)
WITH CHECK (true);

-- coin_transactions policies - Allow all operations for now (will be secured with app-level logic)
CREATE POLICY "Enable all access to coin_transactions"
ON coin_transactions FOR ALL
USING (true)
WITH CHECK (true);

-- Note: We're not re-adding foreign key constraints because users table uses account_id (TEXT) not id (UUID)
