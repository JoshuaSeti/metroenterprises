CREATE OR REPLACE FUNCTION public.touch_b2b_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.b2b_inquiries SET updated_at = now() WHERE id = NEW.inquiry_id;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.touch_b2b_inquiry() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS touch_b2b_inquiry_trg ON public.b2b_messages;
CREATE TRIGGER touch_b2b_inquiry_trg
AFTER INSERT ON public.b2b_messages
FOR EACH ROW EXECUTE FUNCTION public.touch_b2b_inquiry();