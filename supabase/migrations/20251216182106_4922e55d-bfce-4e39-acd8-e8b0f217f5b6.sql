-- Add profile_id column for custom user IDs
ALTER TABLE public.profiles 
ADD COLUMN profile_id text UNIQUE;

-- Create a function to generate the next profile ID based on gender
CREATE OR REPLACE FUNCTION public.generate_profile_id(p_gender text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix text;
  max_num integer;
  new_id text;
BEGIN
  -- Determine prefix based on gender
  IF lower(p_gender) = 'male' THEN
    prefix := 'M';
  ELSIF lower(p_gender) = 'female' THEN
    prefix := 'F';
  ELSE
    prefix := 'O'; -- Other
  END IF;
  
  -- Get the maximum number for this prefix
  SELECT COALESCE(MAX(CAST(SUBSTRING(profile_id FROM 2) AS integer)), 0)
  INTO max_num
  FROM public.profiles
  WHERE profile_id LIKE prefix || '%';
  
  -- Generate new ID with 6 digits padding
  new_id := prefix || LPAD((max_num + 1)::text, 6, '0');
  
  RETURN new_id;
END;
$$;

-- Create a trigger to auto-generate profile_id on insert
CREATE OR REPLACE FUNCTION public.set_profile_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.profile_id IS NULL THEN
    NEW.profile_id := public.generate_profile_id(NEW.gender);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_profile_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profile_id();