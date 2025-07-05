/*
  # Fix Admin Login System and RLS Policies

  1. Policy Changes
    - Drop all existing recursive policies
    - Create simple, non-recursive policies for admin_users
    - Enable public read access for login verification
    - Allow authenticated users to manage their own records
    - Give service role full access

  2. Admin User Setup
    - Ensure admin user exists in admin_users table
    - Update auth user password without touching generated columns
*/

-- Drop all existing policies on admin_users to start fresh
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can read own admin record" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Public can verify admin status for login" ON admin_users;
DROP POLICY IF EXISTS "Users can update own last_login" ON admin_users;

-- Create simple, non-recursive policies

-- 1. Allow public read access for login verification (essential for login flow)
CREATE POLICY "Enable read access for login verification"
  ON admin_users
  FOR SELECT
  TO public
  USING (true);

-- 2. Allow authenticated users to read their own record
CREATE POLICY "Users can read own record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Allow authenticated users to update their own last_login
CREATE POLICY "Users can update own last_login"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Allow service role full access for admin management
CREATE POLICY "Service role full access"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure the admin user exists and is properly configured
INSERT INTO admin_users (
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
) VALUES (
  'b5001a4d-e4f8-4196-9450-a7958913ed37',
  'camatozweddings@gmail.com',
  'Camatoz Weddings Admin',
  'super_admin',
  true,
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = 'super_admin',
  is_active = true;

-- Update the auth user password (avoiding generated columns)
UPDATE auth.users 
SET 
  encrypted_password = crypt('#Password123', gen_salt('bf')),
  updated_at = now(),
  email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE id = 'b5001a4d-e4f8-4196-9450-a7958913ed37';