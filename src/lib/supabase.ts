import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Present' : 'Missing',
    key: supabaseAnonKey ? 'Present' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Database types
export interface FrameMaterial {
  id: string;
  name: string;
  category: 'wood' | 'metal';
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
  shipping_cost: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}