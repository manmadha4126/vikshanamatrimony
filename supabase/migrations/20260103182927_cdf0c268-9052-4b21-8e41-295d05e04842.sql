-- Create prime_subscriptions table
CREATE TABLE public.prime_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'support_1m', 'support_3m', 'support_6m', 'affluent_3m', 'affluent_6m', 'affluent_1y', 'till_marry'
  plan_name TEXT NOT NULL,
  plan_category TEXT NOT NULL, -- 'support', 'affluent', 'till_marry'
  amount INTEGER NOT NULL,
  validity_months INTEGER, -- NULL for till_marry
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'expired', 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prime_call_logs table
CREATE TABLE public.prime_call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  selected_package TEXT, -- NULL for assistance calls
  call_type TEXT NOT NULL, -- 'prime_subscription', 'assistance'
  call_status TEXT NOT NULL DEFAULT 'initiated', -- 'initiated', 'completed'
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prime_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prime_call_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for prime_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.prime_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON public.prime_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.prime_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all subscriptions"
ON public.prime_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can manage all subscriptions"
ON public.prime_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- RLS policies for prime_call_logs
CREATE POLICY "Users can view their own call logs"
ON public.prime_call_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own call logs"
ON public.prime_call_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all call logs"
ON public.prime_call_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

CREATE POLICY "Staff can manage all call logs"
ON public.prime_call_logs
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'staff'));

-- Create indexes
CREATE INDEX idx_prime_subscriptions_user_id ON public.prime_subscriptions(user_id);
CREATE INDEX idx_prime_subscriptions_status ON public.prime_subscriptions(status);
CREATE INDEX idx_prime_call_logs_user_id ON public.prime_call_logs(user_id);
CREATE INDEX idx_prime_call_logs_call_type ON public.prime_call_logs(call_type);