CREATE TYPE public.b2b_status AS ENUM ('open', 'in_progress', 'quoted', 'closed');

CREATE TABLE public.b2b_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  details text,
  quantity integer,
  target_price numeric,
  image_paths text[] NOT NULL DEFAULT '{}',
  status public.b2b_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_inquiries TO authenticated;
GRANT ALL ON public.b2b_inquiries TO service_role;

ALTER TABLE public.b2b_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own inquiries, admins view all"
  ON public.b2b_inquiries FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own inquiries"
  ON public.b2b_inquiries FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users and admins update inquiries"
  ON public.b2b_inquiries FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users and admins delete inquiries"
  ON public.b2b_inquiries FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_b2b_inquiries_updated_at
  BEFORE UPDATE ON public.b2b_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.b2b_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.b2b_inquiries(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.b2b_messages TO authenticated;
GRANT ALL ON public.b2b_messages TO service_role;

ALTER TABLE public.b2b_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants and admins view messages"
  ON public.b2b_messages FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.b2b_inquiries i
      WHERE i.id = b2b_messages.inquiry_id AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants and admins send messages"
  ON public.b2b_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.b2b_inquiries i
        WHERE i.id = b2b_messages.inquiry_id AND i.user_id = auth.uid()
      )
    )
  );

CREATE INDEX idx_b2b_messages_inquiry ON public.b2b_messages(inquiry_id, created_at);