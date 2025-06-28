/*
  # Create credit_transactions table

  1. New Tables
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `amount` (numeric, the number of credits added or deducted)
      - `transaction_type` (text, e.g., 'purchase', 'event_creation', 'dp_generation')
      - `payment_id` (text, optional, for storing Stripe payment IDs)
      - `status` (text, e.g., 'completed', 'pending', 'failed')
      - `created_at` (timestamp)
      - `notes` (text, optional)
  
  2. Security
    - Enable RLS on `credit_transactions` table
    - Add policy for authenticated users to read their own transactions
    - Add policy for service role to insert transactions
*/

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL,
  payment_id text,
  status text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  notes text
);

-- Enable Row Level Security
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
  ON credit_transactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);