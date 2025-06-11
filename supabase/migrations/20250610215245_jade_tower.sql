/*
  # Fix Storage Policies for Generated DPs

  1. Storage Policies
    - Enable RLS on generated-dps storage bucket
    - Add policy for authenticated users to upload files
    - Add policy for authenticated users to view their own files
    - Add policy for public access to view files (for sharing)

  2. Security
    - Authenticated users can upload to generated-dps bucket
    - Authenticated users can view their own uploaded files
    - Public can view files (needed for sharing generated DPs)
*/

-- Enable RLS on the generated-dps storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-dps', 'generated-dps', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Policy for authenticated users to upload files to generated-dps bucket
CREATE POLICY "Authenticated users can upload generated DPs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-dps' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for authenticated users to view their own files
CREATE POLICY "Users can view their own generated DPs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-dps' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for public access to view files (needed for sharing)
CREATE POLICY "Public can view generated DPs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'generated-dps');

-- Policy for authenticated users to delete their own files
CREATE POLICY "Users can delete their own generated DPs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-dps' AND
  auth.uid()::text = (storage.foldername(name))[1]
);