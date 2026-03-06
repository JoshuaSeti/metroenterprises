import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useProducts(categorySlug?: string) {
  return useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("categories.slug", categorySlug);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCarouselSlides() {
  return useQuery({
    queryKey: ["carousel_slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useDiscountsForProduct(productId: string) {
  return useQuery({
    queryKey: ["discounts", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discount_products")
        .select("*, discounts(*)")
        .eq("product_id", productId);
      if (error) throw error;
      return data?.map((dp: any) => dp.discounts).filter(Boolean) || [];
    },
    enabled: !!productId,
  });
}

export function useAllActiveDiscounts() {
  return useQuery({
    queryKey: ["all-active-discounts"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("discounts")
        .select("*, discount_products(product_id, category_id)")
        .eq("is_active", true);
      if (error) throw error;
      // Filter by date in JS to handle nulls
      return (data || []).filter((d) => {
        if (d.start_date && d.start_date > now) return false;
        if (d.end_date && d.end_date < now) return false;
        return true;
      });
    },
  });
}

export function getProductDiscount(
  productId: string,
  categoryId: string | null,
  price: number,
  discounts: any[]
): { finalPrice: number; label: string | null } {
  if (!discounts || discounts.length === 0) return { finalPrice: price, label: null };

  const applicable = discounts.filter((d) =>
    d.discount_products?.some(
      (dp: any) =>
        dp.product_id === productId ||
        (dp.category_id && dp.category_id === categoryId)
    ) || (d.discount_products?.length === 0)
  );

  if (applicable.length === 0) return { finalPrice: price, label: null };

  let bestAmount = 0;
  let bestDiscount: any = null;
  for (const d of applicable) {
    const amount = price * (Number(d.value) / 100);
    if (amount > bestAmount) {
      bestAmount = amount;
      bestDiscount = d;
    }
  }

  if (!bestDiscount || bestAmount <= 0) return { finalPrice: price, label: null };

  const label =
    bestDiscount.type === "percentage" ? `${bestDiscount.value}% OFF` :
    bestDiscount.type === "bulk" ? `${bestDiscount.value}% OFF (${bestDiscount.min_quantity}+)` :
    bestDiscount.type === "first_order" ? `${bestDiscount.value}% OFF First Order` :
    `${bestDiscount.value}% OFF`;

  return { finalPrice: Math.max(0, price - bestAmount), label };
}

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();
      if (error) throw new Error("Invalid promo code");
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("Promo code has expired");
      }
      if (data.usage_limit && data.usage_count >= data.usage_limit) {
        throw new Error("Promo code usage limit reached");
      }
      return data;
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: {
      subtotal: number;
      discount_amount: number;
      total: number;
      promo_code_id?: string;
      shipping_address: string;
      notes?: string;
      items: { product_id: string; quantity: number; unit_price: number; discount_amount: number }[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal: order.subtotal,
          discount_amount: order.discount_amount,
          total: order.total,
          promo_code_id: order.promo_code_id || null,
          shipping_address: order.shipping_address,
          notes: order.notes || null,
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItems = order.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Increment promo code usage
      if (order.promo_code_id) {
        await supabase.rpc("increment_promo_usage" as any, { code_id: order.promo_code_id });
      }

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUserOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image_url))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePromoCampaigns() {
  return useQuery({
    queryKey: ["promo_campaigns"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("promo_campaigns")
        .select("*, campaign_products(product_id, products(*))")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now);
      if (error) throw error;
      return data;
    },
  });
}
