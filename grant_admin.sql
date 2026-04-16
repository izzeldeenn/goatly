-- Grant admin access to the current user
-- Run this in Supabase SQL Editor

UPDATE public.users 
SET role = 'admin' 
WHERE account_id = 'user_4f754ffe6660fa41';

-- Verify the update
SELECT account_id, username, email, role FROM public.users 
WHERE account_id = 'user_4f754ffe6660fa41';
