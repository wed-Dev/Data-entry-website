-- Invoice Entry Application - Supabase Database Schema
-- Run this script in Supabase SQL Editor to set up your database

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if it exists (use with caution in production)
-- DROP TABLE IF EXISTS transactions CASCADE;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id VARCHAR(100) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  vehicle_type VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

-- Create RLS Policies

-- SELECT: Users can only view their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only create transactions for themselves
CREATE POLICY "Users can create their own transactions" 
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own transactions
CREATE POLICY "Users can update their own transactions" 
  ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own transactions
CREATE POLICY "Users can delete their own transactions" 
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify the setup
SELECT 'Schema setup completed successfully!' AS status;

-- Optional: Insert sample data for testing (uncomment if needed)
/*
INSERT INTO transactions (
  user_id, 
  customer_id, 
  pickup_location, 
  destination, 
  date, 
  time, 
  vehicle_type, 
  price, 
  notes
) VALUES (
  auth.uid(), 
  'CUST001', 
  'Dubai Marina', 
  'Downtown Dubai', 
  CURRENT_DATE, 
  '14:30:00', 
  'Sedan', 
  150.00, 
  'Sample transaction'
);
*/
