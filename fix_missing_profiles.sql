-- Run this to check if you have users without profiles and fix them

-- Check for users without profiles
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'username' as username,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

-- Create missing profiles for existing users
INSERT INTO public.profiles (id, username, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify profiles were created
SELECT 
  'Profiles created!' as status,
  COUNT(*) as total_profiles
FROM public.profiles;
