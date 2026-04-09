import { startTransition, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  LoaderCircle,
  Sigma,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { toast } from '../lib/toast'

import {
  explainHomeworkSimply,
  generateSimilarQuestions,
  solveHomework,
} from '../lib/ai'
import { downloadTextFile } from '../lib/export'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import {
  sampleHomeworkPractice,
  sampleHomeworkQuestion,
  sampleHomeworkSimple,
  sampleHomeworkSolution,
} from '../data/sampleData'
import { EmptyState, Panel, SectionTitle, TabButton } from '../components/ui'
import type { HomeworkTab } from '../types'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--text))] transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

export function HomeworkSolver() {
  const [question, setQuestion] = useLocalStorageState(
    'ailos.homework.question',
    sampleHomeworkQuestion,
  )
  const [solution, setSolution] = useLocalStorageState(
    'ailos.homework.solution',
    sampleHomeworkSolution,
  )
  const [simpleExplanation, setSimpleExplanation] = useLocalStorageState(
    'ailos.homework.simple',
    sampleHomeworkSimple,
  )
  const [practiceQuestions, setPracticeQuestions] = useLocalStorageState(
    'ailos.homework.practice',
    sampleHomeworkPractice,
  )
  const [activeTab, setActiveTab] = useLocalStorageState<HomeworkTab>(
    'ailos.homework.tab',
    'solution',
  )
  const [busyAction, setBusyAction] = useState<HomeworkTab | null>(null)

  async function handleSolve() {
    if (!question.trim()) {
      return
    }

    setBusyAction('solution')
    const steps = await solveHomework(question)
    startTransition(() => {
      setSolution(steps)
      setActiveTab('solution')
      toast({ title: 'Solution Ready', message: 'Step-by-step logic generated.', type: 'success' })
    })
    setBusyAction(null)
  }

  async function handleExplainSimply() {
    if (!question.trim()) {
      return
    }

    setBusyAction('simple')
    const explanation = await explainHomeworkSimply(question)
    startTransition(() => {
      setSimpleExplanation(explanation)
      setActiveTab('simple')
      toast({ title: 'Explanation Updated', message: 'Translated to simple terms.', type: 'success' })
    })
    setBusyAction(null)
  }

  async function handleGeneratePractice() {
    if (!question.trim()) {
      return
    }

    setBusyAction('practice')
    const questions = await generateSimilarQuestions(question)
    startTransition(() => {
      setPracticeQuestions(questions)
      setActiveTab('practice')
    })
    setBusyAction(null)
  }

  function handleLoadDemo() {
    startTransition(() => {
      setQuestion(sampleHomeworkQuestion)
      setSolution(sampleHomeworkSolution)
      setSimpleExplanation(sampleHomeworkSimple)
      setPracticeQuestions(sampleHomeworkPractice)
      setActiveTab('solution')
    })
  }

  function handleExport() {
    const exportContent = [
      '# AI Learning OS - Homework Solver',
      '## Question',
      question,
      '## Step-by-step solution',
      ...solution.map((step, index) => `${index + 1}. ${step}`),
      '## Simple explanation',
      simpleExplanation,
      '## Similar questions',
      ...practiceQuestions.map((item) => `- ${item}`),
    ].join('\n')

    downloadTextFile('ai-learning-os-homework.txt', exportContent)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_360px]">
        <Panel className="space-y-5">
          <SectionTitle
            eyebrow="Module 3"
            title="Homework Solver"
            body="Turn a single homework prompt into structured reasoning, a simpler explanation, and a fresh practice loop."
            action={
              <button className={secondaryButtonClass} onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </button>
            }
          />

          <label className="space-y-3">
            <span className="text-sm font-semibold text-[rgb(var(--text))]">
              Homework prompt
            </span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="h-[280px] w-full rounded-[26px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-4 text-sm leading-6 text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent-soft))]"
              placeholder="Paste a question, problem statement, or short homework prompt..."
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className={primaryButtonClass}
              onClick={handleSolve}
              disabled={busyAction !== null || !question.trim()}
            >
              {busyAction === 'solution' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sigma className="h-4 w-4" />
              )}
              Solve
            </button>
            <button
              className={secondaryButtonClass}
              onClick={handleExplainSimply}
              disabled={busyAction !== null || !question.trim()}
            >
              {busyAction === 'simple' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Explain Simply
            </button>
            <button
              className={secondaryButtonClass}
              onClick={handleGeneratePractice}
              disabled={busyAction !== null || !question.trim()}
            >
              {busyAction === 'practice' ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <WandSparkles className="h-4 w-4" />
              )}
              Generate Similar Questions
            </button>
            <button className={secondaryButtonClass} onClick={handleLoadDemo}>
              <Sigma className="h-4 w-4" />
              Load Demo Problem
            </button>
          </div>
        </Panel>

        <Panel className="space-y-5">
          <SectionTitle
            eyebrow="How it responds"
            title="Reasoning first, not answer-only"
            body="The solver is designed to show structure, translate jargon, and immediately create extra practice."
          />

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {[
              'Solve: breaks the task into ordered, checkable steps.',
              'Explain Simply: rewrites the logic so a student can repeat it later without the app.',
              'Generate Similar Questions: keeps the practice loop going with nearby variations.',
            ].map((item, index) => (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                key={item}
                className="rounded-[24px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-4 hover:border-[rgb(var(--accent-border))] transition-colors duration-300"
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
                  Focus {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-[rgb(var(--text))]">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </Panel>
      </div>

      <Panel className="space-y-5">
        <SectionTitle
          eyebrow="Outputs"
          title="Step-by-step solution, plain-language explanation, and practice"
          body="Switch views depending on whether you need rigor, intuition, or repetition."
        />

        <div className="flex flex-wrap gap-2">
          <TabButton active={activeTab === 'solution'} onClick={() => setActiveTab('solution')}>
            <Sigma className="h-4 w-4" />
            Step-by-step
          </TabButton>
          <TabButton active={activeTab === 'simple'} onClick={() => setActiveTab('simple')}>
            <Sparkles className="h-4 w-4" />
            Simple Explanation
          </TabButton>
          <TabButton active={activeTab === 'practice'} onClick={() => setActiveTab('practice')}>
            <WandSparkles className="h-4 w-4" />
            Practice Set
          </TabButton>
        </div>

        {activeTab === 'solution' ? (
          solution.length ? (
            <div className="space-y-4">
              {solution.map((step, index) => (
                <div
                  key={`${step}-${index}`}
                  className="grid gap-4 rounded-[24px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-4 md:grid-cols-[52px_minmax(0,1fr)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--accent-soft))] text-lg font-semibold text-[rgb(var(--accent-strong))]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-[rgb(var(--text))]">{step}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sigma className="h-5 w-5" />}
              title="No solution yet"
              body="Run the solver to generate a step-by-step walkthrough."
            />
          )
        ) : null}

        {activeTab === 'simple' ? (
          simpleExplanation ? (
            <div className="rounded-[28px] border border-[rgb(var(--accent-border))] bg-[rgb(var(--accent-soft))] p-6">
              <p className="text-sm leading-7 text-[rgb(var(--text))]">{simpleExplanation}</p>
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="No simple explanation yet"
              body="Use the plain-language mode to turn the solution into something easier to remember."
            />
          )
        ) : null}

        {activeTab === 'practice' ? (
          practiceQuestions.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {practiceQuestions.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-4"
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                    Practice prompt
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[rgb(var(--text))]">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<WandSparkles className="h-5 w-5" />}
              title="No practice questions yet"
              body="Generate variations to keep working the same concept without repeating the exact original problem."
            />
          )
        ) : null}
      </Panel>
    </motion.div>
  )
}
