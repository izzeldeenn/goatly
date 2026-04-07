-- Fix creator_id type by removing policies first, then changing types
-- Run this in Supabase SQL Editor

-- Drop all policies that depend on creator_id or user_id columns
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their own groups" ON groups;
DROP POLICY IF EXISTS "Groups are viewable by everyone" ON groups;

DROP POLICY IF EXISTS "Users can join public groups" ON group_members;
DROP POLICY IF EXISTS "Group admins can add members to private groups" ON group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON group_members;
DROP POLICY IF EXISTS "Group members are viewable by group members" ON group_members;

DROP POLICY IF EXISTS "Group members can create posts" ON group_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON group_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON group_posts;
DROP POLICY IF EXISTS "Group posts are viewable by group members" ON group_posts;

DROP POLICY IF EXISTS "Group members can create comments" ON group_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON group_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON group_comments;
DROP POLICY IF EXISTS "Group comments are viewable by group members" ON group_comments;

DROP POLICY IF EXISTS "Group members can like posts" ON group_post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON group_post_likes;
DROP POLICY IF EXISTS "Group post likes are viewable by group members" ON group_post_likes;

-- Disable RLS temporarily
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_likes DISABLE ROW LEVEL SECURITY;

-- Now change the column types
ALTER TABLE groups ALTER COLUMN creator_id TYPE TEXT USING creator_id::TEXT;
ALTER TABLE group_members ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_post_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

SELECT 'Successfully fixed all user_id and creator_id columns to use TEXT' as result;
