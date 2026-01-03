-- Drop existing policy and create updated one that handles NULL user_id case
DROP POLICY IF EXISTS "Users can view interests they sent or received" ON public.interests;

-- Create updated policy that also checks email match for profiles with NULL user_id
CREATE POLICY "Users can view interests they sent or received" 
ON public.interests 
FOR SELECT 
USING (
  (auth.uid() = from_user_id) 
  OR (auth.uid() = ( 
    SELECT profiles.user_id 
    FROM profiles 
    WHERE profiles.id = interests.to_profile_id
  ))
  OR (auth.email() = (
    SELECT profiles.email
    FROM profiles
    WHERE profiles.id = interests.to_profile_id
  ))
);

-- Also update the policy for updating interests (accepting/rejecting)
DROP POLICY IF EXISTS "Users can update interests they received" ON public.interests;

CREATE POLICY "Users can update interests they received" 
ON public.interests 
FOR UPDATE 
USING (
  (auth.uid() = ( 
    SELECT profiles.user_id 
    FROM profiles 
    WHERE profiles.id = interests.to_profile_id
  ))
  OR (auth.email() = (
    SELECT profiles.email
    FROM profiles
    WHERE profiles.id = interests.to_profile_id
  ))
);