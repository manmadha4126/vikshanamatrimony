-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Anyone can insert profile during registration" ON public.profiles;

-- Create a PERMISSIVE insert policy for registration
CREATE POLICY "Anyone can insert profile during registration"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (true);