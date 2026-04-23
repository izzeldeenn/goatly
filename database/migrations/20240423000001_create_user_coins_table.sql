-- Create user_coins table
CREATE TABLE IF NOT EXISTS public.user_coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_coins_user_id_idx ON public.user_coins(user_id);
CREATE INDEX IF NOT EXISTS user_coins_balance_idx ON public.user_coins(balance DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own coins
CREATE POLICY "Users can view their own coins" ON public.user_coins
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own coins
CREATE POLICY "Users can insert their own coins" ON public.user_coins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own coins
CREATE POLICY "Users can update their own coins" ON public.user_coins
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_coins_updated_at BEFORE UPDATE ON public.user_coins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
