-- Add storage policies for staff and admin to upload photos for any user
CREATE POLICY "Staff can upload photos for any profile" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
);

CREATE POLICY "Staff can delete photos for any profile" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'profile-photos' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'staff'::public.app_role)
  )
);

-- Allow users to upload their own photos
CREATE POLICY "Users can upload their own photos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to delete their own photos (compare uuid to uuid)
CREATE POLICY "Users can delete their own photos" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'profile-photos' 
  AND owner_id::uuid = auth.uid()
);

-- Allow public read access for profile photos
CREATE POLICY "Public read access for profile photos" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'profile-photos');