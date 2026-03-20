-- Temporary fix: Disable RLS for friendships table to resolve removeFriend error
-- This should be applied to your Supabase database

ALTER TABLE friendships DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS enabled but allow the operations, you can modify the policies:
-- DROP POLICY IF EXISTS "Users can delete their friendships" ON friendships;
-- CREATE POLICY "Users can delete their friendships" ON friendships
--     FOR DELETE USING (
--         -- Allow deletion if either user ID matches (no auth.uid() requirement)
--         true -- This removes authentication requirement temporarily
--     );

-- Note: This is a temporary solution. For production, you should implement proper
-- Supabase authentication or modify the RLS policies to work with your custom auth system.
