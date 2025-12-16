-- Add profile_for column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_for text;

-- Add policy for staff to view all profiles (for dashboard)
CREATE POLICY "Staff can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));