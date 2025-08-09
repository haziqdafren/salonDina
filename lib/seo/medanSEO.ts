// Medan-specific SEO optimization for Salon Muslimah Dina
// Targeting local search and competitive positioning

export interface MedanSEOConfig {
  title: string
  description: string
  keywords: string[]
  localBusiness: {
    name: string
    address: string
    phone: string
    openingHours: string[]
    servingAreas: string[]
    businessType: string[]
  }
  competitiveAdvantages: string[]
  localKeywords: string[]
}

// Primary SEO configuration for Medan market
export const MEDAN_SEO_CONFIG: MedanSEOConfig = {
  title: "Salon Muslimah Dina Medan - Buka Setiap Hari 09:00-18:30 | Beauty Salon Halal Sumatera Utara",
  description: "Salon muslimah terpercaya di Medan yang buka SETIAP HARI 09:00-18:30 WIB. Layanan facial, hair spa, perawatan tubuh halal dengan therapist muslimah berpengalaman. Booking online mudah!",
  
  keywords: [
    // Primary Medan keywords
    "salon muslimah medan",
    "salon wanita muslim medan", 
    "salon halal medan",
    "beauty salon medan muslimah",
    
    // Daily availability advantage
    "salon buka setiap hari medan",
    "salon buka minggu medan",
    "salon 7 hari medan",
    "salon buka hari minggu medan sumatera utara",
    
    // Location-based
    "salon muslimah medan selayang",
    "salon medan deli",
    "salon medan johor", 
    "salon medan petisah",
    "salon medan helvetia",
    "salon sumatera utara",
    "salon north sumatra",
    
    // Service-specific
    "facial muslimah medan",
    "hair spa halal medan",
    "massage muslimah medan",
    "perawatan kecantikan islami medan",
    "therapist muslimah medan",
    "spa muslimah medan",
    
    // Competitive positioning
    "salon muslimah terbaik medan",
    "salon wanita medan terdekat",
    "booking salon online medan",
    "salon privat wanita medan"
  ],
  
  localBusiness: {
    name: "Salon Muslimah Dina",
    address: "Jl. Setia Budi No. 45B, Medan Selayang, Kota Medan, Sumatera Utara 20132",
    phone: "+62 (061) 812-3456-7890",
    openingHours: [
      "Monday 09:00-18:30",
      "Tuesday 09:00-18:30", 
      "Wednesday 09:00-18:30",
      "Thursday 09:00-18:30",
      "Friday 09:00-18:30",
      "Saturday 09:00-18:30",
      "Sunday 09:00-18:30"
    ],
    servingAreas: [
      "Medan Selayang",
      "Medan Deli", 
      "Medan Johor",
      "Medan Petisah",
      "Medan Helvetia",
      "Medan Area",
      "Medan Kota",
      "Medan Timur",
      "Medan Barat"
    ],
    businessType: [
      "Beauty Salon",
      "Spa",
      "Hair Salon",
      "Facial Treatment",
      "Muslim Women Salon",
      "Halal Beauty Services"
    ]
  },
  
  competitiveAdvantages: [
    "Buka SETIAP HARI 09:00-18:30 WIB - Satu-satunya di Medan!",
    "Tidak ada libur Minggu - Tersedia 7 hari seminggu",
    "Jam konsisten setiap hari untuk kemudahan pelanggan",
    "Booking online 24/7 meskipun salon tutup",
    "Fleksibel mengikuti waktu sholat pelanggan",
    "Therapist muslimah berpengalaman dan tersertifikasi",
    "Produk halal bersertifikat MUI",
    "Privasi terjamin 100% khusus wanita",
    "Lokasi strategis dekat RS Columbia Asia Medan",
    "Harga kompetitif dengan kualitas premium"
  ],
  
  localKeywords: [
    // Medan-specific search terms
    "salon medan",
    "salon di medan", 
    "beauty salon medan",
    "salon kecantikan medan",
    "salon wanita medan",
    
    // North Sumatra regional
    "salon sumatera utara",
    "salon sumut",
    "beauty medan",
    "kecantikan medan",
    
    // Daily availability competitive advantage
    "salon buka minggu medan",
    "salon tidak libur medan", 
    "salon 24/7 medan",
    "salon setiap hari medan",
    
    // Prayer/Islamic terms
    "salon syariah medan",
    "salon islami medan", 
    "salon hijab medan",
    "salon tertutup medan"
  ]
}

// Generate structured data for Google My Business and local SEO
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": MEDAN_SEO_CONFIG.localBusiness.name,
    "description": MEDAN_SEO_CONFIG.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Setia Budi No. 45B",
      "addressLocality": "Medan Selayang", 
      "addressRegion": "Sumatera Utara",
      "postalCode": "20132",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 3.5952,
      "longitude": 98.6722
    },
    "telephone": MEDAN_SEO_CONFIG.localBusiness.phone,
    "url": "https://salonmuslimah-medan.com",
    "image": "https://salonmuslimah-medan.com/logo.jpeg",
    "openingHours": MEDAN_SEO_CONFIG.localBusiness.openingHours,
    "servedCuisine": "Beauty Services",
    "priceRange": "$$",
    "paymentAccepted": ["Cash", "GoPay", "OVO", "DANA", "Bank Transfer", "QRIS"],
    "areaServed": MEDAN_SEO_CONFIG.localBusiness.servingAreas.map(area => ({
      "@type": "City",
      "name": area
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Beauty Services",
      "itemListElement": [
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Facial Treatment",
            "description": "Perawatan wajah dengan produk halal"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Hair Spa",
            "description": "Perawatan rambut dan kulit kepala"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Body Treatment", 
            "description": "Perawatan tubuh dan massage relaksasi"
          }
        }
      ]
    },
    "specialOpeningHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "09:00",
      "closes": "18:30",
      "validFrom": "2024-01-01",
      "validThrough": "2025-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating", 
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  }
}

// Generate meta tags for pages
export function generateMedanMetaTags(pageType: 'home' | 'services' | 'booking' | 'contact' = 'home') {
  const baseConfig = MEDAN_SEO_CONFIG
  
  const pageTitles = {
    home: baseConfig.title,
    services: `Layanan Salon Muslimah Medan - ${baseConfig.localBusiness.name} | Buka Setiap Hari`,
    booking: `Booking Online Salon Muslimah Medan - ${baseConfig.localBusiness.name} | 24/7 Reservasi`,
    contact: `Kontak & Lokasi Salon Muslimah Medan Selayang | ${baseConfig.localBusiness.name}`
  }
  
  const pageDescriptions = {
    home: baseConfig.description,
    services: `Layanan lengkap salon muslimah di Medan: facial, hair spa, body treatment, manicure pedicure. Buka setiap hari 09:00-18:30. Therapist muslimah, produk halal, harga terjangkau.`,
    booking: `Booking online salon muslimah Medan dengan mudah! Tersedia slot setiap hari 09:00-18:30. Konfirmasi langsung via WhatsApp. Pembayaran GoPay, OVO, DANA, transfer bank.`,
    contact: `Alamat: ${baseConfig.localBusiness.address}. Telp: ${baseConfig.localBusiness.phone}. Buka SETIAP HARI 09:00-18:30 WIB. Satu-satunya salon muslimah di Medan yang tidak libur!`
  }
  
  return {
    title: pageTitles[pageType],
    description: pageDescriptions[pageType],
    keywords: baseConfig.keywords.join(', '),
    
    // Open Graph
    ogTitle: pageTitles[pageType],
    ogDescription: pageDescriptions[pageType],
    ogImage: "/logo.jpeg",
    ogUrl: `https://salonmuslimah-medan.com${pageType === 'home' ? '' : '/' + pageType}`,
    
    // Twitter Card
    twitterCard: "summary_large_image",
    twitterTitle: pageTitles[pageType],
    twitterDescription: pageDescriptions[pageType],
    twitterImage: "/logo.jpeg",
    
    // Local SEO
    geoRegion: "ID-SU", // North Sumatra
    geoPlacename: "Medan, Sumatera Utara", 
    geoPosition: "3.5952;98.6722",
    icbm: "3.5952, 98.6722"
  }
}

// Generate FAQ schema for local SEO
export function generateMedanFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Apakah Salon Muslimah Dina buka setiap hari?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "Ya! Kami buka SETIAP HARI dari jam 09:00 sampai 18:30 WIB. Tidak ada libur Minggu atau hari lainnya. Kami adalah satu-satunya salon muslimah di Medan yang beroperasi 7 hari seminggu untuk kemudahan pelanggan."
        }
      },
      {
        "@type": "Question",
        "name": "Di mana lokasi Salon Muslimah Dina Medan?", 
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kami berlokasi di Jl. Setia Budi No. 45B, Medan Selayang, Kota Medan, Sumatera Utara 20132. Dekat dengan RS Columbia Asia Medan, mudah dijangkau dari berbagai area di Medan."
        }
      },
      {
        "@type": "Question",
        "name": "Apakah bisa booking online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tentu saja! Kami menyediakan sistem booking online 24/7. Anda bisa pilih layanan, tanggal, dan waktu, lalu konfirmasi via WhatsApp. Pembayaran bisa dengan GoPay, OVO, DANA, QRIS, atau transfer bank."
        }
      },
      {
        "@type": "Question", 
        "name": "Apakah semua therapist muslimah?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ya, semua therapist kami adalah wanita muslimah yang berpengalaman dan tersertifikasi. Kami memastikan privasi dan kenyamanan sesuai syariat Islam dengan lingkungan eksklusif khusus wanita."
        }
      },
      {
        "@type": "Question",
        "name": "Produk yang digunakan halal?", 
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Semua produk perawatan yang kami gunakan telah bersertifikat halal MUI. Kami sangat memperhatikan aspek halal dan thoyib dalam setiap layanan untuk kenyamanan pelanggan muslimah."
        }
      }
    ]
  }
}

// Keywords for content optimization
export const MEDAN_CONTENT_KEYWORDS = {
  primary: [
    "salon muslimah medan",
    "buka setiap hari", 
    "09:00-18:30",
    "therapist muslimah",
    "produk halal"
  ],
  
  secondary: [
    "medan selayang",
    "sumatera utara", 
    "booking online",
    "gopay ovo dana",
    "tidak libur minggu"
  ],
  
  longtail: [
    "salon muslimah medan buka minggu",
    "salon wanita muslim medan selayang", 
    "beauty salon halal sumatera utara",
    "salon privat wanita medan setiap hari",
    "booking online salon muslimah medan"
  ]
}