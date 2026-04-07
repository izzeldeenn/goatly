-- Fix all constraints and column types for groups system
-- Run this in Supabase SQL Editor

-- Drop all foreign key constraints first
ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_creator_id_fkey;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
ALTER TABLE group_posts DROP CONSTRAINT IF EXISTS group_posts_group_id_fkey;
ALTER TABLE group_posts DROP CONSTRAINT IF EXISTS group_posts_user_id_fkey;
ALTER TABLE group_comments DROP CONSTRAINT IF EXISTS group_comments_group_post_id_fkey;
ALTER TABLE group_comments DROP CONSTRAINT IF EXISTS group_comments_user_id_fkey;
ALTER TABLE group_post_likes DROP CONSTRAINT IF EXISTS group_post_likes_group_post_id_fkey;
ALTER TABLE group_post_likes DROP CONSTRAINT IF EXISTS group_post_likes_user_id_fkey;

-- Drop all policies that depend on these columns
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

-- Disable RLS
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_post_likes DISABLE ROW LEVEL SECURITY;

-- Now change all column types to TEXT
ALTER TABLE groups ALTER COLUMN creator_id TYPE TEXT USING creator_id::TEXT;
ALTER TABLE group_members ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_posts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE group_post_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Re-add foreign key constraints without referencing auth.users (for development)
-- Group relationships
ALTER TABLE group_members ADD CONSTRAINT group_members_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
ALTER TABLE group_posts ADD CONSTRAINT group_posts_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
ALTER TABLE group_comments ADD CONSTRAINT group_comments_group_post_id_fkey 
    FOREIGN KEY (group_post_id) REFERENCES group_posts(id) ON DELETE CASCADE;
ALTER TABLE group_post_likes ADD CONSTRAINT group_post_likes_group_post_id_fkey 
    FOREIGN KEY (group_post_id) REFERENCES group_posts(id) ON DELETE CASCADE;

SELECT 'Successfully fixed all constraints and column types for groups system' as result;
