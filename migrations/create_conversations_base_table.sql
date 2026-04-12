-- Drop the existing conversations view if it exists
DROP VIEW IF EXISTS conversations;

-- Create the conversations_base table (the actual table for storing conversations)
CREATE TABLE IF NOT EXISTS conversations_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    other_user_id UUID NOT NULL,
    idx INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate conversations between same users
    CONSTRAINT unique_user_conversation UNIQUE (user1_id, user2_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user1 ON conversations_base(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2 ON conversations_base(user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations_base(last_message_at DESC);

-- Create the conversations view (for reading, will be used by the app)
CREATE OR REPLACE VIEW conversations AS
SELECT 
    cb.id,
    cb.user1_id,
    cb.user2_id,
    cb.last_message,
    cb.last_message_at,
    cb.last_message_sender_id,
    cb.other_user_id,
    cb.idx,
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

-- Insert trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_conversations_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations_base
    FOR EACH ROW
    EXECUTE FUNCTION update_conversations_updated_at_column();

-- Insert trigger to automatically set other_user_id
CREATE OR REPLACE FUNCTION set_conversation_other_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Set other_user_id to the user who is NOT the current user
    -- This will be useful when we know who is viewing the conversation
    NEW.other_user_id = COALESCE(NEW.user1_id, NEW.user2_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_conversation_other_user_id
    BEFORE INSERT OR UPDATE ON conversations_base
    FOR EACH ROW
    EXECUTE FUNCTION set_conversation_other_user_id();
