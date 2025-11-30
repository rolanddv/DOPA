-- Create posts table for community publications
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_path text,
  content text NOT NULL,
  badge_emoji text,
  badge_text text,
  badge_category text,
  days_count integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create dopas table (likes system)
CREATE TABLE public.dopas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enrich profiles table with social features
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE,
ADD COLUMN avatar_url text,
ADD COLUMN bio text;

-- Enable RLS on new tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dopas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts
CREATE POLICY "Anyone can view posts"
ON public.posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for dopas
CREATE POLICY "Anyone can view dopas"
ON public.dopas FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create dopas"
ON public.dopas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dopas"
ON public.dopas FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dopas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;