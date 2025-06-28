/*
  # Add Database Functions for Credit Operations

  1. New Functions
    - `increment_free_events_used` - Atomically increments the free_events_used counter
    - `deduct_user_credits` - Atomically deducts credits from a user's balance
  
  2. Purpose
    - These functions ensure that credit operations are performed atomically
    - Prevents race conditions when multiple requests try to modify the same user's credits
    - Used by the edge functions to safely update credit balances
*/

-- Function to increment free_events_used counter atomically
CREATE OR REPLACE FUNCTION increment_free_events_used(user_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET free_events_used = COALESCE(free_events_used, 0) + 1
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_user_credits(user_id_param uuid, amount_param numeric)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET credits = credits - amount_param
  WHERE id = user_id_param AND credits >= amount_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits or user not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;