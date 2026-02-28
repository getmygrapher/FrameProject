/*
  Minimal admin RLS without recursive policies.
*/

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can read own admin record" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Public can verify admin status for login" ON admin_users;
DROP POLICY IF EXISTS "Users can update own last_login" ON admin_users;
DROP POLICY IF EXISTS "Enable read access for login verification" ON admin_users;
DROP POLICY IF EXISTS "Users can read own record" ON admin_users;
DROP POLICY IF EXISTS "Service role full access" ON admin_users;

CREATE POLICY "Users can read own admin record"
ON admin_users FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own last_login"
ON admin_users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Service role can manage admin users"
ON admin_users FOR ALL TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage frame materials" ON frame_materials;
CREATE POLICY "Admins can manage frame materials"
ON frame_materials FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can manage frame colors" ON frame_colors;
CREATE POLICY "Admins can manage frame colors"
ON frame_colors FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can manage frame sizes" ON frame_sizes;
CREATE POLICY "Admins can manage frame sizes"
ON frame_sizes FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can manage frame thickness" ON frame_thickness;
CREATE POLICY "Admins can manage frame thickness"
ON frame_thickness FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
CREATE POLICY "Admins can read all orders"
ON orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);
