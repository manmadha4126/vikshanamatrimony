-- Simplify profile access - allow users to view profiles by email match
DROP POLICY IF EXISTS "Authenticated users can view completed profiles or own profile" ON public.profiles;

CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if user is authenticated and either:
  -- 1. Profile is complete (public profiles)
  -- 2. Email matches the logged-in user's email (own profile)
  -- 3. User is admin or staff
  auth.uid() IS NOT NULL AND (
    is_complete = true OR 
    email = auth.email() OR
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'staff'::app_role)
  )
);