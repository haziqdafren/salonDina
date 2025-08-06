// Prayer Time Widget for Medan, Indonesia
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

  // Medan prayer times (would typically fetch from API)
  const prayerTimes: PrayerTimes = {
    fajr: '05:15',
    sunrise: '06:25',
    dhuhr: '12:20',
    asr: '15:35',
    maghrib: '18:15',
    isha: '19:30'
  }

  const prayerNames = {
    fajr: 'Subuh',
    sunrise: 'Syuruq',
    dhuhr: 'Dzuhur',
    asr: 'Ashar',
    maghrib: 'Maghrib',
    isha: 'Isya'
  }

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-40 bg-white/90 backdrop-blur-sm shadow-lg border border-salon-accent/20"
      style={{ borderRadius: '20px 5px 20px 5px', padding: '1rem' }}
    >
      <div className="text-center">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-salon-islamic text-lg">🕌</span>
          <h4 className="font-semibold text-salon-secondary text-sm">Jadwal Sholat Medan</h4>
        </div>
        
        <div className="text-xs mb-3" style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>
          {currentTime.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
          })} WIB
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>Sekarang:</span>
            <span className="font-semibold text-salon-primary">
              {prayerNames[currentPrayer as keyof typeof prayerNames]}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>Selanjutnya:</span>
            <span className="font-semibold text-salon-secondary">
              {prayerNames[nextPrayer as keyof typeof prayerNames]} {prayerTimes[nextPrayer as keyof typeof prayerTimes]}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>Tersisa:</span>
            <span className="font-semibold text-salon-accent">
              {timeToNext}
            </span>
          </div>
        </div>

        {/* Prayer reminder */}
        <div className="mt-3 p-2 bg-salon-soft-pink rounded-lg">
          <p className="text-xs text-salon-islamic font-medium">
            🤲 Jangan lupa sholat ya ukhti
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default PrayerTimeWidget