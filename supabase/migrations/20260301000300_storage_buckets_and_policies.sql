/*
  Storage setup:
  - frame-photos: public
  - order-photos: private
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('frame-photos', 'frame-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('order-photos', 'order-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Public can view frame photos" ON storage.objects;
CREATE POLICY "Public can view frame photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'frame-photos');

DROP POLICY IF EXISTS "Admins can manage frame photos" ON storage.objects;
CREATE POLICY "Admins can manage frame photos"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'frame-photos'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
)
WITH CHECK (
  bucket_id = 'frame-photos'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Customers can upload order photos" ON storage.objects;
CREATE POLICY "Customers can upload order photos"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'order-photos');

DROP POLICY IF EXISTS "Admins can read order photos" ON storage.objects;
CREATE POLICY "Admins can read order photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'order-photos'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);

DROP POLICY IF EXISTS "Admins can delete order photos" ON storage.objects;
CREATE POLICY "Admins can delete order photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'order-photos'
  AND EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
  )
);
