-- Fix the creator_id column type in groups table
-- Run this in Supabase SQL Editor

-- First, drop the foreign key constraint if it exists
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_creator_id_fkey;

-- Change the column type from UUID to TEXT
ALTER TABLE groups ALTER COLUMN creator_id TYPE TEXT USING creator_id::TEXT;

-- Also fix other tables that might have the same issue
ALTER TABLE group_members ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_post_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

SELECT 'Fixed creator_id and user_id columns to use TEXT instead of UUID' as result;
