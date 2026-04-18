-- Remove study_minutes column from daily_activities table
-- This migration removes the old study_minutes column as we now use study_seconds for more accurate time tracking

-- First, ensure study_seconds column exists and has data
DO $$
BEGIN
    -- Check if study_seconds column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_activities' AND column_name = 'study_seconds'
    ) THEN
        -- Add study_seconds column if it doesn't exist
        ALTER TABLE daily_activities ADD COLUMN study_seconds INTEGER DEFAULT 0;
        
        -- Migrate existing data from study_minutes to study_seconds
        UPDATE daily_activities SET study_seconds = study_minutes * 60 WHERE study_minutes IS NOT NULL;
    END IF;
END $$;

-- Now drop the study_minutes column
ALTER TABLE daily_activities DROP COLUMN IF EXISTS study_minutes;
