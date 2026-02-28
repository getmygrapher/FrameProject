/*
  Baseline schema for FrameProject storefront + admin read/write essentials.
  Run this before any legacy migrations.
*/

CREATE TABLE IF NOT EXISTS frame_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('wood', 'metal')),
  texture text NOT NULL,
  price_multiplier numeric(6,2) NOT NULL DEFAULT 1.00,
  photo_url text,
  preview_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS frame_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES frame_materials(id) ON DELETE CASCADE,
  name text NOT NULL,
  hex_code text NOT NULL,
  price_multiplier numeric(6,2) NOT NULL DEFAULT 1.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS frame_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  width numeric(6,2) NOT NULL,
  height numeric(6,2) NOT NULL,
  display_name text NOT NULL,
  is_popular boolean NOT NULL DEFAULT false,
  price_multiplier numeric(6,2) NOT NULL DEFAULT 1.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS frame_thickness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  inches numeric(6,2) NOT NULL,
  price_multiplier numeric(6,2) NOT NULL DEFAULT 1.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address jsonb NOT NULL,
  order_items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0.00,
  total_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_frame_materials_updated_at ON frame_materials;
CREATE TRIGGER update_frame_materials_updated_at
BEFORE UPDATE ON frame_materials
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_frame_colors_material_id ON frame_colors(material_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

ALTER TABLE frame_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_thickness ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read frame materials" ON frame_materials;
CREATE POLICY "Public can read frame materials"
ON frame_materials FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Public can read frame colors" ON frame_colors;
CREATE POLICY "Public can read frame colors"
ON frame_colors FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Public can read frame sizes" ON frame_sizes;
CREATE POLICY "Public can read frame sizes"
ON frame_sizes FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Public can read frame thickness" ON frame_thickness;
CREATE POLICY "Public can read frame thickness"
ON frame_thickness FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "System can insert orders" ON orders;
CREATE POLICY "System can insert orders"
ON orders FOR INSERT TO public
WITH CHECK (true);
