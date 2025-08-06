import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Salon Muslimah Dina - Kecantihan Islami untuk Wanita Muslimah',
  description: 'Salon eksklusif khusus wanita muslimah di Medan dengan suasana privat, nyaman, dan sesuai syariat Islam. Perawatan kecantikan dengan sentuhan islami.',
  keywords: [
    'salon muslimah',
    'salon wanita medan',
    'perawatan islami',
    'salon syariah',
    'kecantikan halal',
    'facial muslimah',
    'henna medan',
    'salon privat'
  ],
  authors: [{ name: 'Salon Muslimah Dina' }],
  creator: 'Salon Muslimah Dina',
  publisher: 'Salon Muslimah Dina',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'http://localhost:3000',
    title: 'Salon Muslimah Dina - Kecantikan Islami untuk Wanita Muslimah',
    description: 'Salon eksklusif khusus wanita muslimah di Medan dengan suasana privat dan sesuai syariat Islam.',
    siteName: 'Salon Muslimah Dina',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Salon Muslimah Dina',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salon Muslimah Dina - Kecantikan Islami',
    description: 'Salon eksklusif khusus wanita muslimah di Medan',
    images: ['/twitter-image.jpg'],
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
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@400;700&family=Kalam:wght@300;400;700&display=swap" rel="stylesheet" />
        
        <meta name="theme-color" content="#E8B4B8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#E8B4B8" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Islamic and Indonesian cultural meta tags */}
        <meta name="google-site-verification" content="your-verification-code" />
        <meta property="business:contact_data:locality" content="Medan" />
        <meta property="business:contact_data:region" content="Sumatera Utara" />
        <meta property="business:contact_data:country_name" content="Indonesia" />
        
        {/* Structured data for business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BeautySalon',
              name: 'Salon Muslimah Dina',
              description: 'Salon eksklusif khusus wanita muslimah di Medan dengan suasana privat dan sesuai syariat Islam',
              url: 'http://localhost:3000',
              telephone: '+62-812-3456-7890',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Jl. Masjid No. 123',
                addressLocality: 'Medan',
                addressRegion: 'Sumatera Utara',
                postalCode: '20154',
                addressCountry: 'ID',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 3.5952,
                longitude: 98.6722,
              },
              openingHours: [
                'Mo-Sa 09:00-17:00',
                'Su 10:00-15:00',
              ],
              priceRange: 'Rp 75,000 - Rp 1,500,000',
              image: [
                'http://localhost:3000/salon-image-1.jpg',
                'http://localhost:3000/salon-image-2.jpg',
              ],
              sameAs: [
                'https://instagram.com/dina_salon_muslimah',
                'https://wa.me/6281234567890',
              ],
            }),
          }}
        />
      </head>
      <body className="font-kalam antialiased bg-warm-cream text-deep-charcoal">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}