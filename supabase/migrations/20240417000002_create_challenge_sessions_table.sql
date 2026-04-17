-- Create challenge_sessions table to track individual study sessions within a challenge
CREATE TABLE IF NOT EXISTS public.challenge_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  study_time_seconds INTEGER NOT NULL DEFAULT 0,
  is_studying BOOLEAN NOT NULL DEFAULT true,
  session_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_challenge_id ON public.challenge_sessions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_user_id ON public.challenge_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_last_update ON public.challenge_sessions(last_update_time DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.challenge_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view sessions in their challenges
CREATE POLICY "Users can view their own challenge sessions" ON public.challenge_sessions
  FOR SELECT USING (
    true -- Allow select for anon and authenticated users
  );

-- Create policy for users to insert sessions in their challenges
CREATE POLICY "Users can create challenge sessions" ON public.challenge_sessions
  FOR INSERT WITH CHECK (
    true -- Allow insert for anon and authenticated users
  );

-- Create policy for users to update their own sessions
CREATE POLICY "Users can update their own challenge sessions" ON public.challenge_sessions
  FOR UPDATE USING (
    true -- Allow update for anon and authenticated users
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_challenge_sessions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_update_time = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_challenge_sessions_updated_at 
  BEFORE UPDATE ON public.challenge_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_sessions_updated_at_column();
