ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shipping_time text,
  ADD COLUMN IF NOT EXISTS is_group_buy boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_buy_min_quantity integer NOT NULL DEFAULT 10;

CREATE TABLE IF NOT EXISTS public.product_price_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_price_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_price_tiers TO authenticated;
GRANT ALL ON public.product_price_tiers TO service_role;

ALTER TABLE public.product_price_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price tiers are viewable by everyone"
  ON public.product_price_tiers FOR SELECT USING (true);

CREATE POLICY "Admins manage price tiers"
  ON public.product_price_tiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_shipping_time text NOT NULL DEFAULT '2-4 weeks',
  group_buy_default_days integer NOT NULL DEFAULT 14,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store settings are viewable by everyone"
  ON public.store_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage store settings"
  ON public.store_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

INSERT INTO public.store_settings (default_shipping_time) VALUES ('2-4 weeks');

ALTER TABLE public.group_buys
  ALTER COLUMN deadline SET DEFAULT (now() + interval '14 days');

ALTER TABLE public.group_buys
  ADD COLUMN IF NOT EXISTS share_slug text;

CREATE UNIQUE INDEX IF NOT EXISTS group_buys_share_slug_key ON public.group_buys(share_slug);