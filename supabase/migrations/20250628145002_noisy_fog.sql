/*
  # Create credit system database functions

  1. New Functions
    - `increment_free_events_used` - Safely increment user's free events counter
    - `deduct_user_credits` - Safely deduct credits from user account
  
  2. Security
    - Functions use proper transaction handling
    - Include error checking and validation
*/

-- Function to safely increment free events used
CREATE OR REPLACE FUNCTION increment_free_events_used(user_id_param UUID)
RETURNS TABLE(success BOOLEAN, new_count SMALLINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count SMALLINT;
  new_count_val SMALLINT;
BEGIN
  -- Get current count and increment atomically
  UPDATE users 
  SET free_events_used = COALESCE(free_events_used, 0) + 1
  WHERE id = user_id_param
  RETURNING free_events_used INTO new_count_val;
  
  -- Check if user was found
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::SMALLINT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, new_count_val;
END;
$$;

-- Function to safely deduct credits from user
CREATE OR REPLACE FUNCTION deduct_user_credits(user_id_param UUID, amount_param NUMERIC)
RETURNS TABLE(success BOOLEAN, remaining_credits NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits NUMERIC;
  new_credits NUMERIC;
BEGIN
  -- Get current credits and check if sufficient
  SELECT credits INTO current_credits
  FROM users
  WHERE id = user_id_param;
  
  -- Check if user was found
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Check if sufficient credits
  IF current_credits < amount_param THEN
    RETURN QUERY SELECT FALSE, current_credits;
    RETURN;
  END IF;
  
  -- Deduct credits atomically
  UPDATE users 
  SET credits = credits - amount_param
  WHERE id = user_id_param
  RETURNING credits INTO new_credits;
  
  RETURN QUERY SELECT TRUE, new_credits;
END;
$$;