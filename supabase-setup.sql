-- Salon Muslimah Dina - Supabase Database Setup
-- Run this script in your Supabase SQL editor

-- 1. Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER DEFAULT 60,
  description TEXT,
  therapist_fee INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  address TEXT,
  loyalty_visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  service_id INTEGER REFERENCES services(id),
  therapist_name VARCHAR(255),
  price INTEGER NOT NULL,
  is_free_visit BOOLEAN DEFAULT false,
  date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert initial services data
INSERT INTO services (name, category, price, duration, description, therapist_fee, is_active) VALUES
('Facial Acne', 'facial', 35000, 60, 'Perawatan wajah untuk kulit berjerawat', 15000, true),
('Facial Brightening', 'facial', 40000, 60, 'Facial pencerah wajah alami', 15000, true),
('Facial Anti Aging', 'facial', 50000, 75, 'Perawatan anti penuaan dini', 20000, true),
('Facial Whitening', 'facial', 45000, 60, 'Facial pemutih wajah', 17500, true),
('Facial Basic', 'facial', 30000, 45, 'Perawatan wajah dasar', 12500, true),
('Hair Spa Creambath', 'hair_spa', 25000, 45, 'Creambath dengan vitamin rambut', 10000, true),
('Hair Spa Protein', 'hair_spa', 35000, 60, 'Perawatan protein untuk rambut rusak', 15000, true),
('Hair Spa Smoothing', 'hair_spa', 150000, 120, 'Perawatan pelurus rambut alami', 50000, true),
('Hair Spa Keratin', 'hair_spa', 200000, 150, 'Treatment keratin untuk rambut sehat', 75000, true),
('Full Body Massage', 'body_treatment', 60000, 90, 'Pijat seluruh tubuh relaksasi', 25000, true),
('Aromatherapy Massage', 'body_treatment', 70000, 90, 'Pijat aromaterapi dengan essential oil', 30000, true),
('Hot Stone Massage', 'body_treatment', 85000, 90, 'Pijat dengan batu panas', 35000, true),
('Body Scrub', 'body_treatment', 50000, 60, 'Lulur seluruh tubuh', 20000, true),
('Body Whitening', 'body_treatment', 75000, 75, 'Perawatan pemutih badan', 30000, true);

-- 6. Insert admin user (password is 'admin123' - change this!)
INSERT INTO users (username, email, password, role, is_active) VALUES
('admin', 'admin@salondina.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrAKZjyElwZW5JOgqUdUyChzqHx65G', 'admin', true);

-- 7. Create RLS policies (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to services
CREATE POLICY "Public can view services" ON services FOR SELECT USING (true);

-- Allow authenticated users to manage all tables
CREATE POLICY "Authenticated users can manage services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage treatments" ON treatments FOR ALL USING (auth.role() = 'authenticated');

-- 8. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON treatments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done! Your database is ready.
-- Remember to:
-- 1. Update your environment variables with Supabase credentials
-- 2. Change the admin password in production
-- 3. Configure your Vercel environment variables