import { startTransition, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { sampleStudyBlocks } from '../data/sampleData'
import { MetricCard, Panel, SectionTitle } from '../components/ui'
import type { StudyBlock, WeekDay } from '../types'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--text))] transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const DAYS: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am to 8pm
const SUBJECT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
]

type AddModalState = {
  open: boolean
  day: WeekDay
  startHour: number
  duration: number
  subject: string
  color: string
}

const defaultAddModal: AddModalState = {
  open: false,
  day: 'Mon',
  startHour: 9,
  duration: 1,
  subject: '',
  color: SUBJECT_COLORS[0],
}

export function StudyPlanner() {
  const [blocks, setBlocks] = useLocalStorageState<StudyBlock[]>('ailos.planner.blocks', sampleStudyBlocks)
  const [modal, setModal] = useState<AddModalState>(defaultAddModal)

  const totalHours = blocks.reduce((sum, b) => sum + b.duration, 0)
  const uniqueSubjects = [...new Set(blocks.map((b) => b.subject))]

  function getBlocksForCell(day: WeekDay, hour: number) {
    return blocks.filter((b) => b.day === day && hour >= b.startHour && hour < b.startHour + b.duration)
  }

  function isBlockStart(day: WeekDay, hour: number) {
    return blocks.find((b) => b.day === day && b.startHour === hour)
  }

  function handleAddBlock() {
    if (!modal.subject.trim()) return
    const newBlock: StudyBlock = {
      id: `sb-${Date.now()}`,
      day: modal.day,
      startHour: modal.startHour,
      duration: modal.duration,
      subject: modal.subject.trim(),
      color: modal.color,
    }
    setBlocks((prev) => [...prev, newBlock])
    setModal(defaultAddModal)
  }

  function handleRemoveBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  function handleCellClick(day: WeekDay, hour: number) {
    const existing = isBlockStart(day, hour)
    if (existing) {
      handleRemoveBlock(existing.id)
    } else {
      setModal({
        open: true,
        day,
        startHour: hour,
        duration: 1,
        subject: '',
        color: SUBJECT_COLORS[blocks.length % SUBJECT_COLORS.length],
      })
    }
  }

  function handleAutoSchedule() {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History']
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b']
    const generated: StudyBlock[] = []
    let subjectIndex = 0

    DAYS.forEach((day, dayIndex) => {
      if (dayIndex >= 6) return // Light Sunday
      const sessionsPerDay = day === 'Sat' ? 2 : dayIndex % 2 === 0 ? 2 : 1
      for (let s = 0; s < sessionsPerDay; s++) {
        const startHour = s === 0 ? 9 : 14 + Math.floor(Math.random() * 2)
        generated.push({
          id: `sb-auto-${Date.now()}-${dayIndex}-${s}`,
          day,
          startHour,
          duration: 2,
          subject: subjects[subjectIndex % subjects.length],
          color: colors[subjectIndex % colors.length],
        })
        subjectIndex++
      }
    })

    startTransition(() => {
      setBlocks(generated)
    })
  }

  function handleLoadDemo() {
    startTransition(() => {
      setBlocks(sampleStudyBlocks)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel className="space-y-5">
          <SectionTitle
            eyebrow="Module 6"
            title="Study Planner"
            body="Visualize your weekly study schedule. Click cells to add study blocks, or let AI generate a balanced plan."
          />

          <div className="flex flex-wrap gap-3">
            <button className={primaryButtonClass} onClick={handleAutoSchedule}>
              <Sparkles className="h-4 w-4" />
              AI Auto-Schedule
            </button>
            <button className={secondaryButtonClass} onClick={handleLoadDemo}>
              <Calendar className="h-4 w-4" />
              Load Demo Schedule
            </button>
            <button
              className={secondaryButtonClass}
              onClick={() => setBlocks([])}
              disabled={blocks.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>

          {/* Weekly Calendar Grid */}
          <div className="overflow-x-auto rounded-[26px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))]">
            <table className="w-full min-w-[700px] text-left text-sm border-collapse">
              <thead>
                <tr>
                  <th className="w-[60px] px-3 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))] border-b border-[rgb(var(--line))]">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-2 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text))] border-b border-[rgb(var(--line))]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="px-3 py-0 text-xs text-[rgb(var(--muted))] font-mono border-r border-[rgb(var(--line))] h-[52px] align-top pt-2">
                      {hour.toString().padStart(2, '0')}:00
                    </td>
                    {DAYS.map((day) => {
                      const blockStart = isBlockStart(day, hour)
                      const cellBlocks = getBlocksForCell(day, hour)
                      const isCovered = cellBlocks.length > 0 && !blockStart

                      if (isCovered) return null

                      return (
                        <td
                          key={`${day}-${hour}`}
                          className="relative border-r border-b border-[rgb(var(--line))]/50 p-0.5 cursor-pointer hover:bg-[rgb(var(--accent-soft))]/30 transition-colors"
                          onClick={() => handleCellClick(day, hour)}
                          rowSpan={blockStart ? blockStart.duration : 1}
                        >
                          {blockStart && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute inset-0.5 rounded-[14px] p-2 flex flex-col justify-between overflow-hidden"
                              style={{
                                backgroundColor: `${blockStart.color}20`,
                                borderLeft: `3px solid ${blockStart.color}`,
                              }}
                            >
                              <div>
                                <p className="text-[0.68rem] font-bold text-[rgb(var(--text))] leading-tight truncate">
                                  {blockStart.subject}
                                </p>
                                <p className="text-[0.6rem] text-[rgb(var(--muted))] mt-0.5">
                                  {blockStart.duration}h
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveBlock(blockStart.id)
                                }}
                                className="self-end opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 text-[rgb(var(--muted))] hover:text-red-500 transition"
                                aria-label={`Remove ${blockStart.subject}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Panel className="space-y-4">
            <SectionTitle
              eyebrow="Overview"
              title="Weekly Stats"
              body="Your scheduled study time at a glance."
            />
            <div className="grid gap-3">
              <MetricCard label="Total Hours" value={`${totalHours}h`} tone="accent" />
              <MetricCard label="Subjects" value={uniqueSubjects.length.toString()} />
              <MetricCard label="Sessions" value={blocks.length.toString()} />
            </div>
          </Panel>

          <Panel className="space-y-4">
            <SectionTitle
              eyebrow="Legend"
              title="Subjects"
              body="Color key for your schedule."
            />
            <div className="space-y-2">
              {uniqueSubjects.map((subject) => {
                const block = blocks.find((b) => b.subject === subject)
                const subjectHours = blocks
                  .filter((b) => b.subject === subject)
                  .reduce((sum, b) => sum + b.duration, 0)
                return (
                  <div key={subject} className="flex items-center gap-3 rounded-[16px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-3">
                    <div
                      className="h-4 w-4 rounded-full shrink-0"
                      {...{ style: { backgroundColor: block?.color || '#888' } }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[rgb(var(--text))] truncate">{subject}</p>
                    </div>
                    <span className="text-xs font-semibold text-[rgb(var(--muted))]">{subjectHours}h</span>
                  </div>
                )
              })}
              {uniqueSubjects.length === 0 && (
                <p className="text-sm text-[rgb(var(--muted))] text-center py-4">
                  No subjects scheduled yet
                </p>
              )}
            </div>
          </Panel>

          <Panel className="space-y-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
              <Clock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
              Quick tips
            </p>
            <div className="space-y-2 text-sm leading-6 text-[rgb(var(--muted))]">
              <p>• Click any empty cell to add a study block</p>
              <p>• Click a filled cell to remove it</p>
              <p>• Use AI Auto-Schedule for a balanced plan</p>
            </div>
          </Panel>
        </div>
      </div>

      {/* Add Block Modal */}
      <AnimatePresence>
        {modal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal(defaultAddModal)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-[28px] border border-[rgb(var(--line))] bg-[rgb(var(--panel))] p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-bold text-[rgb(var(--text))]">
                  <Plus className="inline h-5 w-5 mr-2 text-[rgb(var(--accent))]" />
                  Add Study Block
                </h3>
                <button
                  onClick={() => setModal(defaultAddModal)}
                  className="rounded-full p-1.5 text-[rgb(var(--muted))] hover:bg-[rgb(var(--line))] transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-[rgb(var(--text))]">Subject</span>
                  <input
                    type="text"
                    value={modal.subject}
                    onChange={(e) => setModal((m) => ({ ...m, subject: e.target.value }))}
                    placeholder="e.g. Mathematics"
                    className="w-full rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent-soft))]"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-[rgb(var(--text))]">Day</span>
                    <select
                      title="Select day"
                      value={modal.day}
                      onChange={(e) => setModal((m) => ({ ...m, day: e.target.value as WeekDay }))}
                      className="w-full rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-[rgb(var(--text))]">Start</span>
                    <select
                      title="Select start time"
                      value={modal.startHour}
                      onChange={(e) => setModal((m) => ({ ...m, startHour: Number(e.target.value) }))}
                      className="w-full rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-[rgb(var(--text))]">Duration (hours)</span>
                  <select
                    title="Select duration"
                    value={modal.duration}
                    onChange={(e) => setModal((m) => ({ ...m, duration: Number(e.target.value) }))}
                    className="w-full rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                  >
                    {[1, 2, 3, 4].map((d) => (
                      <option key={d} value={d}>{d} hour{d > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </label>

                <div className="space-y-1.5">
                  <span className="text-sm font-semibold text-[rgb(var(--text))]">Color</span>
                  <div className="flex gap-2 flex-wrap">
                    {SUBJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setModal((m) => ({ ...m, color }))}
                        className={`h-8 w-8 rounded-full transition-transform ${
                          modal.color === color ? 'scale-125 ring-2 ring-white/40' : 'hover:scale-110'
                        }`}
                        {...{ style: { backgroundColor: color } }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  className={`${primaryButtonClass} w-full mt-2`}
                  onClick={handleAddBlock}
                  disabled={!modal.subject.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Add Block
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
