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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  price: number;
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
  price?: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
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
