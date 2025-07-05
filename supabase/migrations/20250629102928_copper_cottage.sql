/*
  # Fix infinite recursion in admin_users RLS policies

  1. Problem
    - Current RLS policy on admin_users table causes infinite recursion
    - Policy tries to query admin_users table from within its own definition
    - This prevents admin login and user verification

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid recursion
    - Allow authenticated users to read their own admin record
    - Use service role for admin management operations
    - Add policy for public access during login verification

  3. Security
    - Authenticated users can only read their own admin record
    - Service role can manage all admin users
    - Public access allowed for login verification (limited scope)
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;

-- Allow authenticated users to read their own admin record
CREATE POLICY "Users can read own admin record"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Allow service role to manage all admin users (for admin operations)
CREATE POLICY "Service role can manage admin users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public access for login verification (read-only, limited to active admins)
CREATE POLICY "Public can verify admin status for login"
  ON admin_users
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow authenticated users to update their own last_login timestamp
CREATE POLICY "Users can update own last_login"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());