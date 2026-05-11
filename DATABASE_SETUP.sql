-- Run this SQL in your Supabase database to set up the authentication system

-- Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX idx_users_username ON users(username);

-- Modify request_messages table to include user_id
ALTER TABLE request_messages 
ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_agent VARCHAR(200),
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(60);

-- Update the name column to allow NULL since we might have old messages
ALTER TABLE request_messages ALTER COLUMN name DROP NOT NULL;

-- No RLS policies needed - using custom JWT auth with service role key
-- The service role key has full access to the database

