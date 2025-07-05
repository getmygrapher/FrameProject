/*
  # Update Admin User Password

  1. Password Update
    - Update password for admin user camatozweddings@gmail.com
    - Set password to #Password123
    - Use Supabase auth.users table update

  2. Security
    - Password will be properly hashed by Supabase
    - Maintains existing user data
*/

-- Update the password for the admin user
-- Note: This uses Supabase's built-in password hashing
UPDATE auth.users 
SET 
  encrypted_password = crypt('#Password123', gen_salt('bf')),
  updated_at = now()
WHERE email = 'camatozweddings@gmail.com';

-- Also update the last_login to null to force a fresh login
UPDATE admin_users 
SET last_login = null
WHERE email = 'camatozweddings@gmail.com';