DROP POLICY IF EXISTS "Campaigns are publicly readable" ON public.promo_campaigns;
CREATE POLICY "Active campaigns are publicly readable" ON public.promo_campaigns FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Carousel slides are publicly readable" ON public.carousel_slides;
CREATE POLICY "Active carousel slides are publicly readable" ON public.carousel_slides FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Discounts are publicly readable" ON public.discounts;
CREATE POLICY "Active discounts are publicly readable" ON public.discounts FOR SELECT USING (is_active OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Discount products are publicly readable" ON public.discount_products;
CREATE POLICY "Active discount products are publicly readable" ON public.discount_products FOR SELECT USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.discounts d WHERE d.id = discount_id AND d.is_active));

DROP POLICY IF EXISTS "Promo codes are publicly readable" ON public.promo_codes;
CREATE POLICY "Signed-in users can read active promo codes" ON public.promo_codes FOR SELECT TO authenticated USING (is_active OR influencer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Promo code products are publicly readable" ON public.promo_code_products;
CREATE POLICY "Signed-in users can read active promo code products" ON public.promo_code_products FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.promo_codes p WHERE p.id = promo_code_id AND (p.is_active OR p.influencer_id = auth.uid())));

DROP POLICY IF EXISTS "Rewards settings are publicly readable" ON public.rewards_settings;
CREATE POLICY "Enabled rewards settings are publicly readable" ON public.rewards_settings FOR SELECT USING (is_enabled OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Price tiers are viewable by everyone" ON public.product_price_tiers;
CREATE POLICY "Price tiers of active products are publicly readable" ON public.product_price_tiers FOR SELECT USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.products pr WHERE pr.id = product_id AND pr.is_active));