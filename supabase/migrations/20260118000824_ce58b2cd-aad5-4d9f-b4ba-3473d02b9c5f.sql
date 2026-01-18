-- Create callback_requests table
CREATE TABLE public.callback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  profile_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own callback requests"
ON public.callback_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create callback requests"
ON public.callback_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can view all callback requests"
ON public.callback_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can update callback requests"
ON public.callback_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff can delete callback requests"
ON public.callback_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_callback_requests_updated_at
BEFORE UPDATE ON public.callback_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_profiles_updated_at();