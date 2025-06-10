/*
  # Fix storage bucket setup for generated-dps

  1. Storage Bucket Setup
    - Create `generated-dps` storage bucket if it doesn't exist
    - Configure bucket to be public for read access
    - Set up proper RLS policies for authenticated users

  2. Security Policies
    - Allow authenticated users to upload files
    - Allow public read access for sharing
    - Allow users to delete their own files
    - Allow users to update their own files

  This migration fixes the "new row violates row-level security policy" error
  by properly configuring the storage bucket and its policies.
*/

-- Create the generated-dps bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-dps', 'generated-dps', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Create policy for authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated users can upload to generated-dps"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'generated-dps');

-- Create policy for public read access
CREATE POLICY IF NOT EXISTS "Public can view generated-dps files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'generated-dps');

-- Create policy for users to delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete own generated-dps files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'generated-dps' AND auth.uid()::text = owner);

-- Create policy for users to update their own files
CREATE POLICY IF NOT EXISTS "Users can update own generated-dps files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'generated-dps' AND auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'generated-dps' AND auth.uid()::text = owner);