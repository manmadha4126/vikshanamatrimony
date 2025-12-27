-- Drop the existing SELECT policy and create a new one that allows email-based access for profile linking
DROP POLICY IF EXISTS "Authenticated users can view completed profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view completed profiles or own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    is_complete = true OR 
    auth.uid() = user_id OR 
    (user_id IS NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid())) OR
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'staff'::app_role)
  )
);