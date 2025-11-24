-- Run this complete setup script in Supabase SQL Editor
-- This combines all setup steps into one script

-- ========================================
-- STEP 1: Create Tables
-- ========================================

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  bio text,
  avatar_url text,
  involio_profile_url text,
  twitter_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~* '^[a-zA-Z0-9_]+$')
);

-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  likes_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create posts_likes table for tracking likes
create table if not exists public.posts_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

-- ========================================
-- STEP 2: Enable Row Level Security
-- ========================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.posts_likes enable row level security;

-- ========================================
-- STEP 3: Create Policies
-- ========================================

-- Profiles Policies
drop policy if exists "Allow users to view all profiles" on public.profiles;
create policy "Allow users to view all profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Allow users to update their own profile" on public.profiles;
create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Allow users to insert their own profile" on public.profiles;
create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Allow users to delete their own profile" on public.profiles;
create policy "Allow users to delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Posts Policies
drop policy if exists "Allow users to view all posts" on public.posts;
create policy "Allow users to view all posts"
  on public.posts for select
  using (true);

drop policy if exists "Allow users to insert their own posts" on public.posts;
create policy "Allow users to insert their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Allow users to update their own posts" on public.posts;
create policy "Allow users to update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

drop policy if exists "Allow users to delete their own posts" on public.posts;
create policy "Allow users to delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Posts Likes Policies
drop policy if exists "Allow users to view all likes" on public.posts_likes;
create policy "Allow users to view all likes"
  on public.posts_likes for select
  using (true);

drop policy if exists "Allow users to insert their own likes" on public.posts_likes;
create policy "Allow users to insert their own likes"
  on public.posts_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Allow users to delete their own likes" on public.posts_likes;
create policy "Allow users to delete their own likes"
  on public.posts_likes for delete
  using (auth.uid() = user_id);

-- ========================================
-- STEP 4: Create Functions and Triggers
-- ========================================

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update the updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add triggers to auto-update updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

drop trigger if exists update_posts_updated_at on public.posts;
create trigger update_posts_updated_at
  before update on public.posts
  for each row
  execute function public.update_updated_at_column();

-- Function to increment likes count
create or replace function public.increment_post_likes()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.posts
  set likes_count = likes_count + 1
  where id = new.post_id;
  return new;
end;
$$;

-- Function to decrement likes count
create or replace function public.decrement_post_likes()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.posts
  set likes_count = likes_count - 1
  where id = old.post_id;
  return old;
end;
$$;

-- Add triggers for like counting
drop trigger if exists increment_likes_on_insert on public.posts_likes;
create trigger increment_likes_on_insert
  after insert on public.posts_likes
  for each row
  execute function public.increment_post_likes();

drop trigger if exists decrement_likes_on_delete on public.posts_likes;
create trigger decrement_likes_on_delete
  after delete on public.posts_likes
  for each row
  execute function public.decrement_post_likes();

-- ========================================
-- STEP 5: Create Views
-- ========================================

-- View for posts with user information
create or replace view public.posts_with_profiles as
select 
  p.id,
  p.user_id,
  p.content,
  p.likes_count,
  p.created_at,
  p.updated_at,
  pr.username,
  pr.avatar_url
from public.posts p
join public.profiles pr on p.user_id = pr.id
order by p.created_at desc;

-- Grant access to the view
grant select on public.posts_with_profiles to authenticated;
grant select on public.posts_with_profiles to anon;

-- Function to check if a user has liked a post
create or replace function public.user_has_liked_post(post_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1
    from public.posts_likes
    where post_id = post_uuid and user_id = user_uuid
  );
$$;

-- Grant execute permissions
grant execute on function public.user_has_liked_post(uuid, uuid) to authenticated;
grant execute on function public.user_has_liked_post(uuid, uuid) to anon;

-- ========================================
-- Setup Complete!
-- ========================================

-- Verify setup by checking tables
select 
  'Setup complete! Tables created:' as status,
  count(*) as table_count
from information_schema.tables 
where table_schema = 'public' 
  and table_name in ('profiles', 'posts', 'posts_likes');
