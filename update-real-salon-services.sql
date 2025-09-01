-- Update Salon Muslimah Dina with Real Services Data
-- Run this after adding Supabase environment variables to Vercel

-- First, clear existing sample services
DELETE FROM services;

-- Reset the sequence to start from 1
ALTER SEQUENCE services_id_seq RESTART WITH 1;

-- Insert real salon services based on actual menu
INSERT INTO services (name, category, price, duration, description, therapist_fee, is_active, popularity) VALUES

-- Waxing Services
('Ketiak', 'waxing', 30000, 30, 'Perawatan waxing profesional dengan produk halal', 12000, true, 8),
('Tangan', 'waxing', 50000, 45, 'Waxing tangan lengkap', 20000, true, 6),
('Kaki', 'waxing', 60000, 60, 'Waxing kaki lengkap', 24000, true, 7),
('Tangan + Kaki', 'waxing', 100000, 90, 'Paket waxing tangan dan kaki', 40000, true, 9),
('Ketiak Tangan Kaki', 'waxing', 120000, 120, 'Paket lengkap waxing seluruh tubuh', 48000, true, 5),

-- Perawatan Tangan & Kaki
('Refleksi Kaki', 'perawatan_tangan_kaki', 45000, 60, 'Pijat refleksi kaki untuk kesehatan', 18000, true, 7),
('Refleksi Kaki + Creambath', 'perawatan_tangan_kaki', 85000, 120, 'Kombinasi refleksi kaki dan creambath', 34000, true, 6),
('Refleksi Kaki + Hair SPA', 'perawatan_tangan_kaki', 120000, 150, 'Paket refleksi kaki dengan hair spa premium', 48000, true, 8),
('Refleksi Kaki + Massage Kaki', 'perawatan_tangan_kaki', 60000, 90, 'Refleksi dan massage kaki rileks', 24000, true, 5),
('Menicure', 'perawatan_tangan_kaki', 75000, 60, 'Perawatan kuku tangan profesional', 30000, true, 9),
('Pedicure', 'perawatan_tangan_kaki', 100000, 75, 'Perawatan kuku kaki lengkap', 40000, true, 8),
('Menicure + Pedicure', 'perawatan_tangan_kaki', 150000, 120, 'Paket hemat menicure dan pedicure', 60000, true, 10),
('Callus', 'perawatan_tangan_kaki', 50000, 45, 'Penghilangan kapalan kaki', 20000, true, 4),

-- Terapi Bekam
('Bekam Tubuh', 'bekam', 70000, 90, 'Terapi bekam sesuai sunnah dengan peralatan steril', 28000, true, 6),
('Bekam Massage', 'bekam', 140000, 120, 'Kombinasi bekam dan massage rileks', 56000, true, 7),
('Bekam Creambath', 'bekam', 100000, 150, 'Bekam dengan creambath rambut', 40000, true, 5),
('Bekam Hair SPA', 'bekam', 130000, 180, 'Bekam dengan hair spa premium', 52000, true, 8),
('Bekam Massage + Creambath', 'bekam', 170000, 210, 'Paket bekam, massage, dan creambath', 68000, true, 6),
('Bekam Massage + SPA Rambut', 'bekam', 200000, 240, 'Paket bekam, massage, dan spa rambut', 80000, true, 7),

-- Perawatan Tubuh
('Body Massage', 'perawatan_tubuh', 100000, 90, 'Pijat seluruh tubuh dengan essential oil', 40000, true, 9),
('Lulur', 'perawatan_tubuh', 90000, 75, 'Lulur tradisional untuk kulit halus', 36000, true, 8),
('Massage + Lulur', 'perawatan_tubuh', 170000, 150, 'Kombinasi massage dan lulur lengkap', 68000, true, 10),
('Massage + Lulur + Sauna', 'perawatan_tubuh', 200000, 180, 'Paket massage, lulur, dan sauna', 80000, true, 8),
('Massage + Lulur + Sauna + SPA', 'perawatan_tubuh', 240000, 210, 'Paket lengkap perawatan tubuh', 96000, true, 7),
('Massage + Lulur + Sauna + SPA + Rempah Ratus', 'perawatan_tubuh', 270000, 240, 'Paket premium dengan rempah ratus', 108000, true, 6),
('Rempah Ratus', 'perawatan_tubuh', 40000, 30, 'Terapi rempah tradisional', 16000, true, 5),
('Sauna', 'perawatan_tubuh', 35000, 30, 'Sauna untuk detoksifikasi tubuh', 14000, true, 6),
('SPA (Mandi Susu/Mandi Rempah)', 'perawatan_tubuh', 50000, 45, 'Mandi spa dengan susu atau rempah', 20000, true, 7),

-- Perawatan Wajah
('Facial Microdermabrasi', 'perawatan_wajah', 130000, 90, 'Facial dengan teknologi microdermabrasi', 52000, true, 8),
('Facial Whitening (Thibbun Nabawi)', 'perawatan_wajah', 110000, 75, 'Facial pemutih sesuai thibbun nabawi', 44000, true, 9),
('Facial Chemical Peeling', 'perawatan_wajah', 140000, 90, 'Facial peeling untuk regenerasi kulit', 56000, true, 7),
('Facial Detox', 'perawatan_wajah', 180000, 105, 'Facial detox untuk kulit sehat', 72000, true, 10),
('Facial Detox + PDT', 'perawatan_wajah', 200000, 120, 'Facial detox dengan PDT therapy', 80000, true, 9),
('Facial Peeling PDT', 'perawatan_wajah', 180000, 105, 'Facial peeling dengan PDT', 72000, true, 8),
('Facial Dherma PDT', 'perawatan_wajah', 150000, 90, 'Facial derma dengan PDT therapy', 60000, true, 7),
('Totok Wajah', 'perawatan_wajah', 35000, 45, 'Pijat totok wajah tradisional', 14000, true, 6),
('Totok Masker Wajah', 'perawatan_wajah', 50000, 60, 'Totok wajah dengan masker', 20000, true, 7),
('Facial Lumiface', 'perawatan_wajah', 150000, 90, 'Facial dengan teknologi Lumiface', 60000, true, 8),

-- Perawatan Rambut
('Gunting Rambut', 'perawatan_rambut', 20000, 30, 'Potong rambut profesional', 8000, true, 10),
('Babyliss Biasa', 'perawatan_rambut', 30000, 45, 'Styling rambut dengan babyliss', 12000, true, 8),
('Babyliss Kreasi', 'perawatan_rambut', 50000, 60, 'Styling rambut kreatif babyliss', 20000, true, 7),
('Cuci + Babyliss', 'perawatan_rambut', 50000, 60, 'Keramas dan styling babyliss', 20000, true, 9),
('Creambath Buah', 'perawatan_rambut', 40000, 60, 'Creambath dengan ekstrak buah', 16000, true, 9),
('Nano Hair Spa', 'perawatan_rambut', 80000, 90, 'Hair spa dengan teknologi nano', 32000, true, 10),
('Creambath + Babyliss', 'perawatan_rambut', 70000, 90, 'Paket creambath dan babyliss', 28000, true, 8),
('Hair SPA', 'perawatan_rambut', 75000, 90, 'Spa rambut premium', 30000, true, 10),
('Hair Spa Anak', 'perawatan_rambut', 50000, 60, 'Hair spa khusus anak-anak', 20000, true, 7),
('Scrub + Hair SPA', 'perawatan_rambut', 110000, 120, 'Scrub kepala dengan hair spa', 44000, true, 8),
('Pelurusan/Smoothing', 'perawatan_rambut', 150000, 180, 'Pelurusan rambut alami', 60000, true, 9),
('Smoothing Sutera', 'perawatan_rambut', 200000, 210, 'Smoothing premium dengan sutera', 80000, true, 8),
('Pewarnaan Rambut', 'perawatan_rambut', 200000, 180, 'Pewarnaan rambut profesional', 80000, true, 6),
('Toning/Hena Rambut', 'perawatan_rambut', 150000, 120, 'Toning atau henna rambut', 60000, true, 7),
('Perawatan Kutu Anak', 'perawatan_rambut', 80000, 90, 'Perawatan kutu khusus anak', 32000, true, 4),
('Perawatan Kutu Dewasa', 'perawatan_rambut', 110000, 120, 'Perawatan kutu untuk dewasa', 44000, true, 3),

-- Japanese Head SPA
('Japanese Head SPA + Totok Wajah + Putli Massage', 'japanese_head_spa', 160000, 150, 'Treatment premium khas Jepang', 64000, true, 9),
('Japanese Head SPA + Scrub Ketombe + Totok Wajah + Putli Massage', 'japanese_head_spa', 200000, 180, 'Japanese spa dengan scrub ketombe', 80000, true, 8),
('Japanese Head SPA + Totok Wajah + Massage + Putli Massage', 'japanese_head_spa', 250000, 210, 'Japanese spa dengan massage lengkap', 100000, true, 9),
('Japanese Head SPA + Totok Masker PDT + Massage + Putli Massage', 'japanese_head_spa', 300000, 240, 'Japanese spa dengan PDT therapy', 120000, true, 7),
('Japanese Head SPA + Facial + PDT + Massage + Putli Massage', 'japanese_head_spa', 350000, 270, 'Japanese spa dengan facial PDT', 140000, true, 8),
('Japanese Head SPA + Facial + Pdt + Massage + Lulur + Putli Massage', 'japanese_head_spa', 400000, 300, 'Japanese spa paket lengkap premium', 160000, true, 6),

-- Paket Pengantin
('Paket Pengantin Premium', 'paket_pengantin', 400000, 360, 'Paket lengkap untuk hari bahagia dengan Hair SPA, Totok masker, PDT, Massage, Lulur, Sauna, SPA, Essential Oil, Serum Tubuh, Serum Rambut, Masker Tubuh, Ratus', 160000, true, 10),

-- Paket Full
('Paket Full Treatment', 'paket_full', 400000, 360, 'Hair SPA + Facial Derma + Sauna + SPA + Massage + Lulur + Ratus', 160000, true, 8);

-- Update therapist fees based on 40% commission
UPDATE services SET therapist_fee = ROUND(price * 0.4);

-- Create categories if they don't exist in a lookup table (optional)
-- You can use this for better categorization in the admin panel

SELECT 'Real salon services data updated successfully! 🎉' as status,
       COUNT(*) as total_services 
FROM services;