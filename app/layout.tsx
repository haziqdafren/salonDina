import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Dancing_Script, Kalam } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

// Optimize font loading - v0.2.0 custom auth system
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair'
})

const dancing = Dancing_Script({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dancing'
})

const kalam = Kalam({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '700'],
  variable: '--font-kalam'
})

export const metadata: Metadata = {
  title: 'Salon Muslimah Dina - Perawatan Kecantikan Islami di Medan',
  description: 'Salon khusus wanita muslimah di Medan dengan perawatan halal dan suasana nyaman. Buka setiap hari 09:00-18:30 WIB. Facial, hair spa, body treatment dengan produk halal.',
  keywords: ['salon muslimah medan', 'perawatan wanita islam', 'facial halal medan', 'salon khusus muslimah'],
  authors: [{ name: 'Salon Muslimah Dina' }],
  creator: 'Salon Muslimah Dina',
  publisher: 'Salon Muslimah Dina',
  metadataBase: new URL('https://salon-dina-iota.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://salon-dina-iota.vercel.app',
    title: 'Salon Muslimah Dina - Perawatan Kecantikan Islami di Medan',
    description: 'Salon khusus wanita muslimah di Medan dengan perawatan halal dan suasana nyaman. Buka setiap hari 09:00-18:30 WIB.',
    siteName: 'Salon Muslimah Dina',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Salon Muslimah Dina Medan - Buka Setiap Hari',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salon Muslimah Dina - Perawatan Kecantikan Islami di Medan',
    description: 'Salon khusus wanita muslimah di Medan dengan perawatan halal dan suasana nyaman.',
    images: ['/logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // manifest: '/manifest.json', // Temporarily disabled due to deployment issues
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'geo.region': 'ID-SU',
    'geo.placename': 'Medan, Sumatera Utara',
    'geo.position': '3.5952;98.6722',
    'ICBM': '3.5952, 98.6722',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.jpeg" as="image" type="image/jpeg" />
        
        <meta name="theme-color" content="#E8B4B8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#E8B4B8" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Medan-specific meta tags */}
        <meta name="google-site-verification" content="your-verification-code" />
        <meta property="business:contact_data:locality" content="Medan Selayang" />
        <meta property="business:contact_data:region" content="Sumatera Utara" />
        <meta property="business:contact_data:country_name" content="Indonesia" />
        <meta name="geo.region" content="ID-SU" />
        <meta name="geo.placename" content="Medan, Sumatera Utara" />
        <meta name="geo.position" content="3.5952;98.6722" />
        <meta name="ICBM" content="3.5952, 98.6722" />
        
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              "name": "Salon Muslimah Dina",
              "description": "Salon khusus wanita muslimah di Medan",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Medan",
                "addressRegion": "Sumatera Utara",
                "addressCountry": "ID"
              },
              "openingHours": "Mo-Su 09:00-18:30",
              "telephone": "+6287869590802"
            }),
          }}
        />
      </head>
      <body className={`${kalam.variable} ${inter.variable} ${playfair.variable} ${dancing.variable} font-kalam antialiased bg-warm-cream text-deep-charcoal`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}