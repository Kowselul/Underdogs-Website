-- Make usernames case-insensitive

-- Add a unique constraint on lowercase username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique 
ON profiles (LOWER(username));

-- Drop the old unique constraint if it exists (it might not exist, so we use IF EXISTS)
-- This allows multiple variations of the same username in different cases to be prevented
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Add a check to ensure username is stored in a consistent format (optional, but recommended)
-- This will convert all usernames to lowercase when inserted/updated
-- Alternatively, keep original case but search case-insensitively
