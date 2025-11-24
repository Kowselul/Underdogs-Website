-- Verification script - Run this after setup to check everything works

-- Check if tables exist
SELECT 
  'Tables Check' as test_name,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASSED'
    ELSE '❌ FAILED'
  END as status,
  string_agg(table_name, ', ') as tables_found
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'posts', 'posts_likes');

-- Check if RLS is enabled
SELECT 
  'RLS Security Check' as test_name,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASSED'
    ELSE '❌ FAILED'
  END as status,
  string_agg(tablename, ', ') as tables_with_rls
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'posts', 'posts_likes')
  AND rowsecurity = true;

-- Check if policies exist
SELECT 
  'Policies Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ PASSED'
    ELSE '❌ FAILED - Expected at least 10 policies'
  END as status,
  COUNT(*) as policies_created
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if triggers exist
SELECT 
  'Triggers Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASSED'
    ELSE '❌ FAILED'
  END as status,
  string_agg(tgname, ', ') as triggers_found
FROM pg_trigger 
WHERE tgname IN (
  'on_auth_user_created',
  'update_profiles_updated_at',
  'update_posts_updated_at',
  'increment_likes_on_insert',
  'decrement_likes_on_delete'
);

-- Check if functions exist
SELECT 
  'Functions Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASSED'
    ELSE '❌ FAILED'
  END as status,
  string_agg(proname, ', ') as functions_found
FROM pg_proc 
WHERE proname IN (
  'handle_new_user',
  'update_updated_at_column',
  'increment_post_likes',
  'decrement_post_likes',
  'user_has_liked_post'
)
AND pronamespace = 'public'::regnamespace;

-- Check if view exists
SELECT 
  'Views Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ PASSED'
    ELSE '❌ FAILED'
  END as status,
  string_agg(table_name, ', ') as views_found
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name = 'posts_with_profiles';

-- Summary
SELECT 
  '===================' as separator,
  'SETUP VERIFICATION COMPLETE' as message,
  '===================' as separator2;

-- If all checks passed, you should see ✅ PASSED for each test
-- If any test failed, re-run the complete_setup.sql script
