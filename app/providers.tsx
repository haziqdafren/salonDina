'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--paper-white)',
            color: 'var(--deep-charcoal)',
            border: '2px solid var(--dusty-pink)',
            borderRadius: '8px',
            fontFamily: 'Kalam, cursive',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgba(212, 175, 55, 0.1), 0 2px 4px -1px rgba(212, 175, 55, 0.06)',
          },
          success: {
            iconTheme: {
              primary: 'var(--forest-green)',
              secondary: 'var(--paper-white)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'var(--paper-white)',
            },
          },
        }}
      />
    </SessionProvider>
  )
}