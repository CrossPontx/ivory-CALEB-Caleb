-- Add design_request_messages table for persisting chat messages
CREATE TABLE IF NOT EXISTS design_request_messages (
  id SERIAL PRIMARY KEY,
  design_request_id INTEGER NOT NULL REFERENCES design_requests(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  sender_type VARCHAR(20) NOT NULL, -- 'client' or 'tech'
  message_type VARCHAR(20) NOT NULL DEFAULT 'text', -- 'text', 'image', 'file', 'design'
  content TEXT NOT NULL,
  file_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups by design_request_id
CREATE INDEX IF NOT EXISTS idx_design_request_messages_request_id ON design_request_messages(design_request_id);

-- Create index for faster lookups by sender_id
CREATE INDEX IF NOT EXISTS idx_design_request_messages_sender_id ON design_request_messages(sender_id);
