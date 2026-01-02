-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on verification_requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view their verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create verification requests
CREATE POLICY "Users can create verification requests" 
ON public.verification_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins/Staff can view all verification requests
CREATE POLICY "Staff can view all verification requests" 
ON public.verification_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Admins/Staff can update verification requests
CREATE POLICY "Staff can update verification requests" 
ON public.verification_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Create daily_recommendations table to track daily profile views
CREATE TABLE public.daily_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shown_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_id, shown_date)
);

-- Enable RLS on daily_recommendations
ALTER TABLE public.daily_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own daily recommendations
CREATE POLICY "Users can view their daily recommendations" 
ON public.daily_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own daily recommendations
CREATE POLICY "Users can insert daily recommendations" 
ON public.daily_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add index for efficient queries
CREATE INDEX idx_daily_recommendations_user_date ON public.daily_recommendations(user_id, shown_date);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX idx_verification_requests_profile ON public.verification_requests(profile_id);