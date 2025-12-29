-- Create success_stories table for couple submissions
CREATE TABLE public.success_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  partner_name text NOT NULL,
  wedding_date date NOT NULL,
  wedding_location text NOT NULL,
  story text NOT NULL,
  photo_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid
);

-- Enable RLS
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Users can submit their own stories
CREATE POLICY "Users can submit their own stories"
ON public.success_stories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view their own stories"
ON public.success_stories
FOR SELECT
USING (auth.uid() = user_id);

-- Everyone can view approved stories
CREATE POLICY "Anyone can view approved stories"
ON public.success_stories
FOR SELECT
USING (status = 'approved');

-- Users can update their pending stories
CREATE POLICY "Users can update their pending stories"
ON public.success_stories
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all stories
CREATE POLICY "Admins can manage all stories"
ON public.success_stories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes
CREATE INDEX idx_success_stories_status ON public.success_stories(status);
CREATE INDEX idx_success_stories_user ON public.success_stories(user_id);