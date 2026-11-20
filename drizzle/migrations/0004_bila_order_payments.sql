CREATE TABLE public.bila_payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
 checkout_token uuid NOT NULL,
 reference text NOT NULL UNIQUE,
 amount numeric(14,2) NOT NULL CHECK (amount > 0),
 currency text NOT NULL DEFAULT 'ZMW' CHECK (currency = 'ZMW'),
 state text NOT NULL DEFAULT 'created' CHECK (state IN ('created','submitting','pending','successful','failed','needs_assistance')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id, checkout_token)
);
GRANT SELECT ON public.bila_payments TO authenticated;
GRANT ALL ON public.bila_payments TO service_role;
ALTER TABLE public.bila_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers read own Bila payments" ON public.bila_payments AS PERMISSIVE FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read Bila payments" ON public.bila_payments AS PERMISSIVE FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.prepare_bila_checkout(p_items jsonb, p_address text, p_checkout_token uuid, p_promo_code_id uuid DEFAULT NULL)
RETURNS public.bila_payments
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
 uid uuid := auth.uid(); prior public.bila_payments; payment public.bila_payments;
 entry record; product public.products; promo public.promo_codes;
 order_id uuid := gen_random_uuid(); unit_price numeric; pct numeric; line_total numeric;
 subtotal numeric := 0; promo_discount numeric := 0; eligible_subtotal numeric := 0;
 total numeric; line_items jsonb := '[]'::jsonb; no_previous_orders boolean;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF p_checkout_token IS NULL THEN RAISE EXCEPTION 'Checkout reference required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text || p_checkout_token::text,0));
 SELECT * INTO prior FROM public.bila_payments WHERE user_id=uid AND checkout_token=p_checkout_token;
 IF FOUND THEN RETURN prior; END IF;
 IF p_address IS NULL OR length(trim(p_address)) < 1 OR length(p_address) > 2000 THEN RAISE EXCEPTION 'Enter a valid shipping address'; END IF;
 IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Choose between 1 and 100 products'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) x WHERE jsonb_typeof(x->'quantity') <> 'number' OR (x->>'quantity') !~ '^[0-9]+$' OR (x->>'quantity')::numeric NOT BETWEEN 1 AND 10000 OR x->>'product_id' IS NULL) THEN RAISE EXCEPTION 'Invalid product quantity'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) x GROUP BY x->>'product_id' HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate products are not allowed'; END IF;
 SELECT NOT EXISTS(SELECT 1 FROM public.orders WHERE user_id=uid AND status <> 'cancelled') INTO no_previous_orders;
 IF p_promo_code_id IS NOT NULL THEN
  SELECT * INTO promo FROM public.promo_codes WHERE id=p_promo_code_id FOR UPDATE;
  IF NOT FOUND OR NOT promo.is_active OR (promo.expires_at IS NOT NULL AND promo.expires_at < now()) OR (promo.usage_limit IS NOT NULL AND promo.usage_count >= promo.usage_limit) THEN RAISE EXCEPTION 'Promo code is no longer available'; END IF;
 END IF;
 FOR entry IN SELECT (x->>'product_id')::uuid AS product_id, (x->>'quantity')::int AS quantity FROM jsonb_array_elements(p_items) x ORDER BY x->>'product_id' LOOP
  SELECT * INTO product FROM public.products WHERE id=entry.product_id FOR SHARE;
  IF NOT FOUND OR NOT product.is_active OR product.is_group_buy THEN RAISE EXCEPTION 'Product is unavailable for regular checkout'; END IF;
  IF product.stock_quantity < entry.quantity THEN RAISE EXCEPTION 'Insufficient stock for %', product.name; END IF;
  unit_price := round(product.price,2);
  SELECT max(least(100,greatest(0,d.value))) INTO pct FROM public.discounts d
   WHERE d.is_active AND (d.start_date IS NULL OR d.start_date<=now()) AND (d.end_date IS NULL OR d.end_date>=now())
   AND (d.type <> 'bulk' OR entry.quantity >= coalesce(d.min_quantity,1))
   AND (d.type <> 'first_order' OR no_previous_orders)
   AND (NOT EXISTS(SELECT 1 FROM public.discount_products dp WHERE dp.discount_id=d.id)
    OR EXISTS(SELECT 1 FROM public.discount_products dp WHERE dp.discount_id=d.id AND (dp.product_id=product.id OR dp.category_id=product.category_id)));
  unit_price := round(greatest(0,unit_price*(1-coalesce(pct,0)/100)),2);
  line_total := unit_price*entry.quantity;
  subtotal := subtotal+line_total;
  IF p_promo_code_id IS NOT NULL AND (NOT EXISTS(SELECT 1 FROM public.promo_code_products pc WHERE pc.promo_code_id=p_promo_code_id)
   OR EXISTS(SELECT 1 FROM public.promo_code_products pc WHERE pc.promo_code_id=p_promo_code_id AND (pc.product_id=product.id OR pc.category_id=product.category_id))) THEN
   eligible_subtotal := eligible_subtotal+line_total;
  END IF;
  line_items := line_items || jsonb_build_array(jsonb_build_object('product_id',product.id,'quantity',entry.quantity,'unit_price',unit_price));
 END LOOP;
 IF p_promo_code_id IS NOT NULL THEN
  IF promo.type='percentage' THEN promo_discount := round(eligible_subtotal*least(100,greatest(0,promo.value))/100,2);
  ELSIF promo.type='fixed_amount' THEN promo_discount := least(eligible_subtotal,greatest(0,promo.value)); END IF;
 END IF;
 total := round(subtotal-promo_discount,2);
 IF total<=0 THEN RAISE EXCEPTION 'Bila requires a positive payment amount; use manual checkout for this order'; END IF;
 INSERT INTO public.orders(id,user_id,subtotal,discount_amount,total,promo_code_id,shipping_address,status)
 VALUES(order_id,uid,subtotal,promo_discount,total,p_promo_code_id,trim(p_address),'pending');
 INSERT INTO public.order_items(order_id,product_id,quantity,unit_price,discount_amount)
 SELECT order_id,(x->>'product_id')::uuid,(x->>'quantity')::int,(x->>'unit_price')::numeric,0 FROM jsonb_array_elements(line_items) x;
 INSERT INTO public.bila_payments(user_id,order_id,checkout_token,reference,amount)
 VALUES(uid,order_id,p_checkout_token,'dl-'||order_id::text,total) RETURNING * INTO payment;
 IF p_promo_code_id IS NOT NULL THEN UPDATE public.promo_codes SET usage_count=usage_count+1 WHERE id=p_promo_code_id; END IF;
 RETURN payment;
END;
$$;
REVOKE ALL ON FUNCTION public.prepare_bila_checkout(jsonb,text,uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.prepare_bila_checkout(jsonb,text,uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_bila_payment(p_payment_id uuid,p_reference text,p_amount numeric,p_currency text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pay public.bila_payments; ord public.orders; settings public.rewards_settings; points_earned integer;
BEGIN
 SELECT * INTO pay FROM public.bila_payments WHERE id=p_payment_id FOR UPDATE;
 IF NOT FOUND OR pay.reference<>p_reference OR pay.amount<>p_amount OR p_currency<>'ZMW' THEN RAISE EXCEPTION 'Payment verification mismatch'; END IF;
 IF pay.state='successful' THEN RETURN; END IF;
 IF pay.state NOT IN ('submitting','pending','needs_assistance') THEN RAISE EXCEPTION 'Payment was not submitted'; END IF;
 SELECT * INTO ord FROM public.orders WHERE id=pay.order_id FOR UPDATE;
 IF NOT FOUND OR ord.user_id<>pay.user_id OR ord.total<>pay.amount THEN RAISE EXCEPTION 'Order verification mismatch'; END IF;
 UPDATE public.bila_payments SET state='successful',updated_at=now() WHERE id=pay.id;
 UPDATE public.orders SET status=CASE WHEN status='pending' THEN 'confirmed'::public.order_status ELSE status END,updated_at=now() WHERE id=pay.order_id;
 SELECT * INTO settings FROM public.rewards_settings LIMIT 1;
 IF settings.is_enabled THEN
  points_earned := floor(pay.amount*greatest(0,coalesce(settings.points_per_currency,0)));
  IF points_earned>0 AND NOT EXISTS(SELECT 1 FROM public.reward_transactions WHERE order_id=pay.order_id AND reason='order_earned') THEN
   INSERT INTO public.reward_transactions(user_id,points,reason,order_id) VALUES(pay.user_id,points_earned,'order_earned',pay.order_id);
  END IF;
 END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.complete_bila_payment(uuid,text,numeric,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.complete_bila_payment(uuid,text,numeric,text) TO service_role;