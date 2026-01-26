-- Add horoscope detail columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS time_of_birth text,
ADD COLUMN IF NOT EXISTS birth_country text,
ADD COLUMN IF NOT EXISTS birth_state text,
ADD COLUMN IF NOT EXISTS birth_city text,
ADD COLUMN IF NOT EXISTS chart_style text,
ADD COLUMN IF NOT EXISTS horoscope_language text;