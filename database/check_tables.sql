-- Quick check to see if tables exist
-- Run this in Supabase SQL Editor to check table status

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name LIKE '%group%'
ORDER BY table_name;

-- Also check if the functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%group%'
ORDER BY routine_name;
