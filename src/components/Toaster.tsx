import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { subscribeToasts, type Toast } from '../lib/toast'

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return subscribeToasts(setToasts)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto flex gap-3 p-4 rounded-2xl shadow-2xl border bg-[rgb(var(--panel-strong))] border-[rgb(var(--line))] backdrop-blur-xl"
            style={{
              boxShadow: t.type === 'error' ? '0 10px 40px -10px rgba(239,68,68,0.2)' : '0 10px 40px -10px rgba(var(--accent),0.2)'
            }}
          >
            <div className={`mt-0.5 shrink-0 ${t.type === 'error' ? 'text-red-500' : t.type === 'success' ? 'text-[rgb(var(--accent-strong))]' : 'text-blue-500'}`}>
              {t.type === 'error' ? <AlertCircle className="w-5 h-5" /> : t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-[rgb(var(--text))]">{t.title}</h4>
              {t.message && <p className="text-sm leading-5 text-[rgb(var(--muted))]">{t.message}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
