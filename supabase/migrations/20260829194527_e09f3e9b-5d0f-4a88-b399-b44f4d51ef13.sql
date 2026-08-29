ALTER TABLE public.b2b_messages ADD COLUMN IF NOT EXISTS image_paths text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.b2b_messages ALTER COLUMN body DROP NOT NULL;
ALTER TABLE public.b2b_messages ALTER COLUMN body SET DEFAULT '';
UPDATE public.b2b_messages SET body = '' WHERE body IS NULL;

ALTER TABLE public.b2b_inquiries ADD COLUMN IF NOT EXISTS is_kept boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.cleanup_old_b2b_chats()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.b2b_inquiries
  WHERE is_kept = false
    AND updated_at < now() - interval '30 days';
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-old-b2b-chats');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('cleanup-old-b2b-chats', '0 3 * * *', $$SELECT public.cleanup_old_b2b_chats();$$);