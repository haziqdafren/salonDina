import { createClient } from '@supabase/supabase-js'

export const isServiceRoleConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !!(url && serviceKey && url.startsWith('https://') && url.includes('.supabase.co'))
}

export const supabaseAdmin = isServiceRoleConfigured()
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  : null


