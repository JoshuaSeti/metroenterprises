CREATE TABLE public.group_buys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  unit_price numeric NOT NULL DEFAULT 0,
  min_quantity integer NOT NULL DEFAULT 1,
  committed_quantity integer NOT NULL DEFAULT 0,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'open',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_buys TO authenticated;
GRANT SELECT ON public.group_buys TO anon;
GRANT ALL ON public.group_buys TO service_role;

ALTER TABLE public.group_buys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published group buys"
  ON public.group_buys FOR SELECT TO anon, authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create group buys"
  ON public.group_buys FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creators and admins can update group buys"
  ON public.group_buys FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators and admins can delete group buys"
  ON public.group_buys FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_group_buys_updated_at
  BEFORE UPDATE ON public.group_buys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.group_buy_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_buy_id uuid NOT NULL REFERENCES public.group_buys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_buy_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_buy_participants TO authenticated;
GRANT ALL ON public.group_buy_participants TO service_role;

ALTER TABLE public.group_buy_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own participation, admins view all"
  ON public.group_buy_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can join group buys"
  ON public.group_buy_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own participation"
  ON public.group_buy_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users and admins can remove participation"
  ON public.group_buy_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.sync_group_buy_committed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gb_id uuid;
BEGIN
  gb_id := COALESCE(NEW.group_buy_id, OLD.group_buy_id);
  UPDATE public.group_buys g
  SET committed_quantity = COALESCE((
    SELECT SUM(p.quantity) FROM public.group_buy_participants p WHERE p.group_buy_id = gb_id
  ), 0)
  WHERE g.id = gb_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_group_buy_committed_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.group_buy_participants
  FOR EACH ROW EXECUTE FUNCTION public.sync_group_buy_committed();