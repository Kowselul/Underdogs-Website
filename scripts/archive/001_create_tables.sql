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

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.posts_likes enable row level security;

-- Profiles Policies
create policy "Allow users to view all profiles"
  on public.profiles for select
  using (true);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Allow users to delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Posts Policies
create policy "Allow users to view all posts"
  on public.posts for select
  using (true);

create policy "Allow users to insert their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Allow users to update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Allow users to delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Posts Likes Policies
create policy "Allow users to view all likes"
  on public.posts_likes for select
  using (true);

create policy "Allow users to insert their own likes"
  on public.posts_likes for insert
  with check (auth.uid() = user_id);

create policy "Allow users to delete their own likes"
  on public.posts_likes for delete
  using (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
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
