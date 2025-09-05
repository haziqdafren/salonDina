'use client'

import { NotificationProvider } from '../components/ui/NotificationToast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  )
}