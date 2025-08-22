import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Dancing_Script, Kalam } from 'next/font/google'
import { Providers } from './providers'
import { generateMedanMetaTags, generateLocalBusinessSchema } from '../lib/seo/medanSEO'
import './globals.css'

// Optimize font loading
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

// Generate Medan-optimized SEO metadata
const medanSEO = generateMedanMetaTags('home')

export const metadata: Metadata = {
  title: medanSEO.title,
  description: medanSEO.description,
  keywords: medanSEO.keywords.split(', '),
  authors: [{ name: 'Salon Muslimah Dina' }],
  creator: 'Salon Muslimah Dina',
  publisher: 'Salon Muslimah Dina',
  metadataBase: new URL('https://salonmuslimah-medan.com'),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: medanSEO.ogUrl,
    title: medanSEO.ogTitle,
    description: medanSEO.ogDescription,
    siteName: 'Salon Muslimah Dina',
    images: [
      {
        url: medanSEO.ogImage,
        width: 1200,
        height: 630,
        alt: 'Salon Muslimah Dina Medan - Buka Setiap Hari',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: medanSEO.twitterTitle,
    description: medanSEO.twitterDescription,
    images: [medanSEO.twitterImage],
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
  other: {
    'geo.region': medanSEO.geoRegion,
    'geo.placename': medanSEO.geoPlacename,
    'geo.position': medanSEO.geoPosition,
    'ICBM': medanSEO.icbm,
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
        <link rel="preload" href="/logo.jpeg" as="image" />
        
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
        
        {/* Medan Local Business Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema()),
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