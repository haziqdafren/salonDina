// Complete Real Treatment Database for Salon Muslimah Dina - Medan
// All pricing and treatments based on actual salon menu

export const treatmentCategories = {
  waxing: {
    title: "Penghilang Bulu (Wax)",
    icon: "🌿",
    description: "Perawatan waxing profesional dengan produk halal",
    items: [
      { id: 1, name: "Wax Ketiak", hargaNormal: 30000, hargaPromo: null, duration: 30, popularity: 8 },
      { id: 2, name: "Wax Tangan", hargaNormal: 50000, hargaPromo: null, duration: 45, popularity: 6 },
      { id: 3, name: "Wax Kaki", hargaNormal: 60000, hargaPromo: null, duration: 60, popularity: 7 },
      { id: 4, name: "Wax Tangan + Kaki", hargaNormal: 100000, hargaPromo: null, duration: 90, popularity: 9 },
      { id: 5, name: "Wax Ketiak Tangan Kaki", hargaNormal: 120000, hargaPromo: null, duration: 120, popularity: 5 }
    ]
  },
  perawatanTanganKaki: {
    title: "Perawatan Tangan & Kaki",
    icon: "💅",
    description: "Perawatan lengkap untuk tangan dan kaki yang cantik",
    items: [
      { id: 6, name: "Refleksi Kaki", hargaNormal: 45000, hargaPromo: null, duration: 60, popularity: 7 },
      { id: 7, name: "Refleksi Kaki + Creambath", hargaNormal: 85000, hargaPromo: null, duration: 120, popularity: 6 },
      { id: 8, name: "Refleksi Kaki + Hair SPA", hargaNormal: 120000, hargaPromo: null, duration: 150, popularity: 8 },
      { id: 9, name: "Refleksi Kaki + Massage Kaki", hargaNormal: 60000, hargaPromo: null, duration: 90, popularity: 5 },
      { id: 10, name: "Menicure", hargaNormal: 75000, hargaPromo: null, duration: 60, popularity: 9 },
      { id: 11, name: "Pedicure", hargaNormal: 100000, hargaPromo: null, duration: 75, popularity: 8 },
      { id: 12, name: "Menicure + Pedicure", hargaNormal: 175000, hargaPromo: 150000, duration: 120, popularity: 10 },
      { id: 13, name: "Callus", hargaNormal: 50000, hargaPromo: null, duration: 45, popularity: 4 }
    ]
  },
  bekam: {
    title: "Terapi Bekam",
    icon: "🩸",
    description: "Terapi bekam sesuai sunnah dengan peralatan steril",
    items: [
      { id: 14, name: "Bekam Tubuh", hargaNormal: 70000, hargaPromo: null, duration: 90, popularity: 6 },
      { id: 15, name: "Bekam Massage", hargaNormal: 170000, hargaPromo: 140000, duration: 120, popularity: 7 },
      { id: 16, name: "Bekam Creambath", hargaNormal: 110000, hargaPromo: 100000, duration: 150, popularity: 5 },
      { id: 17, name: "Bekam Hair SPA", hargaNormal: 145000, hargaPromo: 130000, duration: 180, popularity: 8 },
      { id: 18, name: "Bekam Massage + Creambath", hargaNormal: 210000, hargaPromo: 170000, duration: 210, popularity: 6 },
      { id: 19, name: "Bekam Massage + SPA Rambut", hargaNormal: 245000, hargaPromo: 200000, duration: 240, popularity: 7 }
    ]
  },
  perawatanTubuh: {
    title: "Perawatan Tubuh",
    icon: "🧴",
    description: "Perawatan tubuh relaksasi dengan produk alami",
    items: [
      { id: 20, name: "Body Massage", hargaNormal: 100000, hargaPromo: null, duration: 90, popularity: 9 },
      { id: 21, name: "Lulur", hargaNormal: 90000, hargaPromo: null, duration: 75, popularity: 8 },
      { id: 22, name: "Massage + Lulur", hargaNormal: 190000, hargaPromo: 170000, duration: 150, popularity: 10 },
      { id: 23, name: "Massage + Lulur + Sauna", hargaNormal: 225000, hargaPromo: 200000, duration: 180, popularity: 8 },
      { id: 24, name: "Massage + Lulur + Sauna + SPA", hargaNormal: 275000, hargaPromo: 240000, duration: 210, popularity: 7 },
      { id: 25, name: "Full Package + Rempah Ratus", hargaNormal: 315000, hargaPromo: 270000, duration: 240, popularity: 6 },
      { id: 26, name: "Rempah Ratus", hargaNormal: 40000, hargaPromo: null, duration: 30, popularity: 5 },
      { id: 27, name: "Sauna", hargaNormal: 35000, hargaPromo: null, duration: 30, popularity: 6 },
      { id: 28, name: "SPA (Mandi Susu/Rempah)", hargaNormal: 50000, hargaPromo: null, duration: 45, popularity: 7 }
    ]
  },
  perawatanWajah: {
    title: "Perawatan Wajah",
    icon: "✨",
    description: "Facial profesional dengan teknologi terkini",
    items: [
      { id: 29, name: "Facial Microdermabrasi", hargaNormal: 130000, hargaPromo: null, duration: 90, popularity: 8 },
      { id: 30, name: "Facial Whitening (Thibbun Nabawi)", hargaNormal: 110000, hargaPromo: null, duration: 75, popularity: 9 },
      { id: 31, name: "Facial Chemical Peeling", hargaNormal: 140000, hargaPromo: null, duration: 90, popularity: 7 },
      { id: 32, name: "Facial Detox", hargaNormal: 180000, hargaPromo: null, duration: 105, popularity: 10 },
      { id: 33, name: "Facial Detox + PDT", hargaNormal: 230000, hargaPromo: 200000, duration: 120, popularity: 9 },
      { id: 34, name: "Facial Peeling PDT", hargaNormal: 190000, hargaPromo: 180000, duration: 105, popularity: 8 },
      { id: 35, name: "Facial Dherma PDT", hargaNormal: 170000, hargaPromo: 150000, duration: 90, popularity: 7 },
      { id: 36, name: "Totok Wajah", hargaNormal: 40000, hargaPromo: 35000, duration: 45, popularity: 6 },
      { id: 37, name: "Totok Masker Wajah", hargaNormal: 60000, hargaPromo: 50000, duration: 60, popularity: 7 },
      { id: 38, name: "Facial Lumiface", hargaNormal: 200000, hargaPromo: 150000, duration: 90, popularity: 8 }
    ]
  },
  facialLumiface: {
    title: "Facial + Lumiface Treatment",
    icon: "💎",
    description: "Treatment premium dengan teknologi Lumiface",
    items: [
      { id: 39, name: "Totok Wajah + Lumiface", hargaNormal: 65000, hargaPromo: 55000, duration: 75, popularity: 6 },
      { id: 40, name: "Facial Lumiface", hargaNormal: 200000, hargaPromo: 140000, duration: 90, popularity: 9 },
      { id: 41, name: "Facial Derma + Lumiface", hargaNormal: 160000, hargaPromo: 150000, duration: 105, popularity: 8 },
      { id: 42, name: "Facial Peeling + Lumiface", hargaNormal: 170000, hargaPromo: 160000, duration: 105, popularity: 7 },
      { id: 43, name: "Facial Detox + Lumiface", hargaNormal: 210000, hargaPromo: 180000, duration: 120, popularity: 9 },
      { id: 44, name: "Facial Derma + PDT + Lumiface", hargaNormal: 200000, hargaPromo: 180000, duration: 135, popularity: 8 },
      { id: 45, name: "Facial Peeling + PDT + Lumiface", hargaNormal: 220000, hargaPromo: 200000, duration: 135, popularity: 7 },
      { id: 46, name: "Facial Detox + PDT + Lumiface", hargaNormal: 260000, hargaPromo: 220000, duration: 150, popularity: 8 }
    ]
  },
  perawatanRambut: {
    title: "Perawatan Rambut",
    icon: "💇‍♀️",
    description: "Perawatan rambut lengkap dengan produk premium",
    items: [
      { id: 47, name: "Gunting Rambut", hargaNormal: 20000, hargaPromo: null, duration: 30, popularity: 10 },
      { id: 48, name: "Babyliss Biasa", hargaNormal: 30000, hargaPromo: null, duration: 45, popularity: 8 },
      { id: 49, name: "Babyliss Kreasi", hargaNormal: 50000, hargaPromo: null, duration: 60, popularity: 7 },
      { id: 50, name: "Cuci + Babyliss", hargaNormal: 50000, hargaPromo: null, duration: 60, popularity: 9 },
      { id: 51, name: "Creambath Buah", hargaNormal: 40000, hargaPromo: null, duration: 60, popularity: 9 },
      { id: 52, name: "Nano Hair Spa", hargaNormal: 100000, hargaPromo: 80000, duration: 90, popularity: 10 },
      { id: 53, name: "Creambath + Babyliss", hargaNormal: 70000, hargaPromo: null, duration: 90, popularity: 8 },
      { id: 54, name: "Hair SPA", hargaNormal: 75000, hargaPromo: null, duration: 90, popularity: 10 },
      { id: 55, name: "Hair Spa Anak", hargaNormal: 50000, hargaPromo: null, duration: 60, popularity: 7 },
      { id: 56, name: "Scrub + Hair SPA", hargaNormal: 110000, hargaPromo: null, duration: 120, popularity: 8 },
      { id: 57, name: "Pelurusan/Smoothing", hargaNormal: 150000, hargaPromo: null, duration: 180, popularity: 9 },
      { id: 58, name: "Smoothing Sutera", hargaNormal: 200000, hargaPromo: null, duration: 210, popularity: 8 },
      { id: 59, name: "Pewarnaan Rambut", hargaNormal: 200000, hargaPromo: null, duration: 180, popularity: 6 },
      { id: 60, name: "Toning/Hena Rambut", hargaNormal: 150000, hargaPromo: null, duration: 120, popularity: 7 },
      { id: 61, name: "Perawatan Kutu Anak", hargaNormal: 80000, hargaPromo: null, duration: 90, popularity: 4 },
      { id: 62, name: "Perawatan Kutu Dewasa", hargaNormal: 110000, hargaPromo: null, duration: 120, popularity: 3 }
    ]
  },
  japaneseHeadSpa: {
    title: "Japanese Head SPA",
    icon: "🌸",
    description: "Treatment premium khas Jepang untuk relaksasi total",
    items: [
      { id: 63, name: "Japanese Head SPA + Totok + Pijat", hargaNormal: 200000, hargaPromo: 160000, duration: 150, popularity: 9 },
      { id: 64, name: "Japanese + Scrub Ketombe + Totok + Pijat", hargaNormal: 270000, hargaPromo: 200000, duration: 180, popularity: 8 },
      { id: 65, name: "Japanese + Totok + Massage + Pijat", hargaNormal: 300000, hargaPromo: 250000, duration: 210, popularity: 9 },
      { id: 66, name: "Japanese + Totok PDT + Massage + Pijat", hargaNormal: 395000, hargaPromo: 300000, duration: 240, popularity: 7 },
      { id: 67, name: "Japanese + Facial + PDT + Massage + Pijat", hargaNormal: 490000, hargaPromo: 350000, duration: 270, popularity: 8 },
      { id: 68, name: "Japanese Full Package Premium", hargaNormal: 580000, hargaPromo: 400000, duration: 300, popularity: 6 }
    ]
  },
  paketPengantin: {
    title: "Paket Pengantin",
    icon: "👰‍♀️",
    description: "Paket lengkap untuk hari bahagia Anda",
    items: [
      { 
        id: 69, 
        name: "Paket Pengantin Lengkap", 
        hargaNormal: 475000, 
        hargaPromo: 400000, 
        duration: 360, 
        popularity: 10, 
        includes: ["Hair SPA", "Totok Masker", "PDT", "Massage", "Lulur", "Sauna", "SPA", "Essential Oil", "Serum Tubuh", "Serum Rambut", "Masker Tubuh", "Ratus"] 
      }
    ]
  },
  paketFull: {
    title: "Paket Full Treatment",
    icon: "🎁",
    description: "Paket hemat dengan berbagai keuntungan",
    items: [
      { 
        id: 70, 
        name: "Paket Full Premium", 
        hargaNormal: 520000, 
        hargaPromo: 400000, 
        duration: 360, 
        popularity: 8,
        includes: ["Hair SPA", "Facial Derma", "Sauna", "SPA", "Massage", "Lulur", "Ratus"] 
      }
    ]
  }
};

// Helper functions
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp');
};

export const getAllTreatments = () => {
  const allTreatments: any[] = [];
  Object.values(treatmentCategories).forEach(category => {
    category.items.forEach(item => {
      allTreatments.push({
        ...item,
        category: category.title,
        categoryIcon: category.icon,
        categoryDescription: category.description
      });
    });
  });
  return allTreatments;
};

export const getPopularTreatments = () => {
  return getAllTreatments()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 10);
};

export const getPromoTreatments = () => {
  return getAllTreatments()
    .filter(item => item.hargaPromo !== null);
};

export const calculateTotalDuration = (treatments: any[]) => {
  return treatments.reduce((total, treatment) => total + treatment.duration, 0);
};

export const calculateTotalPrice = (treatments: any[]) => {
  return treatments.reduce((total, treatment) => {
    return total + (treatment.hargaPromo || treatment.hargaNormal);
  }, 0);
};