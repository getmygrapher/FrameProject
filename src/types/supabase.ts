export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          role?: string
        }
        Relationships: []
      }
      b2b_accounts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          business_address: Json | null
          business_type: string | null
          company_name: string
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          credit_limit: number | null
          discount_percentage: number | null
          id: string
          payment_terms: number | null
          status: string | null
          tax_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          business_address?: Json | null
          business_type?: string | null
          company_name: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          credit_limit?: number | null
          discount_percentage?: number | null
          id?: string
          payment_terms?: number | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          business_address?: Json | null
          business_type?: string | null
          company_name?: string
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          credit_limit?: number | null
          discount_percentage?: number | null
          id?: string
          payment_terms?: number | null
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_accounts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_orders: {
        Row: {
          base_product_id: string | null
          created_at: string | null
          custom_color: string | null
          custom_finish: string | null
          custom_height: number | null
          custom_material: string | null
          custom_width: number | null
          final_price: number | null
          id: string
          photo_specifications: Json | null
          photo_url: string | null
          quote_expires_at: string | null
          quoted_price: number | null
          special_instructions: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          base_product_id?: string | null
          created_at?: string | null
          custom_color?: string | null
          custom_finish?: string | null
          custom_height?: number | null
          custom_material?: string | null
          custom_width?: number | null
          final_price?: number | null
          id?: string
          photo_specifications?: Json | null
          photo_url?: string | null
          quote_expires_at?: string | null
          quoted_price?: number | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          base_product_id?: string | null
          created_at?: string | null
          custom_color?: string | null
          custom_finish?: string | null
          custom_height?: number | null
          custom_material?: string | null
          custom_width?: number | null
          final_price?: number | null
          id?: string
          photo_specifications?: Json | null
          photo_url?: string | null
          quote_expires_at?: string | null
          quoted_price?: number | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_orders_base_product_id_fkey"
            columns: ["base_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      frame_colors: {
        Row: {
          created_at: string | null
          hex_code: string
          id: string
          material_id: string | null
          name: string
          price_multiplier: number
        }
        Insert: {
          created_at?: string | null
          hex_code: string
          id?: string
          material_id?: string | null
          name: string
          price_multiplier?: number
        }
        Update: {
          created_at?: string | null
          hex_code?: string
          id?: string
          material_id?: string | null
          name?: string
          price_multiplier?: number
        }
        Relationships: [
          {
            foreignKeyName: "frame_colors_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "frame_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      frame_materials: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          photo_url: string | null
          preview_image_url: string | null
          price_multiplier: number
          texture: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          photo_url?: string | null
          preview_image_url?: string | null
          price_multiplier?: number
          texture: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          preview_image_url?: string | null
          price_multiplier?: number
          texture?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      frame_sizes: {
        Row: {
          created_at: string | null
          display_name: string
          height: number
          id: string
          is_popular: boolean | null
          name: string
          price_multiplier: number
          width: number
        }
        Insert: {
          created_at?: string | null
          display_name: string
          height: number
          id?: string
          is_popular?: boolean | null
          name: string
          price_multiplier?: number
          width: number
        }
        Update: {
          created_at?: string | null
          display_name?: string
          height?: number
          id?: string
          is_popular?: boolean | null
          name?: string
          price_multiplier?: number
          width?: number
        }
        Relationships: []
      }
      frame_thickness: {
        Row: {
          created_at: string | null
          id: string
          inches: number
          name: string
          price_multiplier: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          inches: number
          name: string
          price_multiplier?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          inches?: number
          name?: string
          price_multiplier?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          b2b_account_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          customer_type: string | null
          discount_percentage: number | null
          id: string
          order_items: Json
          order_number: string
          payment_status: string
          shipping_address: Json
          shipping_cost: number
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          b2b_account_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          customer_type?: string | null
          discount_percentage?: number | null
          id?: string
          order_items: Json
          order_number: string
          payment_status?: string
          shipping_address: Json
          shipping_cost?: number
          status?: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          b2b_account_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          customer_type?: string | null
          discount_percentage?: number | null
          id?: string
          order_items?: Json
          order_number?: string
          payment_status?: string
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_b2b_account_id_fkey"
            columns: ["b2b_account_id"]
            isOneToOne: false
            referencedRelation: "b2b_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          b2b_price: number | null
          b2c_price: number | null
          color_hex: string | null
          color_name: string | null
          created_at: string | null
          height: number | null
          id: string
          is_active: boolean | null
          material_finish: string | null
          name: string
          price_adjustment: number | null
          product_id: string | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          b2b_price?: number | null
          b2c_price?: number | null
          color_hex?: string | null
          color_name?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          material_finish?: string | null
          name: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          b2b_price?: number | null
          b2c_price?: number | null
          color_hex?: string | null
          color_name?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          material_finish?: string | null
          name?: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          b2b_price: number | null
          b2c_price: number
          base_price: number
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          depth: number | null
          description: string | null
          finish_type: string | null
          frame_overlay_url: string | null
          frame_preview_url: string | null
          height: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_popular: boolean | null
          low_stock_threshold: number | null
          material_type: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          orientation: string | null
          short_description: string | null
          sku: string | null
          slug: string
          stock_quantity: number | null
          track_inventory: boolean | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          b2b_price?: number | null
          b2c_price: number
          base_price: number
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          depth?: number | null
          description?: string | null
          finish_type?: string | null
          frame_overlay_url?: string | null
          frame_preview_url?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          low_stock_threshold?: number | null
          material_type?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          orientation?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          b2b_price?: number | null
          b2c_price?: number
          base_price?: number
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          depth?: number | null
          description?: string | null
          finish_type?: string | null
          frame_overlay_url?: string | null
          frame_preview_url?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_popular?: boolean | null
          low_stock_threshold?: number | null
          material_type?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          orientation?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
          width?: number | null
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
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          product_id: string | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          product_id?: string | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          phone_verified: boolean | null
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_reset_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
