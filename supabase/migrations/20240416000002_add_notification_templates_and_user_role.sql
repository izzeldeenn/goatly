-- Add role column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' 
    AND column_name='role' 
    AND table_schema='public'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member'));
  END IF;
END $$;

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin_announcement', 'system_update', 'maintenance', 'welcome')),
  message TEXT NOT NULL,
  variables TEXT[], -- Array of variable names that can be substituted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for notification_templates
CREATE INDEX IF NOT EXISTS notification_templates_type_idx ON public.notification_templates(type);
CREATE INDEX IF NOT EXISTS notification_templates_created_at_idx ON public.notification_templates(created_at DESC);

-- Enable Row Level Security (RLS) for notification_templates
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to manage notification templates
CREATE POLICY "Admins can manage notification templates" ON public.notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notification_templates_updated_at 
  BEFORE UPDATE ON public.notification_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
