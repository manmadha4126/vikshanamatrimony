-- Create profile_views table to track who viewed which profile
CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id uuid NOT NULL,
  viewed_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(viewer_id, viewed_profile_id)
);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Users can insert their own views
CREATE POLICY "Users can record their views"
ON public.profile_views
FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Users can see who viewed their profile
CREATE POLICY "Users can see views on their profile"
ON public.profile_views
FOR SELECT
USING (
  auth.uid() = viewer_id OR 
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = viewed_profile_id)
);

-- Add index for faster queries
CREATE INDEX idx_profile_views_viewed_profile ON public.profile_views(viewed_profile_id);
CREATE INDEX idx_profile_views_viewer ON public.profile_views(viewer_id);