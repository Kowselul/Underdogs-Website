-- Add likes support for comments

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for comment_likes
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Add likes_count to comments table
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Function to increment comment likes
CREATE OR REPLACE FUNCTION public.increment_comment_likes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.comments
  SET likes_count = likes_count + 1
  WHERE id = new.comment_id;
  RETURN new;
END;
$$;

-- Function to decrement comment likes
CREATE OR REPLACE FUNCTION public.decrement_comment_likes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.comments
  SET likes_count = likes_count - 1
  WHERE id = old.comment_id;
  RETURN old;
END;
$$;

-- Triggers for comment like counting
DROP TRIGGER IF EXISTS increment_comment_likes_on_insert ON public.comment_likes;
CREATE TRIGGER increment_comment_likes_on_insert
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_comment_likes();

DROP TRIGGER IF EXISTS decrement_comment_likes_on_delete ON public.comment_likes;
CREATE TRIGGER decrement_comment_likes_on_delete
  AFTER DELETE ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_comment_likes();
