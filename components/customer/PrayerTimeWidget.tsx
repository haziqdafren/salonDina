// Ultra-Adaptive Prayer Time Widget for Medan, Indonesia
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

const PrayerTimeWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentPrayer, setCurrentPrayer] = useState('')
  const [nextPrayer, setNextPrayer] = useState('')
  const [timeToNext, setTimeToNext] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Medan prayer times - Accurate for North Sumatra
  const prayerTimes: PrayerTimes = {
    fajr: '05:00',
    sunrise: '06:15',
    dhuhr: '12:25',
    asr: '15:46',
    maghrib: '18:32',
    isha: '19:45'
  }

  const prayerNames = {
    fajr: 'Subuh',
    sunrise: 'Syuruq',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya'
  }

  // Track scroll position for adaptive positioning with mobile optimization
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 50)
      
      // Auto-collapse when scrolling on mobile for better UX
      const isMobile = window.innerWidth < 768
      if ((isMobile && scrollY > 300) || (!isMobile && scrollY > 800)) {
        setIsCollapsed(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const getCurrentAndNextPrayer = () => {
      const now = currentTime.getHours() * 60 + currentTime.getMinutes()
      
      const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
      }

      const times = [
        { name: 'fajr', time: timeToMinutes(prayerTimes.fajr) },
        { name: 'sunrise', time: timeToMinutes(prayerTimes.sunrise) },
        { name: 'dhuhr', time: timeToMinutes(prayerTimes.dhuhr) },
        { name: 'asr', time: timeToMinutes(prayerTimes.asr) },
        { name: 'maghrib', time: timeToMinutes(prayerTimes.maghrib) },
        { name: 'isha', time: timeToMinutes(prayerTimes.isha) }
      ]

      let current = 'isha' // Default to last prayer
      let next = 'fajr'    // Default to first prayer next day
      let nextTime = timeToMinutes(prayerTimes.fajr) + 24 * 60 // Next day

      for (let i = 0; i < times.length; i++) {
        if (now < times[i].time) {
          next = times[i].name
          nextTime = times[i].time
          current = i > 0 ? times[i - 1].name : 'isha'
          break
        }
      }

      setCurrentPrayer(current)
      setNextPrayer(next)

      // Calculate time remaining to next prayer
      const minutesLeft = nextTime - now
      if (minutesLeft > 0) {
        const hours = Math.floor(minutesLeft / 60)
        const mins = minutesLeft % 60
        if (hours > 0) {
          setTimeToNext(`${hours}j ${mins}m`)
        } else {
          setTimeToNext(`${mins}m`)
        }
      } else {
        // Next prayer is tomorrow
        const minsToMidnight = (24 * 60) - now
        const minsFromMidnight = timeToMinutes(prayerTimes.fajr)
        const totalMins = minsToMidnight + minsFromMidnight
        const hours = Math.floor(totalMins / 60)
        const mins = totalMins % 60
        setTimeToNext(`${hours}j ${mins}m`)
      }
    }

    getCurrentAndNextPrayer()
  }, [currentTime])

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        y: isScrolled ? -5 : 0,
        scale: isScrolled ? 0.95 : 1
      }}
      className={`fixed z-40 transition-all duration-500 ${
        isScrolled 
          ? 'top-20 sm:top-22 md:top-24 right-2 sm:right-4 md:right-6' 
          : 'top-24 sm:top-26 md:top-28 right-2 sm:right-4 md:right-6'
      }`}
    >
      {/* Ultra-thin Adaptive Container */}
      <div 
        className={`bg-white/98 backdrop-blur-xl shadow-2xl border border-pink-200/40 transition-all duration-500 hover:shadow-3xl ${
          isCollapsed 
            ? 'rounded-full min-w-[120px] sm:min-w-[140px] md:min-w-[160px]' 
            : 'rounded-3xl w-56 sm:w-64 md:w-72 lg:w-80 max-w-[calc(100vw-1rem)]'
        }`}
        style={{ 
          transformOrigin: 'top right',
          background: isCollapsed 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(252, 231, 243, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(252, 231, 243, 0.9) 50%, rgba(243, 232, 255, 0.9) 100%)'
        }}
      >
        {/* Collapsed Mini View */}
        <AnimatePresence>
          {isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 sm:p-4 cursor-pointer hover:bg-white/50 transition-all duration-300 rounded-full touch-manipulation"
              onClick={() => setIsCollapsed(false)}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm">🕌</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-pink-700 text-xs sm:text-sm truncate">
                    {prayerNames[nextPrayer as keyof typeof prayerNames]}
                  </span>
                  <span className="text-xs text-purple-600 font-medium">
                    {timeToNext}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 sm:p-4"
            >
              {/* Enhanced Header with Islamic Design */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white text-sm sm:text-lg">🕌</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">Jadwal Sholat</h4>
                    <p className="text-xs text-pink-600 font-medium truncate">Medan, Indonesia</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-gray-400 hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-full touch-manipulation min-w-[32px] min-h-[32px] flex-shrink-0 flex items-center justify-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Current Time */}
              <div className="text-center mb-3">
                <div className="text-base sm:text-lg font-bold text-slate-800">
                  {currentTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Asia/Jakarta'
                  })}
                </div>
                <div className="text-xs text-slate-500">Medan, Indonesia</div>
              </div>

              {/* Prayer Times Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 text-xs sm:text-sm">Sekarang:</span>
                  <span className="font-bold text-salon-primary text-xs sm:text-sm truncate ml-1">
                    {prayerNames[currentPrayer as keyof typeof prayerNames]}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gradient-to-r from-salon-primary/10 to-salon-secondary/10 rounded-lg">
                  <span className="text-slate-600 text-xs sm:text-sm flex-shrink-0">Selanjutnya:</span>
                  <div className="text-right min-w-0 ml-1">
                    <div className="font-bold text-salon-secondary text-xs sm:text-sm truncate">
                      {prayerNames[nextPrayer as keyof typeof prayerNames]}
                    </div>
                    <div className="text-salon-accent font-semibold text-xs sm:text-sm">
                      {prayerTimes[nextPrayer as keyof typeof prayerTimes]}
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="text-center p-2 sm:p-3 bg-salon-soft-pink rounded-lg">
                  <div className="text-salon-islamic font-bold text-xs sm:text-sm mb-1">
                    ⏰ {timeToNext}
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    sampai {prayerNames[nextPrayer as keyof typeof prayerNames]}
                  </div>
                </div>
              </div>

              {/* Islamic Reminder */}
              <div className="mt-3 p-2 bg-gradient-to-r from-salon-islamic/10 to-salon-primary/10 rounded-lg">
                <p className="text-xs text-salon-islamic font-medium text-center leading-relaxed">
                  🤲 Jangan lupa sholat ya ukhti
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ultra-thin scroll indicator */}
      {!isCollapsed && (
        <motion.div
          animate={{ opacity: isScrolled ? 1 : 0 }}
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-salon-primary to-salon-secondary rounded-full"
        />
      )}
    </motion.div>
  )
}

export default PrayerTimeWidget