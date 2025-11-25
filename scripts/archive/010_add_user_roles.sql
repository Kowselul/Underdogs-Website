-- Add user roles and admin functionality

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'member', 'head'));

-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update RLS policies to allow admins to update roles
CREATE POLICY "Admins can update user roles"
ON public.profiles FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  )
);

-- Allow users to view all profile data including roles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);
