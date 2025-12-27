
-- Add new columns to profiles table for completion tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS about_me text,
ADD COLUMN IF NOT EXISTS hobbies text[],
ADD COLUMN IF NOT EXISTS horoscope_url text,
ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_prime boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS prime_expires_at timestamp with time zone;

-- Create partner_preferences table
CREATE TABLE IF NOT EXISTS public.partner_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic preferences
  age_from integer DEFAULT 22,
  age_to integer DEFAULT 35,
  height_from text DEFAULT '5''0" (152 cm)',
  height_to text DEFAULT '6''0" (183 cm)',
  marital_status text[] DEFAULT ARRAY['Never Married'],
  mother_tongue text[],
  physical_status text DEFAULT 'Normal',
  eating_habits text[] DEFAULT ARRAY['Vegetarian', 'Non-Vegetarian'],
  drinking_habits text DEFAULT 'Never drinks',
  smoking_habits text DEFAULT 'Never smokes',
  
  -- Religious preferences
  religion text[] DEFAULT ARRAY['Hindu'],
  caste text[] DEFAULT ARRAY['Any'],
  dosham text DEFAULT 'Doesn''t matter',
  star text[] DEFAULT ARRAY['Any'],
  
  -- Professional preferences
  education text[],
  employed_in text DEFAULT 'Any',
  occupation text DEFAULT 'Any',
  annual_income text DEFAULT 'Any',
  
  -- Location preferences
  country text[] DEFAULT ARRAY['India'],
  residing_state text[],
  
  -- Compulsory flag
  is_compulsory boolean DEFAULT false,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create interests table (for expressing interest in profiles)
CREATE TABLE IF NOT EXISTS public.interests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(from_user_id, to_profile_id)
);

-- Create shortlisted_profiles table
CREATE TABLE IF NOT EXISTS public.shortlisted_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, profile_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  related_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.partner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlisted_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_preferences
CREATE POLICY "Users can view their own preferences"
ON public.partner_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.partner_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.partner_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for interests
CREATE POLICY "Users can view interests they sent or received"
ON public.interests FOR SELECT
USING (
  auth.uid() = from_user_id OR 
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = to_profile_id)
);

CREATE POLICY "Users can send interests"
ON public.interests FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update interests they received"
ON public.interests FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = to_profile_id));

-- RLS Policies for shortlisted_profiles
CREATE POLICY "Users can view their shortlisted profiles"
ON public.shortlisted_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can shortlist profiles"
ON public.shortlisted_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from shortlist"
ON public.shortlisted_profiles FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update messages they received"
ON public.messages FOR UPDATE
USING (auth.uid() = to_user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Policy to allow authenticated users to view other profiles (for matching)
CREATE POLICY "Authenticated users can view completed profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  (is_complete = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
);

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(p_profile_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_fields integer := 25;
  filled_fields integer := 0;
  profile_record public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = p_profile_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Check each field
  IF profile_record.name IS NOT NULL AND profile_record.name != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.email IS NOT NULL AND profile_record.email != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.gender IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.date_of_birth IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.height IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.marital_status IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.mother_tongue IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.religion IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.caste IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.education IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.employment_type IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.occupation IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.annual_income IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.country IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.state IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.city IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.photo_url IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.about_me IS NOT NULL AND profile_record.about_me != '' THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.hobbies IS NOT NULL AND array_length(profile_record.hobbies, 1) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.horoscope_url IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.phone_verified = true THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.email_verified = true THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.star IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF profile_record.gothram IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  
  RETURN ROUND((filled_fields::numeric / total_fields::numeric) * 100);
END;
$$;

-- Trigger to update profile completion percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_profile_completion
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_completion();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partner_preferences_user_id ON public.partner_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_interests_from_user ON public.interests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_interests_to_profile ON public.interests(to_profile_id);
CREATE INDEX IF NOT EXISTS idx_shortlisted_user ON public.shortlisted_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON public.messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON public.messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

-- Create storage bucket for horoscopes
INSERT INTO storage.buckets (id, name, public)
VALUES ('horoscopes', 'horoscopes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for horoscopes
CREATE POLICY "Users can upload their own horoscope"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'horoscopes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own horoscope"
ON storage.objects FOR SELECT
USING (bucket_id = 'horoscopes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own horoscope"
ON storage.objects FOR UPDATE
USING (bucket_id = 'horoscopes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own horoscope"
ON storage.objects FOR DELETE
USING (bucket_id = 'horoscopes' AND auth.uid()::text = (storage.foldername(name))[1]);
