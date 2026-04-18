-- Remove duration_minutes column from activity_sessions table
-- This migration removes the old duration_minutes column as we now use duration_seconds for more accurate time tracking

-- First, ensure duration_seconds column exists and has data
DO $$
BEGIN
    -- Check if duration_seconds column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_sessions' AND column_name = 'duration_seconds'
    ) THEN
        -- Add duration_seconds column if it doesn't exist
        ALTER TABLE activity_sessions ADD COLUMN duration_seconds INTEGER DEFAULT 0;
        
        -- Migrate existing data from duration_minutes to duration_seconds
        UPDATE activity_sessions SET duration_seconds = duration_minutes * 60 WHERE duration_minutes IS NOT NULL;
    END IF;
END $$;

-- Now drop the duration_minutes column
ALTER TABLE activity_sessions DROP COLUMN IF EXISTS duration_minutes;
