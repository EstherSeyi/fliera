/*
  # Fix credits column type to support decimal values

  1. Changes
    - Change `credits` column in `users` table from integer to numeric type
    - This allows storing fractional credit values (e.g., 0.5, 0.001)
    - Preserves existing credit values during the conversion

  2. Impact
    - Enables proper credit deduction for events (0.5 credits) and DPs (0.001 credits)
    - Fixes the edge function errors when updating user credits
    - No data loss - existing integer values will be preserved
*/

-- Change the credits column from integer to numeric to support decimal values
ALTER TABLE users ALTER COLUMN credits TYPE NUMERIC USING credits::NUMERIC;

-- Set a more precise default value if needed (keeping it as 0 for consistency)
ALTER TABLE users ALTER COLUMN credits SET DEFAULT 0;