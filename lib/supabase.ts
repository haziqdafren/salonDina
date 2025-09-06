import { createClient } from '@supabase/supabase-js'

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Check if both exist and are not placeholder values
  return !!(url && key && 
           url !== 'your-supabase-url' && 
           key !== 'your-supabase-anon-key' &&
           url.startsWith('https://') &&
           url.includes('.supabase.co'))
}

// Helper to check if service role is configured
export const isServiceRoleConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  return !!(url && serviceKey && 
           url !== 'your-supabase-url' && 
           serviceKey !== 'your-service-role-key' &&
           url.startsWith('https://') &&
           url.includes('.supabase.co'))
}

// Only create client if properly configured
export const supabase = isSupabaseConfigured() 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = isServiceRoleConfigured()
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null