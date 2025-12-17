-- Add new enums
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tech availability schedule
CREATE TABLE IF NOT EXISTS tech_availability (
  id SERIAL PRIMARY KEY,
  tech_profile_id INTEGER NOT NULL REFERENCES tech_profiles(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tech time off / blocked dates
CREATE TABLE IF NOT EXISTS tech_time_off (
  id SERIAL PRIMARY KEY,
  tech_profile_id INTEGER NOT NULL REFERENCES tech_profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Bookings/Appointments
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tech_profile_id INTEGER NOT NULL REFERENCES tech_profiles(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  look_id INTEGER REFERENCES looks(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  client_notes TEXT,
  tech_notes TEXT,
  service_price DECIMAL(10, 2) NOT NULL,
  service_fee DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  paid_at TIMESTAMP,
  cancellation_reason TEXT,
  cancelled_by INTEGER REFERENCES users(id),
  cancelled_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- AI-generated design breakdowns for nail techs
CREATE TABLE IF NOT EXISTS design_breakdowns (
  id SERIAL PRIMARY KEY,
  look_id INTEGER NOT NULL REFERENCES looks(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  generated_for INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  breakdown JSONB NOT NULL,
  raw_text TEXT NOT NULL,
  difficulty VARCHAR(50),
  estimated_time INTEGER,
  products_needed JSONB,
  techniques JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tech_availability_profile ON tech_availability(tech_profile_id);
CREATE INDEX IF NOT EXISTS idx_tech_time_off_profile ON tech_time_off(tech_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tech ON bookings(tech_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_design_breakdowns_look ON design_breakdowns(look_id);
CREATE INDEX IF NOT EXISTS idx_design_breakdowns_booking ON design_breakdowns(booking_id);
