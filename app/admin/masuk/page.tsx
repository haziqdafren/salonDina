// Redirect to new login - bypass NextAuth cache
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  
  useEffect(() => {
    // Immediate redirect to bypass any cached NextAuth code
    console.log('🔄 Redirecting to new secure login...')
    router.replace('/admin/login-new')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting to secure login...</p>
        <a href="/admin/login-new" className="text-blue-600 underline mt-4 block">
          Click here if not redirected automatically
        </a>
      </div>
    </div>
  )
}