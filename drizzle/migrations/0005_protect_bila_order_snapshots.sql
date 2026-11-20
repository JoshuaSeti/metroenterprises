CREATE OR REPLACE FUNCTION public.guard_bila_order_snapshot()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pay public.bila_payments;
BEGIN
 IF TG_TABLE_NAME='orders' THEN
  SELECT * INTO pay FROM public.bila_payments WHERE order_id=OLD.id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.total IS DISTINCT FROM OLD.total OR NEW.subtotal IS DISTINCT FROM OLD.subtotal OR NEW.discount_amount IS DISTINCT FROM OLD.discount_amount OR NEW.promo_code_id IS DISTINCT FROM OLD.promo_code_id THEN
   RAISE EXCEPTION 'Bila order financial details cannot be changed';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('confirmed','processing','shipped','delivered') AND pay.state<>'successful' THEN
   RAISE EXCEPTION 'Verify the Bila payment before confirming this order';
  END IF;
  RETURN NEW;
 END IF;
 IF TG_OP IN ('UPDATE','DELETE') AND EXISTS(SELECT 1 FROM public.bila_payments WHERE order_id=OLD.order_id) THEN RAISE EXCEPTION 'Bila order products cannot be changed'; END IF;
 IF TG_OP IN ('UPDATE','INSERT') AND EXISTS(SELECT 1 FROM public.bila_payments WHERE order_id=NEW.order_id) THEN RAISE EXCEPTION 'Bila order products cannot be changed'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_bila_order_finances BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_bila_order_snapshot();
CREATE TRIGGER guard_bila_order_items BEFORE INSERT OR UPDATE OR DELETE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.guard_bila_order_snapshot();