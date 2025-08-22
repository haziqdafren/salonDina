'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createContext, useContext } from 'react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationContextType {
  showNotification: (type: Notification['type'], title: string, message: string, duration?: number) => void
  success: (title: string, message: string, duration?: number) => void
  error: (title: string, message: string, duration?: number) => void
  warning: (title: string, message: string, duration?: number) => void
  info: (title: string, message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    setNotifications(prev => [...prev, newNotification])

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const showNotification = (type: Notification['type'], title: string, message: string, duration = 5000) => {
    addNotification({ type, title, message, duration })
  }

  const notificationMethods = {
    showNotification,
    success: (title: string, message: string, duration?: number) => showNotification('success', title, message, duration),
    error: (title: string, message: string, duration?: number) => showNotification('error', title, message, duration),
    warning: (title: string, message: string, duration?: number) => showNotification('warning', title, message, duration),
    info: (title: string, message: string, duration?: number) => showNotification('info', title, message, duration)
  }

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          border: 'border-green-200',
          icon: '✅',
          iconBg: 'bg-green-100'
        }
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-pink-600',
          border: 'border-red-200',
          icon: '❌',
          iconBg: 'bg-red-100'
        }
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
          border: 'border-yellow-200',
          icon: '⚠️',
          iconBg: 'bg-yellow-100'
        }
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          border: 'border-blue-200',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100'
        }
    }
  }

  return (
    <NotificationContext.Provider value={notificationMethods}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3">
        <AnimatePresence>
          {notifications.map((notification) => {
            const styles = getNotificationStyles(notification.type)
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.8 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  duration: 0.3
                }}
                className={`${styles.bg} text-white rounded-xl shadow-2xl border ${styles.border} w-80 max-w-[calc(100vw-2rem)] overflow-hidden`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`${styles.iconBg} rounded-full p-2 flex-shrink-0`}>
                      <span className="text-lg">{styles.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
                      <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
                    </div>
                    
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-white/70 hover:text-white text-lg transition-colors flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {/* Progress bar */}
                {notification.duration !== 0 && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ 
                      duration: (notification.duration || 5000) / 1000,
                      ease: "linear"
                    }}
                    className="h-1 bg-white/20"
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

// Legacy export for backward compatibility
export const showNotification = {
  success: (title: string, message: string, duration?: number) => {
    console.warn('showNotification.success is deprecated. Use useNotification hook instead.')
  },
  error: (title: string, message: string, duration?: number) => {
    console.warn('showNotification.error is deprecated. Use useNotification hook instead.')
  },
  warning: (title: string, message: string, duration?: number) => {
    console.warn('showNotification.warning is deprecated. Use useNotification hook instead.')
  },
  info: (title: string, message: string, duration?: number) => {
    console.warn('showNotification.info is deprecated. Use useNotification hook instead.')
  }
}