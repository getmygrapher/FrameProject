/*
  # Fix Admin Login RLS Policies

  1. Remove overly permissive public read policy
  2. Keep only necessary policies for secure admin authentication
*/

-- Drop the problematic public read policy
DROP POLICY IF EXISTS "Enable read access for login verification" ON admin_users;

-- The remaining policies are sufficient:
-- - "Users can read own record" for authenticated users
-- - "Users can update own last_login" for last login updates  
-- - "Service role full access" for admin management operations

-- Ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;