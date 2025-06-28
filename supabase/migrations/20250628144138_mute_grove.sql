/*
  # Fix Events Table UPDATE Policy

  1. Security Policy Update
    - Drop the existing UPDATE policy that uses incorrect `uid()` function
    - Create a new UPDATE policy using correct `auth.uid()` function
    - Ensure authenticated users can update their own events

  2. Changes
    - Replace `uid()` with `auth.uid()` in the UPDATE policy qualification
    - Maintain the same security model where users can only update their own events
*/

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update their own events" ON events;

-- Create the corrected UPDATE policy
CREATE POLICY "Authenticated users can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);