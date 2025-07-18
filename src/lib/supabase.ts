import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    url: supabaseUrl ? "Present" : "Missing",
    key: supabaseAnonKey ? "Present" : "Missing",
  });
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    debug: import.meta.env.DEV,
  },
});

// Database types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  name: "b2c_customer" | "b2b_partner" | "admin" | "super_admin";
  display_name: string;
  description?: string;
  permissions: Record<string, any>;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role_id: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  role?: UserRole;
}

export interface B2BAccount {
  id: string;
  user_id: string;
  company_name: string;
  business_type?: string;
  tax_id?: string;
  business_address?: Record<string, any>;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  credit_limit: number;
  payment_terms: number;
  discount_percentage: number;
  status: "pending" | "approved" | "suspended" | "rejected";
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku?: string;
  category_id?: string;
  frame_overlay_url?: string;
  frame_preview_url?: string;
  material_type?: "wood" | "metal" | "plastic" | "composite";
  finish_type?: string;
  orientation?: "portrait" | "landscape" | "square" | "any";
  width?: number;
  height?: number;
  depth?: number;
  base_price: number;
  b2c_price: number;
  b2b_price?: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  track_inventory: boolean;
  is_active: boolean;
  is_featured: boolean;
  is_popular: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  tags?: Tag[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  width?: number;
  height?: number;
  color_name?: string;
  color_hex?: string;
  material_finish?: string;
  price_adjustment: number;
  b2c_price?: number;
  b2b_price?: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CustomOrder {
  id: string;
  user_id: string;
  base_product_id?: string;
  custom_width?: number;
  custom_height?: number;
  custom_material?: string;
  custom_finish?: string;
  custom_color?: string;
  special_instructions?: string;
  photo_url?: string;
  photo_specifications?: Record<string, any>;
  quoted_price?: number;
  final_price?: number;
  status:
    | "quote_requested"
    | "quoted"
    | "approved"
    | "in_production"
    | "completed"
    | "cancelled"
    | "delivered";
  quote_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Legacy types for backward compatibility
export interface FrameMaterial {
  id: string;
  name: string;
  category: "wood" | "metal";
  texture: string;
  price_multiplier: number;
  photo_url?: string;
  preview_image_url?: string;
  created_at: string;
  updated_at: string;
  colors?: FrameColor[];
}

export interface FrameColor {
  id: string;
  material_id: string;
  name: string;
  hex_code: string;
  price_multiplier: number;
  created_at: string;
}

export interface FrameSize {
  id: string;
  name: string;
  width: number;
  height: number;
  display_name: string;
  is_popular: boolean;
  price_multiplier: number;
  created_at: string;
}

export interface FrameThickness {
  id: string;
  name: string;
  inches: number;
  price_multiplier: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  customer_type: "b2c" | "b2b";
  b2b_account_id?: string;
  shipping_address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  order_items: Array<{
    id: string;
    photo_url: string;
    frame_config: any;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  discount_percentage: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "super_admin";
  is_active: boolean;
  created_at: string;
  last_login?: string;
}
