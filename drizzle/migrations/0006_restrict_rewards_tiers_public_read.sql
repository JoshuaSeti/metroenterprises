DROP POLICY IF EXISTS "Rewards tiers are publicly readable" ON public.rewards_tiers;

CREATE POLICY "Active rewards tiers are publicly readable"
ON public.rewards_tiers
FOR SELECT
TO anon, authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role));