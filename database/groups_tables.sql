-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    creator_username VARCHAR(255) NOT NULL,
    creator_avatar VARCHAR(255),
    members_count INTEGER DEFAULT 1,
    posts_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    username VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group posts table
CREATE TABLE IF NOT EXISTS group_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    username VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(255),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group comments table
CREATE TABLE IF NOT EXISTS group_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    username VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group post likes table
CREATE TABLE IF NOT EXISTS group_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_post_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_created_at ON group_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_comments_post_id ON group_comments(group_post_id);
CREATE INDEX IF NOT EXISTS idx_group_post_likes_post_id ON group_post_likes(group_post_id);

-- RLS (Row Level Security) disabled for development
-- ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE group_post_likes ENABLE ROW LEVEL SECURITY;

-- All POLICYs commented out for development
-- Uncomment and enable RLS when ready for production

-- Functions for incrementing counts
CREATE OR REPLACE FUNCTION increment_group_members(group_id UUID, increment_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE groups 
    SET members_count = members_count + increment_amount,
        updated_at = NOW()
    WHERE id = group_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_group_posts(group_id UUID, increment_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE groups 
    SET posts_count = posts_count + increment_amount,
        updated_at = NOW()
    WHERE id = group_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_group_post_comments(group_post_id UUID, increment_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE group_posts 
    SET comments = comments + increment_amount,
        updated_at = NOW()
    WHERE id = group_post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_group_post_likes(group_post_id UUID, increment_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE group_posts 
    SET likes = likes + increment_amount,
        updated_at = NOW()
    WHERE id = group_post_id;
END;
$$ LANGUAGE plpgsql;
