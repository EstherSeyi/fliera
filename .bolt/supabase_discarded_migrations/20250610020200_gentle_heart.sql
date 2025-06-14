/*
  # Fix storage RLS policies for generated-dps bucket

  1. Storage Policies
    - Enable RLS on storage.objects table (if not already enabled)
    - Add policy for authenticated users to insert files into generated-dps bucket
    - Add policy for public read access to generated-dps bucket
    - Add policy for authenticated users to delete their own files from generated-dps bucket

  2. Security
    - Ensures authenticated users can upload DPs
    - Allows public read access for sharing generated DPs
    - Allows users to delete their own uploaded files
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert files into generated-dps bucket
CREATE POLICY "Authenticated users can upload to generated-dps bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'generated-dps');

-- Policy to allow public read access to generated-dps bucket
CREATE POLICY "Public read access to generated-dps bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'generated-dps');

-- Policy to allow authenticated users to delete their own files from generated-dps bucket
CREATE POLICY "Authenticated users can delete their own files from generated-dps bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'generated-dps' AND auth.uid()::text = owner);

-- Policy to allow authenticated users to update their own files in generated-dps bucket
CREATE POLICY "Authenticated users can update their own files in generated-dps bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'generated-dps' AND auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'generated-dps' AND auth.uid()::text = owner);