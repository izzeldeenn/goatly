-- Reset conversations system by dropping and recreating

-- Drop existing table and view
DROP TABLE IF EXISTS conversations_base CASCADE;
DROP VIEW IF EXISTS conversations;

-- Recreate conversations_base table without idx field (since it's managed automatically)
CREATE TABLE conversations_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    other_user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate conversations between same users
    CONSTRAINT unique_user_conversation UNIQUE (user1_id, user2_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations_base(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations_base(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations_base(last_message_at DESC);

-- Create the conversations view (for reading)
CREATE OR REPLACE VIEW conversations AS
SELECT 
    cb.id,
    cb.user1_id,
    cb.user2_id,
    cb.last_message,
    cb.last_message_at,
    cb.last_message_sender_id,
    cb.other_user_id,
    cb.created_at,
    cb.updated_at,
    -- Get user information for both users
    u1.username as user1_username,
    u1.avatar as user1_avatar,
    u1.account_id as user1_account_id,
    u2.username as user2_username,
    u2.avatar as user2_avatar,
    u2.account_id as user2_account_id,
    -- Determine which user is the "other" user based on context
    CASE 
        WHEN cb.user1_id = u1.id THEN u2.id
        ELSE u1.id
    END as other_user_uuid,
    CASE 
        WHEN cb.user1_id = u1.id THEN u2.username
        ELSE u1.username
    END as other_user_username,
    CASE 
        WHEN cb.user1_id = u1.id THEN u2.avatar
        ELSE u1.avatar
    END as other_user_avatar
FROM conversations_base cb
LEFT JOIN users u1 ON cb.user1_id = u1.id
LEFT JOIN users u2 ON cb.user2_id = u2.id;

-- Create RLS policies
CREATE POLICY "Users can insert conversations" ON conversations_base
    FOR INSERT WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

CREATE POLICY "Users can update own conversations" ON conversations_base
    FOR UPDATE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

CREATE POLICY "Users can read own conversations" ON conversations_base
    FOR SELECT USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

CREATE POLICY "Users can delete own conversations" ON conversations_base
    FOR DELETE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Enable RLS
ALTER TABLE conversations_base ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations_base TO anon, authenticated;
