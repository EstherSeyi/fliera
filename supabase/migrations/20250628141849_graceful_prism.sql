/*
  # Add Idempotency Support for Credit Transactions

  1. New Tables
    - `credit_deduction_requests` - Tracks unique credit deduction requests to prevent duplicates
      - `request_id` (text, primary key) - Unique identifier for each deduction request
      - `user_id` (uuid) - User who made the request
      - `event_id` (uuid, nullable) - Associated event ID (for DP credit deductions)
      - `type` (text) - Type of deduction ('event' or 'dp')
      - `processed_at` (timestamptz) - When the request was processed
      - `amount` (numeric) - Amount of credits deducted
      - `status` (text) - Status of the request ('completed', 'failed')
  
  2. Security
    - Enable RLS on the new table
    - Add policy for service role to insert records
    - Add policy for users to view their own records
*/

-- Create credit_deduction_requests table for idempotency
CREATE TABLE IF NOT EXISTS credit_deduction_requests (
  request_id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('event', 'dp')),
  processed_at timestamptz DEFAULT now() NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('completed', 'failed'))
);

-- Enable Row Level Security
ALTER TABLE credit_deduction_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can insert deduction requests"
  ON credit_deduction_requests
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can view their own deduction requests"
  ON credit_deduction_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);