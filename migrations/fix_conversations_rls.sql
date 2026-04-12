-- Fix RLS policies for conversations_base table

-- Option 1: Disable RLS temporarily (for testing)
-- ALTER TABLE conversations_base DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert conversations" ON conversations_base;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations_base;
DROP POLICY IF EXISTS "Users can read own conversations" ON conversations_base;

-- Allow users to insert conversations (only if they are one of the participants)
CREATE POLICY "Users can insert conversations" ON conversations_base
    FOR INSERT WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Allow users to update conversations they are part of
CREATE POLICY "Users can update own conversations" ON conversations_base
    FOR UPDATE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Allow users to read conversations they are part of
CREATE POLICY "Users can read own conversations" ON conversations_base
    FOR SELECT USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Allow users to delete conversations they are part of
CREATE POLICY "Users can delete own conversations" ON conversations_base
    FOR DELETE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Enable RLS
ALTER TABLE conversations_base ENABLE ROW LEVEL SECURITY;

-- Option 3: Grant necessary permissions
-- Make sure the anon role has necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations_base TO anon, authenticated;

-- Option 4: Create a service role for better security (recommended for production)
-- CREATE ROLE IF NOT EXISTS service_role;
-- GRANT USAGE ON SCHEMA public TO service_role;
-- GRANT ALL ON conversations_base TO service_role;
-- GRANT service_role TO anon, authenticated;
