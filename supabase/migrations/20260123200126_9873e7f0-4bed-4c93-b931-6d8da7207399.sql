-- Add family details columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS father_name text,
ADD COLUMN IF NOT EXISTS father_occupation text,
ADD COLUMN IF NOT EXISTS mother_name text,
ADD COLUMN IF NOT EXISTS mother_occupation text,
ADD COLUMN IF NOT EXISTS siblings text,
ADD COLUMN IF NOT EXISTS siblings_details text;