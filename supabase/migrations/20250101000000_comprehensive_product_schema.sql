/*
  # Comprehensive Product Schema for FrameCraft
  
  This migration creates the complete database schema for:
  - Product management with transparent PNG overlays
  - Category and tag system
  - User roles (B2C, B2B, Admin)
  - Dual pricing structure
  - Reviews and ratings
  - Inventory tracking
  - Wishlist functionality
  - B2B account management
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (name IN ('b2c_customer', 'b2b_partner', 'admin', 'super_admin')),
  display_name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role_id uuid REFERENCES user_roles(id),
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create b2b_accounts table
CREATE TABLE IF NOT EXISTS b2b_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  business_type text,
  tax_id text,
  business_address jsonb,
  contact_person text,
  contact_phone text,
  contact_email text,
  credit_limit decimal(12,2) DEFAULT 0,
  payment_terms integer DEFAULT 30, -- days
  discount_percentage decimal(5,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  sku text UNIQUE,
  category_id uuid REFERENCES categories(id),
  
  -- Frame specifications
  frame_overlay_url text, -- Transparent PNG overlay
  frame_preview_url text, -- Preview image for catalog
  material_type text CHECK (material_type IN ('wood', 'metal', 'plastic', 'composite')),
  finish_type text,
  orientation text CHECK (orientation IN ('portrait', 'landscape', 'square', 'any')),
  
  -- Dimensions (in inches)
  width decimal(6,2),
  height decimal(6,2),
  depth decimal(6,2),
  
  -- Pricing
  base_price decimal(10,2) NOT NULL,
  b2c_price decimal(10,2) NOT NULL,
  b2b_price decimal(10,2),
  cost_price decimal(10,2),
  
  -- Inventory
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  track_inventory boolean DEFAULT true,
  
  -- Product status
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create product_tags junction table
CREATE TABLE IF NOT EXISTS product_tags (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- Create product_variants table (for size, color variations)
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text UNIQUE,
  
  -- Variant specifications
  width decimal(6,2),
  height decimal(6,2),
  color_name text,
  color_hex text,
  material_finish text,
  
  -- Pricing
  price_adjustment decimal(10,2) DEFAULT 0,
  b2c_price decimal(10,2),
  b2b_price decimal(10,2),
  
  -- Inventory
  stock_quantity integer DEFAULT 0,
  
  -- Status
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create custom_orders table (for custom sizes and specifications)
CREATE TABLE IF NOT EXISTS custom_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  base_product_id uuid REFERENCES products(id),
  
  -- Custom specifications
  custom_width decimal(6,2),
  custom_height decimal(6,2),
  custom_material text,
  custom_finish text,
  custom_color text,
  special_instructions text,
  
  -- Photo details
  photo_url text,
  photo_specifications jsonb,
  
  -- Pricing
  quoted_price decimal(10,2),
  final_price decimal(10,2),
  
  -- Status
  status text DEFAULT 'quote_requested' CHECK (status IN (
    'quote_requested', 'quoted', 'approved', 'in_production', 
    'completed', 'cancelled', 'delivered'
  )),
  
  -- Timestamps
  quote_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update existing orders table to reference products
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'b2c' CHECK (customer_type IN ('b2c', 'b2b'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS b2b_account_id uuid REFERENCES b2b_accounts(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percentage decimal(5,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount decimal(10,2) DEFAULT 0;

-- Insert default user roles
INSERT INTO user_roles (name, display_name, description, permissions) VALUES
('b2c_customer', 'B2C Customer', 'Regular retail customer', '{"can_place_orders": true, "can_view_b2c_pricing": true}'),
('b2b_partner', 'B2B Partner', 'Business partner with wholesale access', '{"can_place_orders": true, "can_view_b2b_pricing": true, "can_bulk_order": true}'),
('admin', 'Administrator', 'System administrator', '{"can_manage_products": true, "can_manage_orders": true, "can_view_analytics": true}'),
('super_admin', 'Super Administrator', 'Full system access', '{"full_access": true}')
ON CONFLICT (name) DO NOTHING;

-- Set default role_id for users table after roles are inserted
-- Note: We'll handle default role assignment in application logic instead of database default

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Photo Frames', 'photo-frames', 'Traditional photo frames for personal and professional use'),
('Art Frames', 'art-frames', 'Frames designed for artwork and prints'),
('Certificate Frames', 'certificate-frames', 'Professional frames for certificates and documents'),
('Collage Frames', 'collage-frames', 'Multi-opening frames for photo collections'),
('Custom Frames', 'custom-frames', 'Made-to-order frames with custom specifications')
ON CONFLICT (slug) DO NOTHING;

-- Insert default tags
INSERT INTO tags (name, slug, color) VALUES
('Popular', 'popular', '#EF4444'),
('New Arrival', 'new-arrival', '#10B981'),
('Best Seller', 'best-seller', '#F59E0B'),
('Premium', 'premium', '#8B5CF6'),
('Eco Friendly', 'eco-friendly', '#059669'),
('Handcrafted', 'handcrafted', '#DC2626'),
('Modern', 'modern', '#3B82F6'),
('Classic', 'classic', '#6B7280'),
('Rustic', 'rustic', '#92400E'),
('Minimalist', 'minimalist', '#374151')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_popular ON products(is_popular);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_b2c_price ON products(b2c_price);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_b2b_accounts_user_id ON b2b_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_b2b_accounts_status ON b2b_accounts(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_user_id ON custom_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Public read access for product catalog
CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Public can read tags" ON tags
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can read user roles" ON user_roles
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can read active products" ON products
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Public can read product images" ON product_images
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can read product tags" ON product_tags
  FOR SELECT TO public USING (true);

CREATE POLICY "Public can read active product variants" ON product_variants
  FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT TO public USING (is_approved = true);

-- User-specific policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can manage own wishlist" ON wishlist
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own reviews" ON reviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own custom orders" ON custom_orders
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- B2B account policies
CREATE POLICY "Users can read own b2b account" ON b2b_accounts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create b2b account" ON b2b_accounts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own b2b account" ON b2b_accounts
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Admin policies
CREATE POLICY "Admins can manage all data" ON categories
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'super_admin')
      AND u.is_active = true
    )
  );

CREATE POLICY "Admins can manage tags" ON tags
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'super_admin')
      AND u.is_active = true
    )
  );

CREATE POLICY "Admins can manage products" ON products
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'super_admin')
      AND u.is_active = true
    )
  );

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'super_admin')
      AND u.is_active = true
    )
  );

CREATE POLICY "Admins can manage b2b accounts" ON b2b_accounts
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM users u 
      JOIN user_roles r ON u.role_id = r.id 
      WHERE u.id = auth.uid() 
      AND r.name IN ('admin', 'super_admin')
      AND u.is_active = true
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_b2b_accounts_updated_at
  BEFORE UPDATE ON b2b_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_orders_updated_at
  BEFORE UPDATE ON custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_orders;