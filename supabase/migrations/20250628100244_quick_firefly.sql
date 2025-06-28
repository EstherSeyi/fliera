/*
  # Add free_events_used column to users table

  1. Changes
    - Add free_events_used column to users table with default value of 0
    - This column tracks how many free events a user has created (max 3)
*/

-- Add free_events_used column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'free_events_used'
  ) THEN
    ALTER TABLE users ADD COLUMN free_events_used integer DEFAULT 0;
  END IF;
END $$;