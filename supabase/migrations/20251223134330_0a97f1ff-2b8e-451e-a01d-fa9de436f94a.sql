-- Grant INSERT to both anon and authenticated roles
GRANT INSERT ON public.profiles TO anon, authenticated;

-- Also add policy for authenticated users during registration
CREATE POLICY "Allow authenticated insert during registration"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);