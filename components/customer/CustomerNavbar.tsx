'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const CustomerNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Beranda', href: '#home', icon: '🏠' },
    { name: 'Layanan', href: '#services', icon: '💆‍♀️' },
    { name: 'Booking', href: '#booking-section', icon: '📅' },
    { name: 'Tentang Kami', href: '#about', icon: 'ℹ️' },
    { name: 'Kontak', href: '#contact', icon: '📞' },
  ]

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const handleWhatsAppClick = () => {
    const whatsappUrl = "https://wa.me/6287869590802?text=Assalamu'alaikum, saya ingin bertanya tentang layanan Salon Muslimah Dina"
    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 safe-area-inset-top ${
          isScrolled 
            ? 'bg-white/98 backdrop-blur-xl shadow-xl border-b border-pink-200/50' 
            : 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-pink-100/30'
        }`}
        style={{
          background: isScrolled 
            ? 'rgba(255, 255, 255, 0.98)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(252, 231, 243, 0.92) 50%, rgba(248, 250, 252, 0.9) 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            
            {/* Enhanced Logo with Islamic Touch - More compact on mobile */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 cursor-pointer touch-manipulation flex-shrink-0"
              onClick={() => handleNavClick('#home')}
            >
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border border-pink-300 sm:border-2 flex-shrink-0 shadow-md">
                  <img 
                    src="/logo.jpeg" 
                    alt="Salon Muslimah Dina" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Islamic decorative corner */}
                <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">✦</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-800 bg-clip-text text-transparent leading-tight filter drop-shadow-sm truncate">
                  Salon Muslimah Dina
                </h1>
                <p className="text-xs sm:text-sm bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent leading-tight hidden sm:block">
                  ✨ Muslimah Beauty Center
                </p>
                <p className="text-xs bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent leading-tight sm:hidden">
                  ✨ Beauty
                </p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full transition-all duration-300 touch-manipulation ${
                    isScrolled
                      ? 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                      : 'text-gray-700 hover:text-pink-600 hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </motion.button>
              ))}
            </div>

            {/* WhatsApp CTA, Admin & Mobile Menu Button */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Admin Login - Hidden on small mobile, visible on larger screens */}
              <Link href="/admin/masuk" className="hidden sm:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-2 sm:px-3 md:px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm whitespace-nowrap"
                >
                  <span className="text-xs sm:text-sm">🔐</span>
                  <span className="hidden md:inline">Admin</span>
                </motion.button>
              </Link>

              {/* WhatsApp CTA - Responsive sizing */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick}
                className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-2 sm:px-2.5 md:px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm whitespace-nowrap"
              >
                <span className="text-xs sm:text-sm">💬</span>
                <span className="hidden md:inline">WhatsApp</span>
                <span className="md:hidden">WA</span>
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 sm:p-2.5 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] rounded-lg transition-colors touch-manipulation flex items-center justify-center hover:bg-white/20 active:bg-white/30 flex-shrink-0"
              >
                <motion.div
                  animate={isMobileMenuOpen ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-700 text-base sm:text-lg"
                >
                  {isMobileMenuOpen ? '✕' : '☰'}
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/96 backdrop-blur-lg border-t border-pink-100 max-h-screen overflow-y-auto"
            >
              <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-1 sm:space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-center gap-3 w-full p-3 sm:p-3.5 text-left text-gray-700 hover:text-pink-600 hover:bg-pink-50 active:bg-pink-100 rounded-lg transition-all duration-300 touch-manipulation min-h-[48px]"
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="font-medium text-base">{item.name}</span>
                  </motion.button>
                ))}
                
                {/* Mobile Admin Login */}
                <Link href="/admin/masuk">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.05 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 w-full p-3 sm:p-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 mt-3 sm:mt-4 touch-manipulation min-h-[48px]"
                  >
                    <span className="text-lg flex-shrink-0">🔐</span>
                    <span className="text-base">Admin Login</span>
                  </motion.button>
                </Link>

                {/* Mobile WhatsApp CTA */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navItems.length + 1) * 0.05 }}
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-3 w-full p-3 sm:p-3.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 mt-2 touch-manipulation min-h-[48px]"
                >
                  <span className="text-lg flex-shrink-0">💬</span>
                  <span className="text-base">Chat WhatsApp</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content overlap - Responsive */}
      <div className="h-14 sm:h-16 md:h-20" />
    </>
  )
}

export default CustomerNavbar