/*
  # Create storage bucket and policies for generated DPs

  1. Storage Bucket
    - Create 'generated-dps' bucket for storing user photos and generated DP images

  2. Storage Policies
    - Enable public read access to generated DPs
    - Allow authenticated users to upload files
    - Allow users to update/delete their own files
    - Allow anonymous users to upload files (for non-authenticated DP generation)
*/

-- Create the generated-dps storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-dps', 'generated-dps', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public read access to generated-dps bucket
CREATE POLICY "Generated DPs are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'generated-dps');

-- Allow authenticated users to upload to generated-dps bucket
CREATE POLICY "Authenticated users can upload generated DPs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'generated-dps');

-- Allow anonymous users to upload to generated-dps bucket (for non-authenticated users)
CREATE POLICY "Anonymous users can upload generated DPs"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'generated-dps');

-- Allow users to update their own files in generated-dps bucket
CREATE POLICY "Users can update their own generated DPs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'generated-dps');

-- Allow users to delete their own files in generated-dps bucket
CREATE POLICY "Users can delete their own generated DPs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner AND bucket_id = 'generated-dps');