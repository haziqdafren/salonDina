-- Fix RLS policies for Feedback table to allow public inserts
-- This will make the feedback system work with the database instead of fallback mode

-- First, let's check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'Feedback';

-- Disable RLS temporarily to allow inserts
ALTER TABLE "Feedback" DISABLE ROW LEVEL SECURITY;

-- Or create a permissive policy that allows all operations
-- (Alternative approach - uncomment if needed)
-- DROP POLICY IF EXISTS "Allow all operations on Feedback" ON "Feedback";
-- CREATE POLICY "Allow all operations on Feedback" ON "Feedback"
--   FOR ALL USING (true) WITH CHECK (true);

-- Verify the change
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'Feedback';

-- Test insert to make sure it works
-- INSERT INTO "Feedback" (customerName, customerPhone, overallRating, comment, isAnonymous)
-- VALUES ('Test User', '081234567890', 5, 'Test feedback from SQL fix', false);

-- Check if the insert worked
-- SELECT * FROM "Feedback" ORDER BY "createdAt" DESC LIMIT 5;
