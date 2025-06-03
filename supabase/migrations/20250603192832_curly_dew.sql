/*
  # Create storage policies for event flyers

  1. Storage Policies
    - Enable public read access to event flyers
    - Allow authenticated users to upload flyers
    - Allow users to update/delete their own flyers
*/

-- Enable public read access to event-flyers bucket
CREATE POLICY "Event flyers are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-flyers');

-- Allow authenticated users to upload flyers
CREATE POLICY "Authenticated users can upload event flyers"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-flyers');

-- Allow users to update their own flyers
CREATE POLICY "Users can update their own flyers"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner)
  WITH CHECK (bucket_id = 'event-flyers');

-- Allow users to delete their own flyers
CREATE POLICY "Users can delete their own flyers"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner AND bucket_id = 'event-flyers');