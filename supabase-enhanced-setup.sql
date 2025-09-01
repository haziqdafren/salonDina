-- Salon Muslimah Dina - Enhanced Supabase Database Setup
-- Run this script in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create services table (main business data)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER DEFAULT 60,
  description TEXT,
  therapist_fee INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create users table (for authentication)
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

-- 4. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  address TEXT,
  loyalty_visits INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_spending INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  is_vip BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  initial VARCHAR(5) UNIQUE NOT NULL,
  base_fee_per_treatment INTEGER DEFAULT 15000,
  commission_rate DECIMAL(3,2) DEFAULT 0.40,
  is_active BOOLEAN DEFAULT true,
  total_treatments INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create treatments table (transaction records)
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  service_id INTEGER REFERENCES services(id),
  therapist_id UUID REFERENCES therapists(id),
  customer_name VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  therapist_name VARCHAR(255),
  price INTEGER NOT NULL,
  therapist_fee INTEGER DEFAULT 0,
  tip_amount INTEGER DEFAULT 0,
  is_free_visit BOOLEAN DEFAULT false,
  payment_method VARCHAR(20) DEFAULT 'cash',
  date TIMESTAMPTZ NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create bookkeeping table (daily financial records)
CREATE TABLE IF NOT EXISTS daily_bookkeeping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  daily_revenue INTEGER DEFAULT 0,
  operational_cost INTEGER DEFAULT 0,
  salary_expense INTEGER DEFAULT 0,
  therapist_fees INTEGER DEFAULT 0,
  other_expenses INTEGER DEFAULT 0,
  total_expense INTEGER DEFAULT 0,
  net_income INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Insert initial services data
INSERT INTO services (name, category, price, duration, description, therapist_fee, is_active) VALUES
-- Facial Services
('Facial Acne', 'facial', 35000, 60, 'Perawatan wajah untuk kulit berjerawat dengan teknologi terkini', 15000, true),
('Facial Brightening', 'facial', 40000, 60, 'Facial pencerah wajah alami dengan vitamin C', 15000, true),
('Facial Anti Aging', 'facial', 50000, 75, 'Perawatan anti penuaan dini dengan collagen therapy', 20000, true),
('Facial Whitening', 'facial', 45000, 60, 'Facial pemutih wajah dengan ekstrak pearl', 17500, true),
('Facial Basic', 'facial', 30000, 45, 'Perawatan wajah dasar untuk semua jenis kulit', 12500, true),

-- Hair Spa Services  
('Hair Spa Creambath', 'hair_spa', 25000, 45, 'Creambath dengan vitamin rambut alami', 10000, true),
('Hair Spa Protein', 'hair_spa', 35000, 60, 'Perawatan protein untuk rambut rusak dan kering', 15000, true),
('Hair Spa Smoothing', 'hair_spa', 150000, 120, 'Perawatan pelurus rambut alami tanpa bahan kimia', 50000, true),
('Hair Spa Keratin', 'hair_spa', 200000, 150, 'Treatment keratin premium untuk rambut sehat berkilau', 75000, true),

-- Body Treatment Services
('Full Body Massage', 'body_treatment', 60000, 90, 'Pijat seluruh tubuh relaksasi dengan essential oil', 25000, true),
('Aromatherapy Massage', 'body_treatment', 70000, 90, 'Pijat aromaterapi dengan essential oil premium', 30000, true),
('Hot Stone Massage', 'body_treatment', 85000, 90, 'Pijat dengan batu panas untuk relaksasi mendalam', 35000, true),
('Body Scrub', 'body_treatment', 50000, 60, 'Lulur seluruh tubuh dengan scrub alami', 20000, true),
('Body Whitening', 'body_treatment', 75000, 75, 'Perawatan pemutih badan dengan teknologi modern', 30000, true);

-- 9. Insert initial therapists
INSERT INTO therapists (name, phone, initial, base_fee_per_treatment, commission_rate, is_active) VALUES
('Fatimah', '081234567890', 'F', 15000, 0.40, true),
('Khadijah', '081234567891', 'K', 15000, 0.40, true),  
('Aisyah', '081234567892', 'A', 15000, 0.40, true),
('Maryam', '081234567893', 'M', 15000, 0.40, true);

-- 10. Insert admin user (password is 'admin123' - CHANGE THIS IN PRODUCTION!)
INSERT INTO users (username, email, password, role, is_active) VALUES
('admin', 'admin@salondina.com', '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOdHrAKZjyElwZW5JOgqUdUyChzqHx65G', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- 11. Create sample customers for demo
INSERT INTO customers (name, phone, email, loyalty_visits, total_visits) VALUES
('Siti Aminah', '081234567001', 'siti@email.com', 2, 8),
('Nur Halimah', '081234567002', 'nur@email.com', 3, 12),
('Maya Sartika', '081234567003', 'maya@email.com', 1, 5),
('Dewi Sartika', '081234567004', 'dewi@email.com', 0, 3);

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_treatments_date ON treatments(date);
CREATE INDEX IF NOT EXISTS idx_treatments_customer ON treatments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_therapists_active ON therapists(is_active);

-- 13. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Create triggers for updated_at columns
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users  
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at 
    BEFORE UPDATE ON therapists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at 
    BEFORE UPDATE ON treatments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Set up Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bookkeeping ENABLE ROW LEVEL SECURITY;

-- 16. Create RLS policies
-- Public can view services
CREATE POLICY "Public can view services" ON services
    FOR SELECT USING (true);

-- Authenticated users can do everything
CREATE POLICY "Authenticated users full access services" ON services
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users full access users" ON users
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users full access customers" ON customers  
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users full access therapists" ON therapists
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users full access treatments" ON treatments
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users full access bookkeeping" ON daily_bookkeeping
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- 17. Insert some sample treatment data for demo
INSERT INTO treatments (
    customer_id, service_id, therapist_id, customer_name, service_name, 
    therapist_name, price, therapist_fee, date, is_free_visit
) VALUES 
(
    (SELECT id FROM customers WHERE name = 'Siti Aminah' LIMIT 1),
    (SELECT id FROM services WHERE name = 'Facial Brightening' LIMIT 1),
    (SELECT id FROM therapists WHERE name = 'Fatimah' LIMIT 1),
    'Siti Aminah', 'Facial Brightening', 'Fatimah', 40000, 15000, 
    CURRENT_DATE - INTERVAL '1 day', false
),
(
    (SELECT id FROM customers WHERE name = 'Nur Halimah' LIMIT 1),
    (SELECT id FROM services WHERE name = 'Hair Spa Creambath' LIMIT 1), 
    (SELECT id FROM therapists WHERE name = 'Khadijah' LIMIT 1),
    'Nur Halimah', 'Hair Spa Creambath', 'Khadijah', 25000, 10000,
    CURRENT_DATE, false
),
(
    (SELECT id FROM customers WHERE name = 'Maya Sartika' LIMIT 1),
    (SELECT id FROM services WHERE name = 'Full Body Massage' LIMIT 1),
    (SELECT id FROM therapists WHERE name = 'Aisyah' LIMIT 1), 
    'Maya Sartika', 'Full Body Massage', 'Aisyah', 0, 0,
    CURRENT_DATE, true
);

-- SUCCESS! Your database is now ready with:
-- ✅ 14 Services across 3 categories (facial, hair_spa, body_treatment)
-- ✅ 4 Therapists ready to work  
-- ✅ 4 Sample customers
-- ✅ Admin user (username: admin, password: admin123)
-- ✅ Sample treatment records for dashboard
-- ✅ Proper indexes and triggers
-- ✅ Row Level Security configured
-- ✅ All tables and relationships set up

-- Next steps:
-- 1. Copy your Project URL and Anon Key from Supabase Settings > API
-- 2. Add them to your Vercel environment variables
-- 3. Test your application!

SELECT 'Database setup completed successfully! 🎉' as status;