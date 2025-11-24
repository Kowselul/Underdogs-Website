-- Additional helper functions and views for the Underdogs platform

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

-- Create a view for posts with user information
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
