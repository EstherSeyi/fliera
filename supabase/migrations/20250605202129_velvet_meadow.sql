/*
  # Create events table and security policies

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `date` (date)
      - `description` (text)
      - `flyer_url` (text)
      - `image_placeholders` (jsonb)
      - `text_placeholders` (jsonb)
      - `created_at` (timestamptz)
      - `visibility` (text) - Controls event visibility (public/private/archived)
      - `category` (text) - Event category type

  2. Security
    - Enable RLS on `events` table
    - Add policies for:
      - Anyone can read public events
      - Authenticated users can create events
      - Users can update/delete their own events
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  description text,
  flyer_url text NOT NULL,
  image_placeholders jsonb NOT NULL DEFAULT '[]'::jsonb,
  text_placeholders jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('private', 'public', 'archived')),
  category text NOT NULL CHECK (category IN ('business', 'technology', 'music', 'social', 'sports', 'activism', 'other'))
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public events
CREATE POLICY "Public events are viewable by everyone"
  ON events
  FOR SELECT
  USING (visibility = 'public');

-- Allow users to view their own private/archived events
CREATE POLICY "Users can view their own private events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to create events
CREATE POLICY "Authenticated users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own events
CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own events
CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);