-- Add foreign key relationships from posts and comments to profiles
-- This allows us to properly join these tables in queries

-- First, ensure all user_ids in posts exist in profiles
-- (they should from the handle_new_user trigger)

-- Add foreign key from posts to profiles
ALTER TABLE public.posts 
DROP CONSTRAINT IF EXISTS posts_user_id_fkey,
ADD CONSTRAINT posts_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from comments to profiles
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_user_id_fkey,
ADD CONSTRAINT comments_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from dopas to profiles
ALTER TABLE public.dopas 
DROP CONSTRAINT IF EXISTS dopas_user_id_fkey,
ADD CONSTRAINT dopas_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;