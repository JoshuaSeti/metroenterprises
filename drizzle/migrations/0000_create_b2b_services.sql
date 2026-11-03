CREATE TABLE public.b2b_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.b2b_services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2b_services TO authenticated;
GRANT ALL ON public.b2b_services TO service_role;
ALTER TABLE public.b2b_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active services" ON public.b2b_services FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage services" ON public.b2b_services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER b2b_services_updated_at BEFORE UPDATE ON public.b2b_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();