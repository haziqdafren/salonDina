# 🌸 Salon Muslimah Dina

**Sistem Manajemen Salon Muslimah dengan Branding Autentik Indonesia**

Aplikasi web modern untuk mengelola salon eksklusif wanita muslimah dengan desain handcrafted yang hangat dan autentik Indonesia.

## ✨ Fitur Utama

### 🏠 Customer Website
- **Homepage dengan branding Indonesia** - Desain handcrafted dengan nuansa cork board dan paper texture
- **Showcase layanan** - Katalog lengkap perawatan dengan harga dan benefit
- **Kontak WhatsApp & Instagram** - Integrasi sosial media untuk komunikasi
- **Responsive design** - Optimal di semua perangkat
- **Islamic aesthetic** - Pattern geometris dan quote Islami

### 🔐 Admin Dashboard
- **Authentication system** - Login aman dengan NextAuth
- **Dashboard overview** - Statistik dan aktivitas terbaru
- **Manajemen booking** - (Phase 2)
- **Data pelanggan** - (Phase 2)
- **Layanan & harga** - (Phase 2)

## 🛠 Tech Stack

### Frontend & Styling
- **Next.js 14** - Framework React dengan App Router
- **TypeScript** - Type safety dan developer experience
- **Tailwind CSS** - Custom design system dengan tema Indonesia
- **Framer Motion** - Animasi smooth dan interactions
- **Google Fonts** - Amatic SC, Kalam, Dancing Script, Inter

### Backend & Database
- **Prisma ORM** - Type-safe database operations
- **SQLite** - Development database (mudah di-deploy ke PostgreSQL)
- **NextAuth** - Authentication dengan credential provider
- **bcryptjs** - Password hashing

### Development Tools
- **React Hook Form** - Form handling dengan validation
- **React Hot Toast** - Notification system
- **ESLint & Prettier** - Code quality dan formatting
- **TypeScript paths** - Import aliases untuk clean code

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd salon-muslimah-dina
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env dengan konfigurasi yang sesuai
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed data awal
npm run db:seed
```

### 4. Run Development
```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## 🔑 Login Credentials

### Admin Dashboard
- **URL**: http://localhost:3000/admin/masuk
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Penting**: Ganti password default setelah login pertama!

## 📱 Screenshots Preview

### Customer Homepage
- Greeting Islami dengan Bismillah
- Cork board texture background
- Service showcase dengan card handcrafted
- WhatsApp & Instagram integration

### Admin Login
- Form autentik dengan styling Indonesia
- Error handling dalam bahasa Indonesia
- Islamic quotes dan pattern

### Admin Dashboard  
- Welcome greeting dengan nama admin
- Quick stats cards
- Main action buttons dengan hover effects
- Recent activity feed

## 🎨 Design Philosophy

### Autentik Indonesia
- **Warna hangat**: Dusty pink, mauve, warm cream
- **Typography**: Font handwritten dan ramah Indonesia
- **Texture**: Cork board, paper, tape effects
- **Pattern**: Islamic geometric backgrounds

### Handcrafted Feel
- **Rotasi subtle**: 0.5-3 derajat untuk natural look
- **Shadow lembut**: Warm colors dengan opacity
- **Hover effects**: Magnetic buttons dengan gentle bounce
- **Animation**: Smooth transitions yang respek estetika Islam

### Indonesian Language
- **UI Text**: Semua dalam Bahasa Indonesia
- **Islamic Greetings**: Assalamu'alaikum, Bismillah
- **Professional Terms**: Vocabulary salon dan kecantikan
- **Error Messages**: User-friendly dalam bahasa Indonesia

## 📊 Database Schema

### Core Models
- **Admin** - User management sistem
- **ServiceCategory** - Kategori perawatan (Facial, Rambut, dll)
- **Service** - Individual layanan dengan harga
- **Customer** - Data pelanggan salon
- **Booking** - Sistem reservasi
- **BusinessHour** - Jam operasional salon

### Supporting Models
- **BookingService** - Junction table booking-service
- **SpecialDate** - Hari libur dan promo
- **Setting** - Konfigurasi aplikasi

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed initial data
npm run db:reset     # Reset database & re-seed
```

## 📁 Project Structure

```
salon-muslimah-dina/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   │   ├── masuk/         # Login page
│   │   └── page.tsx       # Dashboard
│   ├── api/               # API routes
│   │   └── auth/          # NextAuth endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── providers.tsx      # App providers
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── admin/            # Admin-specific components
│   ├── customer/         # Customer-facing components
│   └── layout/           # Layout components
├── lib/                  # Utilities & configurations
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma client
│   └── utils/           # Helper functions
├── prisma/              # Database
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Seed script
└── types/              # TypeScript types
    └── next-auth.d.ts  # NextAuth type extensions
```

## 🎯 Roadmap

### ✅ Phase 1 (COMPLETED)
- [x] Project foundation dengan Next.js 14
- [x] Custom design system Indonesia
- [x] Authentication system  
- [x] Database schema & seeding
- [x] Customer homepage
- [x] Admin login & dashboard skeleton

### 🚧 Phase 2 (Next)
- [ ] Booking management system
- [ ] Customer CRUD operations  
- [ ] Service management
- [ ] Calendar & scheduling
- [ ] WhatsApp integration
- [ ] Email notifications

### 🔮 Phase 3 (Future)
- [ ] Payment integration
- [ ] Reporting & analytics
- [ ] Mobile app (React Native)
- [ ] Multi-location support
- [ ] Advanced CRM features

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## 📄 License

Private project untuk Salon Muslimah Dina.

## 📞 Support

Untuk pertanyaan dan dukungan:
- 📧 Email: admin@salonmuslimah.com
- 📱 WhatsApp: +62 812-3456-7890
- 📸 Instagram: @dina_salon_muslimah

---

**بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ**

*"Sesungguhnya Allah itu indah dan menyukai keindahan"* - HR. Muslim

© 2024 Salon Muslimah Dina - Kecantikan Islami untuk Wanita Muslimah