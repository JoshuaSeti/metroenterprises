
-- Drop ALL existing restrictive policies and recreate as PERMISSIVE

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- products
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- categories
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Influencers can view orders with their codes" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Influencers can view orders with their codes" ON public.orders FOR SELECT TO authenticated USING (promo_code_id IN (SELECT id FROM promo_codes WHERE influencer_id = auth.uid()));

-- order_items
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage all order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- wishlists
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can remove from own wishlist" ON public.wishlists;
CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own wishlist" ON public.wishlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from own wishlist" ON public.wishlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- support_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- discounts
DROP POLICY IF EXISTS "Discounts are publicly readable" ON public.discounts;
DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
CREATE POLICY "Discounts are publicly readable" ON public.discounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage discounts" ON public.discounts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- discount_products
DROP POLICY IF EXISTS "Discount products are publicly readable" ON public.discount_products;
DROP POLICY IF EXISTS "Admins can manage discount products" ON public.discount_products;
CREATE POLICY "Discount products are publicly readable" ON public.discount_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage discount products" ON public.discount_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- promo_codes
DROP POLICY IF EXISTS "Promo codes are publicly readable" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Influencers can view own codes" ON public.promo_codes;
CREATE POLICY "Promo codes are publicly readable" ON public.promo_codes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Influencers can view own codes" ON public.promo_codes FOR SELECT TO authenticated USING (auth.uid() = influencer_id);

-- promo_code_products
DROP POLICY IF EXISTS "Promo code products are publicly readable" ON public.promo_code_products;
DROP POLICY IF EXISTS "Admins can manage promo code products" ON public.promo_code_products;
CREATE POLICY "Promo code products are publicly readable" ON public.promo_code_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage promo code products" ON public.promo_code_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- promo_campaigns
DROP POLICY IF EXISTS "Campaigns are publicly readable" ON public.promo_campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.promo_campaigns;
CREATE POLICY "Campaigns are publicly readable" ON public.promo_campaigns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage campaigns" ON public.promo_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- campaign_products
DROP POLICY IF EXISTS "Campaign products are publicly readable" ON public.campaign_products;
DROP POLICY IF EXISTS "Admins can manage campaign products" ON public.campaign_products;
CREATE POLICY "Campaign products are publicly readable" ON public.campaign_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage campaign products" ON public.campaign_products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- carousel_slides
DROP POLICY IF EXISTS "Carousel slides are publicly readable" ON public.carousel_slides;
DROP POLICY IF EXISTS "Admins can manage carousel slides" ON public.carousel_slides;
CREATE POLICY "Carousel slides are publicly readable" ON public.carousel_slides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage carousel slides" ON public.carousel_slides FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create the missing trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
