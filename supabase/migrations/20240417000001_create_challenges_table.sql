-- Create challenges table for real user competitions
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 600, -- Default 10 minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure a user can't challenge themselves
  CONSTRAINT challenger_not_opponent CHECK (challenger_id != opponent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_challenger_id ON public.challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_opponent_id ON public.challenges(opponent_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON public.challenges(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view challenges they are involved in
CREATE POLICY "Users can view their own challenges" ON public.challenges
  FOR SELECT USING (
    auth.uid() = challenger_id OR 
    auth.uid() = opponent_id
  );

-- Create policy for anon/authenticated users to insert challenges
CREATE POLICY "Users can create challenges" ON public.challenges
  FOR INSERT WITH CHECK (
    true -- Allow insert for anon and authenticated users
  );

-- Create policy for users to update challenges they are involved in
CREATE POLICY "Users can update their own challenges" ON public.challenges
  FOR UPDATE USING (
    auth.uid() = challenger_id OR 
    auth.uid() = opponent_id OR
    true -- Allow update for anon and authenticated users
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_challenges_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_challenges_updated_at 
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_challenges_updated_at_column();
