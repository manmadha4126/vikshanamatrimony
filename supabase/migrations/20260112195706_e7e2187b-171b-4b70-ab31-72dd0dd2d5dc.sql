-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create a function to notify user when they receive a new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the recipient
  INSERT INTO public.notifications (user_id, type, title, message, related_profile_id)
  SELECT 
    NEW.to_user_id,
    'message',
    'New Message',
    CONCAT('You have a new message from ', p.name),
    p.id
  FROM public.profiles p
  WHERE p.user_id = NEW.from_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Allow system to insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);