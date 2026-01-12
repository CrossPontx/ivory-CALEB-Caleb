-- Add guest booking fields to support bookings from V0 websites without user accounts
ALTER TABLE bookings 
  ALTER COLUMN client_id DROP NOT NULL,
  ADD COLUMN guest_email VARCHAR(255),
  ADD COLUMN guest_phone VARCHAR(50),
  ADD COLUMN guest_name VARCHAR(255);

-- Add constraint to ensure either client_id or guest info is provided
ALTER TABLE bookings 
  ADD CONSTRAINT check_client_or_guest 
  CHECK (
    (client_id IS NOT NULL) OR 
    (guest_email IS NOT NULL AND guest_name IS NOT NULL)
  );

-- Add index for guest email lookups
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email) WHERE guest_email IS NOT NULL;