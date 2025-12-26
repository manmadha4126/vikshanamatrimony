-- Add verification_status column to profiles table
-- Values: 'pending', 'verified', 'rejected'
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Add admin_notes column for storing verification notes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Update existing profiles: set verified status based on email_verified
UPDATE public.profiles 
SET verification_status = CASE 
  WHEN email_verified = true THEN 'verified'
  ELSE 'pending'
END
WHERE verification_status IS NULL OR verification_status = 'pending';