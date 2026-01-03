-- Create table for storing additional profile photos
CREATE TABLE public.profile_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view profile photos"
ON public.profile_photos FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own photos"
ON public.profile_photos FOR INSERT
WITH CHECK (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own photos"
ON public.profile_photos FOR UPDATE
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own photos"
ON public.profile_photos FOR DELETE
USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Index for faster lookups
CREATE INDEX idx_profile_photos_profile_id ON public.profile_photos(profile_id);