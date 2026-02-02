-- Create a secure function to get email by phone number for login purposes
-- This bypasses RLS since it uses SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_email text;
  normalized_phone text;
BEGIN
  -- Normalize the input phone number
  normalized_phone := regexp_replace(p_phone, '[\s\-]', '', 'g');
  
  -- Try to find the email with various phone formats
  SELECT email INTO result_email
  FROM public.profiles
  WHERE phone = normalized_phone
     OR phone = '+91' || normalized_phone
     OR phone = regexp_replace(normalized_phone, '^\+91', '')
     OR phone = p_phone
  LIMIT 1;
  
  RETURN result_email;
END;
$$;