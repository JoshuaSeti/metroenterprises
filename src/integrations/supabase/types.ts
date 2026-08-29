export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      b2b_inquiries: {
        Row: {
          category_id: string | null
          created_at: string
          details: string | null
          id: string
          image_paths: string[]
          is_kept: boolean
          product_name: string
          quantity: number | null
          status: Database["public"]["Enums"]["b2b_status"]
          target_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          image_paths?: string[]
          is_kept?: boolean
          product_name: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["b2b_status"]
          target_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          image_paths?: string[]
          is_kept?: boolean
          product_name?: string
          quantity?: number | null
          status?: Database["public"]["Enums"]["b2b_status"]
          target_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_inquiries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_messages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_paths: string[]
          inquiry_id: string
          is_admin: boolean
          sender_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_paths?: string[]
          inquiry_id: string
          is_admin?: boolean
          sender_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_paths?: string[]
          inquiry_id?: string
          is_admin?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "b2b_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_products: {
        Row: {
          campaign_id: string
          id: string
          product_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          product_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promo_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_slides: {
        Row: {
          campaign_id: string | null
          created_at: string
          cta_label: string | null
          cta_link: string | null
          headline: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          subtext: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          headline: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          subtext?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          headline?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          subtext?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carousel_slides_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promo_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      discount_products: {
        Row: {
          category_id: string | null
          discount_id: string
          id: string
          product_id: string | null
        }
        Insert: {
          category_id?: string | null
          discount_id: string
          id?: string
          product_id?: string | null
        }
        Update: {
          category_id?: string | null
          discount_id?: string
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_products_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          min_quantity: number | null
          name: string
          start_date: string | null
          type: Database["public"]["Enums"]["discount_type"]
          value: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_quantity?: number | null
          name: string
          start_date?: string | null
          type: Database["public"]["Enums"]["discount_type"]
          value: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          min_quantity?: number | null
          name?: string
          start_date?: string | null
          type?: Database["public"]["Enums"]["discount_type"]
          value?: number
        }
        Relationships: []
      }
      group_buy_participants: {
        Row: {
          created_at: string
          group_buy_id: string
          id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          group_buy_id: string
          id?: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          group_buy_id?: string
          id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_buy_participants_group_buy_id_fkey"
            columns: ["group_buy_id"]
            isOneToOne: false
            referencedRelation: "group_buys"
            referencedColumns: ["id"]
          },
        ]
      }
      group_buys: {
        Row: {
          committed_quantity: number
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          min_quantity: number
          product_id: string | null
          share_slug: string | null
          status: string
          title: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          committed_quantity?: number
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          min_quantity?: number
          product_id?: string | null
          share_slug?: string | null
          status?: string
          title: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          committed_quantity?: number
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          min_quantity?: number
          product_id?: string | null
          share_slug?: string | null
          status?: string
          title?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_buys_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          notes: string | null
          payment_proof_url: string | null
          promo_code_id: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_proof_url?: string | null
          promo_code_id?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          notes?: string | null
          payment_proof_url?: string | null
          promo_code_id?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      product_price_tiers: {
        Row: {
          created_at: string
          id: string
          min_quantity: number
          product_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          min_quantity: number
          product_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          min_quantity?: number
          product_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_price_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          group_buy_min_quantity: number
          id: string
          image_url: string | null
          is_active: boolean
          is_group_buy: boolean
          name: string
          price: number
          shipping_time: string | null
          slug: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          group_buy_min_quantity?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_group_buy?: boolean
          name: string
          price: number
          shipping_time?: string | null
          slug: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          group_buy_min_quantity?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_group_buy?: boolean
          name?: string
          price?: number
          shipping_time?: string | null
          slug?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_campaigns: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      promo_code_products: {
        Row: {
          category_id: string | null
          id: string
          product_id: string | null
          promo_code_id: string
        }
        Insert: {
          category_id?: string | null
          id?: string
          product_id?: string | null
          promo_code_id: string
        }
        Update: {
          category_id?: string | null
          id?: string
          product_id?: string | null
          promo_code_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_products_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          free_shipping: boolean
          id: string
          influencer_id: string | null
          is_active: boolean
          type: Database["public"]["Enums"]["promo_code_type"]
          usage_count: number
          usage_limit: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          free_shipping?: boolean
          id?: string
          influencer_id?: string | null
          is_active?: boolean
          type: Database["public"]["Enums"]["promo_code_type"]
          usage_count?: number
          usage_limit?: number | null
          value?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          free_shipping?: boolean
          id?: string
          influencer_id?: string | null
          is_active?: boolean
          type?: Database["public"]["Enums"]["promo_code_type"]
          usage_count?: number
          usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      reward_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          order_id: string | null
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          points: number
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          min_redeem_points: number
          points_per_currency: number
          points_per_currency_redeem: number
          program_name: string
          signup_bonus_points: number
          terms: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          min_redeem_points?: number
          points_per_currency?: number
          points_per_currency_redeem?: number
          program_name?: string
          signup_bonus_points?: number
          terms?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          min_redeem_points?: number
          points_per_currency?: number
          points_per_currency_redeem?: number
          program_name?: string
          signup_bonus_points?: number
          terms?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rewards_tiers: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          min_points: number
          multiplier: number
          name: string
          perks: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_points?: number
          multiplier?: number
          name: string
          perks?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_points?: number
          multiplier?: number
          name?: string
          perks?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string
          default_shipping_time: string
          group_buy_default_days: number
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_shipping_time?: string
          group_buy_default_days?: number
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_shipping_time?: string
          group_buy_default_days?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          created_at: string
          id: string
          message: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_b2b_chats: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "influencer" | "customer"
      b2b_status: "open" | "in_progress" | "quoted" | "closed"
      discount_type: "percentage" | "bulk" | "bundle" | "first_order"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      promo_code_type:
        | "percentage"
        | "fixed_amount"
        | "free_shipping"
        | "combination"
      ticket_status: "open" | "in_progress" | "resolved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "influencer", "customer"],
      b2b_status: ["open", "in_progress", "quoted", "closed"],
      discount_type: ["percentage", "bulk", "bundle", "first_order"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      promo_code_type: [
        "percentage",
        "fixed_amount",
        "free_shipping",
        "combination",
      ],
      ticket_status: ["open", "in_progress", "resolved"],
    },
  },
} as const
