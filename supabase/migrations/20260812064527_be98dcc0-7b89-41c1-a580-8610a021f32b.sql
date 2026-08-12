CREATE TABLE public.rewards_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT true,
  program_name text NOT NULL DEFAULT 'Direct Rewards',
  points_per_currency numeric NOT NULL DEFAULT 1,
  points_per_currency_redeem numeric NOT NULL DEFAULT 100,
  min_redeem_points integer NOT NULL DEFAULT 500,
  signup_bonus_points integer NOT NULL DEFAULT 0,
  terms text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rewards_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rewards_settings TO authenticated;
GRANT ALL ON public.rewards_settings TO service_role;
ALTER TABLE public.rewards_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rewards settings are publicly readable" ON public.rewards_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage rewards settings" ON public.rewards_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_rewards_settings_updated_at BEFORE UPDATE ON public.rewards_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.rewards_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_points integer NOT NULL DEFAULT 0,
  multiplier numeric NOT NULL DEFAULT 1,
  perks text,
  color text NOT NULL DEFAULT '#2B5E4A',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rewards_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rewards_tiers TO authenticated;
GRANT ALL ON public.rewards_tiers TO service_role;
ALTER TABLE public.rewards_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rewards tiers are publicly readable" ON public.rewards_tiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage rewards tiers" ON public.rewards_tiers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_rewards_tiers_updated_at BEFORE UPDATE ON public.rewards_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL DEFAULT 'manual_adjustment',
  note text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reward_transactions TO authenticated;
GRANT ALL ON public.reward_transactions TO service_role;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reward transactions" ON public.reward_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage reward transactions" ON public.reward_transactions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE INDEX reward_transactions_user_id_idx ON public.reward_transactions(user_id);

INSERT INTO public.rewards_settings (is_enabled, program_name) VALUES (true, 'Direct Rewards');
INSERT INTO public.rewards_tiers (name, min_points, multiplier, perks, color, sort_order) VALUES
  ('Bronze', 0, 1, 'Earn points on every order', '#8C6239', 1),
  ('Silver', 1000, 1.25, '25% bonus points and early access to promos', '#8A8A8A', 2),
  ('Gold', 5000, 1.5, '50% bonus points, free shipping and priority support', '#B8912F', 3);