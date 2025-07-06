/*
  # Add Frame Photos Support

  1. Schema Changes
    - Add `photo_url` column to `frame_materials` table
    - Add `preview_image_url` column to `frame_materials` table
    - Update policies to allow file uploads

  2. Storage
    - Create storage bucket for frame photos
    - Set up policies for public read access
    - Allow admin uploads
*/

-- Add photo columns to frame_materials table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'frame_materials' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE frame_materials ADD COLUMN photo_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'frame_materials' AND column_name = 'preview_image_url'
  ) THEN
    ALTER TABLE frame_materials ADD COLUMN preview_image_url text;
  END IF;
END $$;

-- Create storage bucket for frame photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('frame-photos', 'frame-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to frame photos
CREATE POLICY IF NOT EXISTS "Public can view frame photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'frame-photos');

-- Allow authenticated users (admins) to upload frame photos
CREATE POLICY IF NOT EXISTS "Admins can upload frame photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'frame-photos' AND
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Allow authenticated users (admins) to update frame photos
CREATE POLICY IF NOT EXISTS "Admins can update frame photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'frame-photos' AND
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Allow authenticated users (admins) to delete frame photos
CREATE POLICY IF NOT EXISTS "Admins can delete frame photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'frame-photos' AND
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );