-- Add support for nested comment replies

-- Add parent_comment_id column to allow replies to comments
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- Create index for faster queries on parent_comment_id
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_comment_id);

-- Update the comment view policy to include parent_comment_id
-- (No policy changes needed as we already allow viewing all comments)
