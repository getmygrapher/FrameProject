/*
  # Create Admin User Record

  This migration creates an admin user record in the admin_users table.
  
  **IMPORTANT**: Before running this migration, you must first create the auth user 
  through the Supabase Dashboard:
  
  1. Go to Authentication > Users in your Supabase Dashboard
  2. Click "Add User"
  3. Email: midhun.anirudh@framecraftpro.com
  4. Password: #Unhdim@94
  5. Make sure to confirm the user
  
  Then run this migration to create the admin record.
*/

-- Create the admin user record
-- This assumes the auth user already exists with the specified email
INSERT INTO admin_users (
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
) 
SELECT 
    au.id,
    'midhun.anirudh@framecraftpro.com',
    'Midhun Anirudh',
    'super_admin',
    true,
    now()
FROM auth.users au 
WHERE au.email = 'midhun.anirudh@framecraftpro.com'
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    created_at = EXCLUDED.created_at;

-- Verify the admin user was created
DO $$
DECLARE
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM admin_users 
    WHERE email = 'midhun.anirudh@framecraftpro.com' AND is_active = true;
    
    IF admin_count > 0 THEN
        RAISE NOTICE 'Admin user created successfully for: midhun.anirudh@framecraftpro.com';
    ELSE
        RAISE NOTICE 'Admin user creation failed. Please ensure the auth user exists first.';
        RAISE NOTICE 'Create the auth user in Supabase Dashboard: Authentication > Users > Add User';
    END IF;
END $$;