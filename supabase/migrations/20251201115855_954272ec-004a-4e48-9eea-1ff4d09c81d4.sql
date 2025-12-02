-- Allow everyone to view profiles (needed for social feed)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
USING (true);