-- Add residing_city column to partner_preferences table
ALTER TABLE public.partner_preferences 
ADD COLUMN IF NOT EXISTS residing_city text[] DEFAULT NULL;