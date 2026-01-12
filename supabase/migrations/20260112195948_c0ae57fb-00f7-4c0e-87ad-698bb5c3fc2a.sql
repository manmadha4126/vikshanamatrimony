-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger for interest received notification
CREATE OR REPLACE FUNCTION public.notify_interest_received()
RETURNS TRIGGER AS $$
DECLARE
  sender_profile profiles%ROWTYPE;
  receiver_profile profiles%ROWTYPE;
BEGIN
  -- Get sender profile
  SELECT * INTO sender_profile FROM public.profiles WHERE user_id = NEW.from_user_id;
  
  -- Get receiver profile to get their user_id
  SELECT * INTO receiver_profile FROM public.profiles WHERE id = NEW.to_profile_id;
  
  IF receiver_profile.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_profile_id)
    VALUES (
      receiver_profile.user_id,
      'interest_received',
      'New Interest Received',
      CONCAT(sender_profile.name, ' has shown interest in your profile'),
      sender_profile.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for interest accepted notification
CREATE OR REPLACE FUNCTION public.notify_interest_accepted()
RETURNS TRIGGER AS $$
DECLARE
  receiver_profile profiles%ROWTYPE;
  sender_name text;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Get the profile that sent the interest to notify them
    SELECT * INTO receiver_profile FROM public.profiles WHERE id = NEW.to_profile_id;
    
    -- Notify the person who sent the interest
    INSERT INTO public.notifications (user_id, type, title, message, related_profile_id)
    VALUES (
      NEW.from_user_id,
      'interest_accepted',
      'Interest Accepted!',
      CONCAT(receiver_profile.name, ' has accepted your interest. You can now message them!'),
      receiver_profile.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for prime subscription notification
CREATE OR REPLACE FUNCTION public.notify_prime_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.user_id,
      'prime_upgrade',
      'Welcome to Prime!',
      CONCAT('Your ', NEW.plan_name, ' subscription is now active. Enjoy premium features!')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for profile view notification
CREATE OR REPLACE FUNCTION public.notify_profile_view()
RETURNS TRIGGER AS $$
DECLARE
  viewer_profile profiles%ROWTYPE;
  viewed_profile profiles%ROWTYPE;
BEGIN
  -- Get viewer profile
  SELECT * INTO viewer_profile FROM public.profiles WHERE user_id = NEW.viewer_id;
  
  -- Get viewed profile to get their user_id
  SELECT * INTO viewed_profile FROM public.profiles WHERE id = NEW.viewed_profile_id;
  
  IF viewed_profile.user_id IS NOT NULL AND viewer_profile.id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_profile_id)
    VALUES (
      viewed_profile.user_id,
      'profile_view',
      'Profile Viewed',
      CONCAT(viewer_profile.name, ' viewed your profile'),
      viewer_profile.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing triggers if they exist and recreate
DROP TRIGGER IF EXISTS on_interest_received ON public.interests;
CREATE TRIGGER on_interest_received
  AFTER INSERT ON public.interests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_interest_received();

DROP TRIGGER IF EXISTS on_interest_accepted ON public.interests;
CREATE TRIGGER on_interest_accepted
  AFTER UPDATE ON public.interests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_interest_accepted();

DROP TRIGGER IF EXISTS on_prime_subscription ON public.prime_subscriptions;
CREATE TRIGGER on_prime_subscription
  AFTER INSERT OR UPDATE ON public.prime_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_prime_subscription();

DROP TRIGGER IF EXISTS on_profile_view ON public.profile_views;
CREATE TRIGGER on_profile_view
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_profile_view();