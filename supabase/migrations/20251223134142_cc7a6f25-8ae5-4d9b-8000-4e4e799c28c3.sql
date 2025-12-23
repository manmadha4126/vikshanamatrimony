-- Drop the existing policy first
DROP POLICY IF EXISTS "Anyone can insert profile during registration" ON public.profiles;

-- Grant INSERT permission to anon role
GRANT INSERT ON public.profiles TO anon;

-- Create a proper permissive INSERT policy for anon users
CREATE POLICY "Allow anonymous insert during registration"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (true);