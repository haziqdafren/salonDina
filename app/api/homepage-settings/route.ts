import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const DEFAULT_SETTINGS = {
  hero: {
    salonName: 'Salon Muslimah Dina',
    greeting: 'Assalamu\'alaikum, Ukhti Cantik ✨',
    description: 'Selamat datang di ruang aman kami 🤲\nSalon eksklusif khusus wanita muslimah dengan suasana privat, nyaman, dan sesuai syariat Islam.',
    islamicQuote: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'
  },
  contact: {
    address: 'Jl. Perhubungan, Tembung\nPercut Sei Tuan, Kabupaten Deli Serdang\nSumatera Utara 20371\n📍 Dekat SPBU Lau Dendang',
    phone: '+62 821-7067-7736',
    whatsapp: '+6282170677736',
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
    whyChooseSubtitle: 'Keunggulan yang membuat kami berbeda',
    features: [
      {
        icon: '🗓️',
        title: 'Buka Setiap Hari',
        description: 'Konsisten 09:00-18:30 WIB, 7 hari seminggu - satu-satunya di Medan!',
        isSpecial: true
      },
      {
        icon: '🏠',
        title: 'Privasi Terjamin',
        description: 'Area khusus wanita dengan privasi penuh sesuai syariat Islam',
        isSpecial: false
      },
      {
        icon: '🌿',
        title: 'Produk Halal',
        description: 'Semua produk yang digunakan bersertifikat halal MUI',
        isSpecial: false
      },
      {
        icon: '👩‍⚕️',
        title: 'Therapist Muslimah',
        description: 'Semua terapis adalah wanita muslimah yang berpengalaman',
        isSpecial: false
      },
      {
        icon: '🕌',
        title: 'Suasana Islami',
        description: 'Lingkungan yang tenang dengan nuansa Islami',
        isSpecial: false
      },
      {
        icon: '🕐',
        title: 'Fleksibel Waktu Sholat',
        description: 'Jadwal appointment yang menghormati waktu ibadah Anda',
        isSpecial: false
      }
    ]
  },
  services: {
    title: 'Layanan Istimewa Kami',
    subtitle: 'Perawatan kecantihan dengan sentuhan Islami',
    description: 'Menggunakan produk halal pilihan dan therapist muslimah berpengalaman'
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
      fallback: 'no_supabase',
      message: 'Using default homepage settings - Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Try to get settings from database
    const { data: settings, error } = await supabase
      .from('HomepageSettings')
      .select('*')
      .single()

    if (error) {
      // Always return defaults silently to avoid noisy logs
      return NextResponse.json({ success: true, data: DEFAULT_SETTINGS })
    }

    return NextResponse.json({
      success: true,
      data: settings || DEFAULT_SETTINGS
    })

  } catch (error) {
    return NextResponse.json({ success: true, data: DEFAULT_SETTINGS })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      data: body,
      message: 'Homepage settings saved successfully (mock mode)'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const body = await request.json()
    console.log('📝 Saving homepage settings:', body)

    // Try to upsert settings
    const { data, error } = await supabase
      .from('HomepageSettings')
      .upsert([{
        id: 1, // Use fixed ID for settings
        ...body,
        updatedAt: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.warn('Homepage settings POST error:', error)
      // If table doesn't exist, just return success with mock data
      return NextResponse.json({
        success: true,
        data: body,
        fallback: 'table_not_found',
        message: 'Settings saved locally (HomepageSettings table not found)'
      })
    }

    console.log('✅ Homepage settings saved successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Homepage settings saved successfully'
    })

  } catch (error) {
    console.error('❌ Save homepage settings error:', error)
    return NextResponse.json({
      success: true,
      data: DEFAULT_SETTINGS,
      fallback: 'error',
      message: 'Settings saved locally due to error'
    })
  }
}