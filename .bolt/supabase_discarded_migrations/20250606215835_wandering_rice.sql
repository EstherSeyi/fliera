/*
  # Create DPs table for storing generated display pictures

  1. New Tables
    - `dps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, nullable for anonymous users)
      - `event_id` (uuid, references events)
      - `generated_image_url` (text)
      - `user_name` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `dps` table
    - Add policies for:
      - Users can view their own DPs
      - Users can create DPs
      - Users can delete their own DPs
*/

CREATE TABLE IF NOT EXISTS dps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  generated_image_url text NOT NULL,
  user_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dps ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own DPs
CREATE POLICY "Users can view their own DPs"
  ON dps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create DPs (both authenticated and anonymous)
CREATE POLICY "Users can create DPs"
  ON dps
  FOR INSERT
  WITH CHECK (
    -- Authenticated users can only create DPs for themselves
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- Anonymous users can create DPs with null user_id
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Allow users to delete their own DPs
CREATE POLICY "Users can delete their own DPs"
  ON dps
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);