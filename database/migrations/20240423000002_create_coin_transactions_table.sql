-- Create coin_transactions table
CREATE TABLE IF NOT EXISTS public.coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'refund', 'bonus', 'penalty')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  source TEXT NOT NULL, -- e.g., 'daily_login', 'pomodoro', 'purchase', 'subscription'
  source_id TEXT, -- ID of related item (e.g., session_id, item_id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS coin_transactions_user_id_idx ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS coin_transactions_type_idx ON public.coin_transactions(type);
CREATE INDEX IF NOT EXISTS coin_transactions_created_at_idx ON public.coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS coin_transactions_source_idx ON public.coin_transactions(source);

-- Enable Row Level Security (RLS)
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own transactions
CREATE POLICY "Users can view their own transactions" ON public.coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own transactions
CREATE POLICY "Users can insert their own transactions" ON public.coin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for service functions to insert transactions
CREATE POLICY "Service can insert transactions" ON public.coin_transactions
  FOR INSERT WITH CHECK (true);
