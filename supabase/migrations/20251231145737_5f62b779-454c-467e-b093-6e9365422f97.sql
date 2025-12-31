-- Drop the problematic UPDATE policy that queries auth.users
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a new UPDATE policy that doesn't query auth.users directly
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  ((user_id IS NULL) AND (email = auth.email()))
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  ((user_id IS NULL) AND (email = auth.email()))
);