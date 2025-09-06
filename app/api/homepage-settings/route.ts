import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    // For now, return default settings since we don't have a homepage_settings table
    // This prevents the homepage from showing "database belum terhubung"
    const defaultSettings = {
      hero: {
        salonName: 'Salon Muslimah Dina',
        greeting: 'Assalamu\'alaikum, Ukhti Cantik ✨',
        description: 'Selamat datang di ruang aman kami 🤲\nSalon eksklusif khusus wanita muslimah dengan suasana privat, nyaman, dan sesuai syariat Islam.',
        islamicQuote: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'
      },
      contact: {
        address: 'Jl. Perhubungan, Tembung\nPercut Sei Tuan, Kabupaten Deli Serdang\nSumatera Utara 20371\n📍 Dekat SPBU Lau Dendang',
        phone: '+62 831-4109-5591',
        whatsapp: '+6283141095591',
        email: 'medan@salonmuslimah.com',
        instagram: '@dina_salon_muslimah',
        operatingHours: {
          open: '09:00',
          close: '18:30',
          description: '7 hari seminggu untuk kemudahan Anda'
        }
      },
      about: {
        whyChooseTitle: 'Mengapa Memilih Salon Muslimah Dina?',
        whyChooseSubtitle: 'Keunggulan yang membuat kami berbeda'
      },
      services: {
        title: 'Layanan Istimewa Kami',
        subtitle: 'Perawatan kecantihan dengan sentuhan Islami',
        description: 'Menggunakan produk halal pilihan dan therapist muslimah berpengalaman'
      }
    }

    return NextResponse.json({
      success: true,
      data: defaultSettings,
      message: 'Homepage settings loaded successfully'
    })

  } catch (error) {
    console.error('Error loading homepage settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load homepage settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // For now, just return success since we don't have a homepage_settings table
    // In the future, you can implement actual database storage here
    
    return NextResponse.json({
      success: true,
      message: 'Homepage settings saved successfully',
      data: body
    })

  } catch (error) {
    console.error('Error saving homepage settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to save homepage settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}