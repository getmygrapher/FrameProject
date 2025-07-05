/*
  # Admin Panel Database Schema

  1. New Tables
    - `frame_materials`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text) - 'wood' or 'metal'
      - `texture` (text)
      - `price_multiplier` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `frame_colors`
      - `id` (uuid, primary key)
      - `material_id` (uuid, foreign key)
      - `name` (text)
      - `hex_code` (text)
      - `price_multiplier` (decimal)
      - `created_at` (timestamp)

    - `frame_sizes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `width` (decimal)
      - `height` (decimal)
      - `display_name` (text)
      - `is_popular` (boolean)
      - `price_multiplier` (decimal)
      - `created_at` (timestamp)

    - `frame_thickness`
      - `id` (uuid, primary key)
      - `name` (text)
      - `inches` (decimal)
      - `price_multiplier` (decimal)
      - `created_at` (timestamp)

    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `customer_email` (text)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `shipping_address` (jsonb)
      - `order_items` (jsonb)
      - `subtotal` (decimal)
      - `shipping_cost` (decimal)
      - `total_amount` (decimal)
      - `status` (text) - 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
      - `payment_status` (text) - 'pending', 'paid', 'failed', 'refunded'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `admin_users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `role` (text) - 'admin', 'super_admin'
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
    - Add policies for public read access to product data
*/

-- Create frame_materials table
CREATE TABLE IF NOT EXISTS frame_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('wood', 'metal')),
  texture text NOT NULL,
  price_multiplier decimal(4,2) NOT NULL DEFAULT 1.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create frame_colors table
CREATE TABLE IF NOT EXISTS frame_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid REFERENCES frame_materials(id) ON DELETE CASCADE,
  name text NOT NULL,
  hex_code text NOT NULL,
  price_multiplier decimal(4,2) NOT NULL DEFAULT 1.00,
  created_at timestamptz DEFAULT now()
);

-- Create frame_sizes table
CREATE TABLE IF NOT EXISTS frame_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  width decimal(4,2) NOT NULL,
  height decimal(4,2) NOT NULL,
  display_name text NOT NULL,
  is_popular boolean DEFAULT false,
  price_multiplier decimal(4,2) NOT NULL DEFAULT 1.00,
  created_at timestamptz DEFAULT now()
);

-- Create frame_thickness table
CREATE TABLE IF NOT EXISTS frame_thickness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  inches decimal(4,2) NOT NULL,
  price_multiplier decimal(4,2) NOT NULL DEFAULT 1.00,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  shipping_address jsonb NOT NULL,
  order_items jsonb NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  shipping_cost decimal(10,2) NOT NULL DEFAULT 0.00,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable Row Level Security
ALTER TABLE frame_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE frame_thickness ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to product data
CREATE POLICY "Public can read frame materials"
  ON frame_materials
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read frame colors"
  ON frame_colors
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read frame sizes"
  ON frame_sizes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read frame thickness"
  ON frame_thickness
  FOR SELECT
  TO public
  USING (true);

-- Create policies for admin access
CREATE POLICY "Admins can manage frame materials"
  ON frame_materials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can manage frame colors"
  ON frame_colors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can manage frame sizes"
  ON frame_sizes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can manage frame thickness"
  ON frame_thickness
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "System can insert orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_frame_colors_material_id ON frame_colors(material_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_frame_materials_updated_at
  BEFORE UPDATE ON frame_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();