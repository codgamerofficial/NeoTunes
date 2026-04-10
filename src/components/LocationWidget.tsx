import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'

export function LocationWidget() {
  const [city, setCity] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setTimeout(() => setLoading(false), 0)
      return
    }

    const cachedCity = localStorage.getItem('ailos.location.city')
    if (cachedCity) {
      setTimeout(() => {
        setCity(cachedCity)
        setLoading(false)
      }, 0)
      // Check again silently
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`)
          const data = await res.json()
          const cityName = data.address?.city || data.address?.town || data.address?.state || 'Local'
          setCity(cityName)
          localStorage.setItem('ailos.location.city', cityName)
        } catch {
          // Fallback gracefully
        }
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading && !city) {
    return (
      <div className="flex animate-pulse items-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-3 py-1.5 text-xs text-[rgb(var(--muted))]">
        <Clock className="w-3.5 h-3.5" /> Locating...
      </div>
    )
  }

  if (!city) {
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-3 py-1.5 text-xs font-semibold tracking-wide text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:border-[rgb(var(--accent-border))] transition-colors"
    >
      <MapPin className="w-3.5 h-3.5 text-[rgb(var(--accent))]" />
      <span>{greeting}, studying in <span className="text-[rgb(var(--text))]">{city}</span>?</span>
    </motion.div>
  )
}
