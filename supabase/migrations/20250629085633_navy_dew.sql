/*
  # Create Super Admin User

  1. New Admin User
    - Add existing auth user as super admin
    - User: camatozweddings@gmail.com
    - UID: b5001a4d-e4f8-4196-9450-a7958913ed37
    - Role: super_admin

  2. Security
    - Uses existing auth user
    - Sets super admin privileges
    - Activates account immediately
*/

-- Insert the super admin user record
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
  is_active = true,
  created_at = COALESCE(admin_users.created_at, now());