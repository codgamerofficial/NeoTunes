import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX, History, Flame, Target, Settings, CheckCircle2 } from 'lucide-react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { Panel, SectionTitle, MetricCard } from '../components/ui'
import type { FocusSession } from '../types'

const AMBIENT_SOUNDS = [
  { id: 'none', label: 'No Sound', url: '' },
  { id: 'rain', label: 'Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
  { id: 'forest', label: 'Forest', url: 'https://actions.google.com/sounds/v1/nature/forest_birds_insects.ogg' },
  { id: 'white-noise', label: 'White Noise', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' }, // Using waves as white noise
] // fallback to Google's public sound library

export function FocusTimer() {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  
  // Settings & History (Persisted)
  const [sessions, setSessions] = useLocalStorageState<FocusSession[]>('ailos.focus.history', [])
  const [dailyGoal, setDailyGoal] = useLocalStorageState('ailos.focus.dailyGoal', 4)
  const [autoSwitch, setAutoSwitch] = useLocalStorageState('ailos.focus.autoSwitch', true)
  const [soundId, setSoundId] = useLocalStorageState('ailos.focus.sound', 'none')
  
  // UI State
  const [showHistory, setShowHistory] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const totalTime = mode === 'focus' ? 25 * 60 : 5 * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100
  const strokeDasharray = `${(progress / 100) * 283} 283`

  // Today's Stats
  const todayDate = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter((s) => s.date === todayDate && s.mode === 'focus')
  const completedToday = todaySessions.length
  const totalFocusMinutesToday = todaySessions.reduce((acc, s) => acc + s.duration, 0)
  
  // Streak Calculation (consecutive days with at least 1 focus session)
  const streak = calculateStreak()

  function calculateStreak() {
    if (!sessions.length) return 0
    const dates = [...new Set(sessions.map((s) => s.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    let currentStreak = 0
    let checkDate = new Date()
    
    // Check if missed today, if so check yesterday
    if (!dates.includes(todayDate)) {
      checkDate.setDate(checkDate.getDate() - 1)
      if (!dates.includes(checkDate.toISOString().split('T')[0])) return 0 // Missed today and yesterday
    }
    
    // Start counting backwards
    checkDate = new Date()
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (dates.includes(dateStr)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // If today is missed but yesterday was there, don't break the streak yet, but don't count today
        if (dateStr === todayDate) {
           checkDate.setDate(checkDate.getDate() - 1)
        } else {
           break
        }
      }
    }
    return currentStreak
  }

  // Audio effect
  useEffect(() => {
    if (audioRef.current) {
      if (isActive && soundId !== 'none' && mode === 'focus') {
        const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId)
        if (sound) {
          if (audioRef.current.src !== sound.url) {
            audioRef.current.src = sound.url
            audioRef.current.loop = true
          }
           audioRef.current.play().catch(e => console.error("Audio play failed", e))
        }
      } else {
        audioRef.current.pause()
      }
    }
  }, [isActive, soundId, mode])

  const switchMode = useCallback((newMode: 'focus' | 'break') => {
    setMode(newMode)
    setIsActive(false)
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60)
  }, [])

  const handleSessionComplete = useCallback(() => {
    // Play notification sound
    const beeps = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg')
    beeps.play().catch(() => {})

    // Record session
    const newSession: FocusSession = {
      id: `fs-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      duration: mode === 'focus' ? 25 : 5,
      mode,
      completedAt: Date.now(),
    }
    
    setSessions((prev) => [newSession, ...prev])

    // Auto-switch
    if (autoSwitch) {
      const nextMode = mode === 'focus' ? 'break' : 'focus'
      switchMode(nextMode)
      // Small delay then start
      setTimeout(() => setIsActive(true), 1500)
    }
  }, [autoSwitch, mode, setSessions, switchMode])

  // Timer effect
  useEffect(() => {
    let interval: number | undefined
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setTimeout(() => {
        setIsActive(false)
        handleSessionComplete()
      }, 0)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, handleSessionComplete])

  function toggleTimer() {
    setIsActive((active) => !active)
  }

  function resetTimer() {
    setIsActive(false)
    setTimeLeft(totalTime)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
        {/* Main Timer Panel */}
        <Panel className="space-y-8 flex flex-col items-center py-12 relative overflow-hidden">
          <SectionTitle
            eyebrow="Module 4"
            title="Focus Engine"
            body="Use the Pomodoro technique to stay sharp. 25 minutes of deep work, 5 minutes of rest."
          />
          
          <div className="absolute top-6 right-6">
             <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-full transition ${showHistory ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--panel-strong))] text-[rgb(var(--muted))] border border-[rgb(var(--line))] hover:text-[rgb(var(--text))]'}`}
                title="Toggle History"
              >
                <History className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex gap-4 p-1.5 border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] rounded-full">
            <button
              onClick={() => switchMode('focus')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${mode === 'focus' ? 'bg-[rgb(var(--accent))] text-white shadow-[0_4px_12px_rgba(var(--accent),0.25)]' : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]'}`}
            >
              Focus
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${mode === 'break' ? 'bg-[rgb(var(--accent))] text-white shadow-[0_4px_12px_rgba(var(--accent),0.25)]' : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]'}`}
            >
              Break
            </button>
          </div>

          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-[rgb(var(--line))] stroke-current"
                strokeWidth="2.5"
                cx="50"
                cy="50"
                r="46"
                fill="transparent"
              />
              <motion.circle
                className={`${mode === 'focus' ? 'text-[rgb(var(--accent))]' : 'text-emerald-500'} stroke-current`}
                strokeWidth="4"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="46"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDasharray: "0 283" }}
                animate={{ strokeDasharray }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center">
              <h2 className="text-[5rem] font-display font-bold text-[rgb(var(--text))] tracking-tighter leading-none">
                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
              </h2>
              <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-[rgb(var(--muted))]">
                {mode === 'focus' ? 'Deep Work' : 'Resting'}
              </p>
            </div>
            
            {/* Ambient pulsing glow when active */}
            {isActive && mode === 'focus' && (
              <motion.div 
                className="absolute inset-0 rounded-full bg-[rgb(var(--accent))] mix-blend-screen pointer-events-none -translate-z-10"
                animate={{ opacity: [0, 0.15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl transition-colors ${mode === 'focus' ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-strong))]' : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1.5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:border-[rgb(var(--accent-border))]"
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>
          </div>
        </Panel>

        {/* Sidebar Info & Settings */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!showHistory ? (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Panel className="space-y-5">
                  <SectionTitle eyebrow="Today" title="Daily Goals" />
                  <div className="grid grid-cols-2 gap-3">
                   <MetricCard label="Focus Sessions" value={`${completedToday} / ${dailyGoal}`} tone={completedToday >= dailyGoal ? 'accent' : 'neutral'} />
                    <MetricCard label="Focus Minutes" value={totalFocusMinutesToday.toString()} tone="neutral" />
                  </div>
                  
                  <div className="p-4 rounded-[20px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-full text-amber-500">
                           <Flame className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">Current Streak</p>
                           <p className="text-lg font-bold text-[rgb(var(--text))]">{streak} Day{streak !== 1 ? 's' : ''}</p>
                        </div>
                     </div>
                  </div>
                </Panel>
                
                <Panel className="space-y-5">
                  <SectionTitle eyebrow="Preferences" title="Timer Settings" />
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))]">
                       <div className="flex items-center gap-3">
                          <Target className="w-4 h-4 text-[rgb(var(--muted))]" />
                          <span className="text-sm font-semibold text-[rgb(var(--text))]">Daily goal (sessions)</span>
                       </div>
                       <select 
                          value={dailyGoal} 
                          onChange={(e) => setDailyGoal(Number(e.target.value))}
                          className="bg-transparent text-sm font-bold text-[rgb(var(--text))] outline-none border-none cursor-pointer"
                          title="Set daily goal"
                       >
                          {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => (
                             <option key={n} value={n} className="bg-[rgb(var(--panel-strong))] text-[rgb(var(--text))]">{n}</option>
                          ))}
                       </select>
                     </div>

                     <div className="flex items-center justify-between p-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))]">
                       <div className="flex items-center gap-3">
                          <Settings className="w-4 h-4 text-[rgb(var(--muted))]" />
                          <span className="text-sm font-semibold text-[rgb(var(--text))]">Auto-switch modes</span>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer" title="Toggle auto-switch">
                          <input type="checkbox" aria-label="Toggle auto-switch" checked={autoSwitch} onChange={(e) => setAutoSwitch(e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-[rgb(var(--line))] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--accent))]"></div>
                       </label>
                     </div>
                     
                     <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">Ambient Sounds</label>
                       <div className="grid grid-cols-2 gap-2">
                         {AMBIENT_SOUNDS.map(sound => (
                            <button
                               key={sound.id}
                               onClick={() => setSoundId(sound.id)}
                               className={`flex items-center justify-center p-3 rounded-[16px] border text-xs font-semibold transition ${soundId === sound.id ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent-strong))]' : 'border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] text-[rgb(var(--muted))] hover:border-[rgb(var(--accent-border))]'}`}
                            >
                               {sound.id === 'none' ? <VolumeX className="w-3 h-3 mr-1.5" /> : <Volume2 className="w-3 h-3 mr-1.5" />}
                               {sound.label}
                            </button>
                         ))}
                       </div>
                       <audio ref={audioRef} className="hidden" />
                     </div>
                  </div>
                </Panel>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                 <Panel className="space-y-4 max-h-[850px] flex flex-col">
                    <SectionTitle eyebrow="Log" title="Session History" />
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                       {sessions.length === 0 ? (
                         <div className="text-center py-10">
                            <History className="w-8 h-8 text-[rgb(var(--muted))] mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-[rgb(var(--muted))]">No sessions completed yet.</p>
                         </div>
                       ) : (
                         sessions.map(session => (
                            <div key={session.id} className="flex items-center justify-between p-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))]">
                               <div className="flex items-center gap-3">
                                  {session.mode === 'focus' ? (
                                    <div className="p-1.5 bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] rounded-full">
                                       <Target className="w-4 h-4" />
                                    </div>
                                  ) : (
                                    <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                                       <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div>
                                     <p className="text-sm font-semibold text-[rgb(var(--text))]">{session.mode === 'focus' ? 'Focus Session' : 'Break'}</p>
                                     <p className="text-[0.65rem] text-[rgb(var(--muted))] uppercase tracking-widest">{new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.date}</p>
                                  </div>
                               </div>
                               <span className="text-sm font-bold text-[rgb(var(--text))]">{session.duration}m</span>
                            </div>
                         ))
                       )}
                    </div>
                 </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
