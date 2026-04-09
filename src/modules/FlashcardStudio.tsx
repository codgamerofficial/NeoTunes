import { startTransition, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Check,
  Download,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from '../lib/toast'

import { generateFlashcards } from '../lib/ai'
import { downloadTextFile } from '../lib/export'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { sampleFlashcards, sampleStudyNotes } from '../data/sampleData'
import { EmptyState, MetricCard, Panel, SectionTitle } from '../components/ui'
import type { Flashcard } from '../types'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--text))] transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

export function FlashcardStudio() {
  const [notes, setNotes] = useLocalStorageState('ailos.flashcard.notes', sampleStudyNotes)
  const [cards, setCards] = useLocalStorageState<Flashcard[]>('ailos.flashcard.cards', sampleFlashcards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [studyMode, setStudyMode] = useState(false)

  const masteredCount = cards.filter((c) => c.mastered).length
  const remainingCount = cards.length - masteredCount
  const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0
  const currentCard = cards[currentIndex] || null

  async function handleGenerate() {
    if (!notes.trim()) return
    setIsBusy(true)
    const generated = await generateFlashcards(notes)
    startTransition(() => {
      setCards(generated)
      setCurrentIndex(0)
      setIsFlipped(false)
      toast({ title: 'Flashcards Ready', message: `Generated ${generated.length} cards.`, type: 'success' })
    })
    setIsBusy(false)
  }

  function handleMastered() {
    if (!currentCard) return
    setCards((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, mastered: true } : c)),
    )
    goToNext()
  }

  function handleReviewAgain() {
    if (!currentCard) return
    setCards((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, mastered: false } : c)),
    )
    goToNext()
  }

  function goToNext() {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 200)
  }

  function goToPrev() {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }, 200)
  }

  function handleReset() {
    setCards((prev) => prev.map((c) => ({ ...c, mastered: false })))
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  function handleLoadDemo() {
    startTransition(() => {
      setNotes(sampleStudyNotes)
      setCards(sampleFlashcards)
      setCurrentIndex(0)
      setIsFlipped(false)
      setStudyMode(false)
    })
  }

  function handleExport() {
    const exportContent = [
      '# AI Learning OS - Flashcard Studio',
      '',
      ...cards.map((card, i) => [
        `## Card ${i + 1} ${card.mastered ? '✅' : '❌'}`,
        `**Q:** ${card.front}`,
        `**A:** ${card.back}`,
        '',
      ].join('\n')),
    ].join('\n')
    downloadTextFile('ai-learning-os-flashcards.txt', exportContent)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {!studyMode ? (
        /* ─── Generator View ─── */
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
          <Panel className="space-y-5">
            <SectionTitle
              eyebrow="Module 5"
              title="Flashcard Studio"
              body="Paste your notes and generate AI-powered flashcards for active recall. Study interactively with flip cards and track your mastery."
              action={
                <button className={secondaryButtonClass} onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export
                </button>
              }
            />

            <label className="space-y-3">
              <span className="text-sm font-semibold text-[rgb(var(--text))]">
                Source Material
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-[280px] w-full rounded-[26px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-4 text-sm leading-6 text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent-soft))]"
                placeholder="Paste your study notes here to generate flashcards..."
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                className={primaryButtonClass}
                onClick={handleGenerate}
                disabled={isBusy || !notes.trim()}
              >
                {isBusy ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Flashcards
              </button>
              <button
                className={secondaryButtonClass}
                onClick={() => { setStudyMode(true); setCurrentIndex(0); setIsFlipped(false) }}
                disabled={cards.length === 0}
              >
                <BookOpen className="h-4 w-4" />
                Study Mode
              </button>
              <button className={secondaryButtonClass} onClick={handleLoadDemo}>
                <Layers className="h-4 w-4" />
                Load Demo
              </button>
            </div>
          </Panel>

          <Panel className="space-y-5">
            <SectionTitle
              eyebrow="Progress"
              title="Mastery Tracker"
              body="Track how many cards you've mastered across your current deck."
            />

            <div className="grid gap-3">
              <MetricCard label="Total Cards" value={cards.length.toString()} tone="accent" />
              <MetricCard label="Mastered" value={masteredCount.toString()} />
              <MetricCard label="Remaining" value={remainingCount.toString()} />
            </div>

            {/* Progress Ring */}
            <div className="flex justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    className="text-[rgb(var(--line))] stroke-current"
                    strokeWidth="6"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                  />
                  <motion.circle
                    className="text-[rgb(var(--accent))] stroke-current"
                    strokeWidth="6"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    strokeDasharray={`${(progressPercent / 100) * 264} 264`}
                    initial={{ strokeDasharray: '0 264' }}
                    animate={{ strokeDasharray: `${(progressPercent / 100) * 264} 264` }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                </svg>
                <span className="text-2xl font-display font-bold text-[rgb(var(--text))] z-10">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Card Preview Grid */}
            {cards.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[rgb(var(--text))]">Card deck</p>
                <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                  {cards.map((card, i) => (
                    <button
                      key={card.id}
                      onClick={() => { setStudyMode(true); setCurrentIndex(i); setIsFlipped(false) }}
                      className={`rounded-[16px] border p-2.5 text-left text-xs leading-4 transition hover:border-[rgb(var(--accent-border))] ${
                        card.mastered
                          ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] text-[rgb(var(--muted))]'
                      }`}
                    >
                      <span className="line-clamp-2">{card.front}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>
      ) : (
        /* ─── Study Mode ─── */
        <Panel className="space-y-6 relative">
          <div className="flex items-center justify-between">
            <SectionTitle
              eyebrow={`Card ${currentIndex + 1} of ${cards.length}`}
              title="Study Mode"
              body="Click the card to flip. Mark cards as mastered or review again."
            />
            <div className="flex gap-2">
              <button className={secondaryButtonClass} onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button className={secondaryButtonClass} onClick={() => setStudyMode(false)}>
                <X className="h-4 w-4" />
                Exit
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-[rgb(var(--line))] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[rgb(var(--accent))]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Flashcard */}
          {currentCard ? (
            <div className="flex flex-col items-center gap-6">
              <div
                className="w-full max-w-xl cursor-pointer [perspective:1200px]"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentCard.id}-${isFlipped ? 'back' : 'front'}`}
                    initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className={`min-h-[260px] w-full rounded-[30px] border-2 p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-shadow ${
                      isFlipped
                        ? 'border-[rgb(var(--accent))] bg-gradient-to-br from-[rgb(var(--accent-soft))] to-[rgb(var(--panel-strong))] shadow-[0_8px_40px_rgba(var(--accent),0.15)]'
                        : 'border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] shadow-[var(--panel-shadow)]'
                    }`}
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[rgb(var(--muted))] mb-4">
                      {isFlipped ? '💡 Answer' : '❓ Question'} — tap to flip
                    </p>
                    <p className="text-xl font-display font-semibold text-[rgb(var(--text))] leading-8">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                    {currentCard.mastered && (
                      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <Check className="h-3 w-3" /> Mastered
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPrev}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:border-[rgb(var(--accent-border))]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReviewAgain}
                  className="flex h-14 items-center gap-2 rounded-full border-2 border-red-500/30 bg-red-500/10 px-6 text-sm font-semibold text-red-500 hover:bg-red-500/20 transition"
                >
                  <X className="h-4 w-4" />
                  Review Again
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMastered}
                  className="flex h-14 items-center gap-2 rounded-full border-2 border-green-500/30 bg-green-500/10 px-6 text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/20 transition"
                >
                  <Check className="h-4 w-4" />
                  Got It!
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNext}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:border-[rgb(var(--accent-border))]"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Card indicators */}
              <div className="flex gap-1.5 flex-wrap justify-center">
                {cards.map((card, i) => (
                  <button
                    key={card.id}
                    title={`Go to card ${i + 1}`}
                    aria-label={`Go to card ${i + 1}`}
                    onClick={() => { setCurrentIndex(i); setIsFlipped(false) }}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      i === currentIndex
                        ? 'scale-125 bg-[rgb(var(--accent))]'
                        : card.mastered
                          ? 'bg-green-500/60'
                          : 'bg-[rgb(var(--muted))]/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Layers className="h-5 w-5" />}
              title="No flashcards yet"
              body="Generate flashcards from your notes to start studying."
            />
          )}
        </Panel>
      )}
    </motion.div>
  )
}
