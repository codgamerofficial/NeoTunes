import { startTransition, useDeferredValue, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Download,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { toast } from '../lib/toast'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { analyzePerformance } from '../lib/ai'
import { downloadTextFile } from '../lib/export'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import {
  samplePerformanceInsight,
  samplePerformanceRows,
} from '../data/sampleData'
import { EmptyState, MetricCard, Panel, SectionTitle } from '../components/ui'
import type { PerformanceInsight, PerformanceRow } from '../types'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[rgb(var(--accent))] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-4 py-2.5 text-sm font-semibold text-[rgb(var(--text))] transition hover:-translate-y-0.5 hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-strong))] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0'

function average(values: number[]) {
  if (!values.length) {
    return 0
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export function PerformanceDashboard() {
  const [rows, setRows] = useLocalStorageState<PerformanceRow[]>(
    'ailos.performance.rows',
    samplePerformanceRows,
  )
  const [insights, setInsights] = useLocalStorageState<PerformanceInsight>(
    'ailos.performance.insights',
    samplePerformanceInsight,
  )
  const [isBusy, setIsBusy] = useState(false)
  const deferredRows = useDeferredValue(rows)

  const averageScore = average(deferredRows.map((row) => row.current))
  const averageGap = average(deferredRows.map((row) => Math.max(row.target - row.current, 0)))
  const improvingSubjects = deferredRows.filter((row) => row.current >= row.previous).length
  const chartRows = deferredRows.map((row) => ({
    subject: row.subject,
    current: row.current,
    previous: row.previous,
    target: row.target,
    gap: Math.max(row.target - row.current, 0),
  }))

  function updateTextField(id: string, field: 'subject' | 'focus', value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  function updateNumberField(
    id: string,
    field: 'current' | 'previous' | 'target',
    value: string,
  ) {
    const nextValue = Number(value)
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, [field]: Number.isFinite(nextValue) ? nextValue : 0 } : row,
      ),
    )
  }

  function handleAddRow() {
    const nextIndex = rows.length + 1
    setRows((current) => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        subject: `Subject ${nextIndex}`,
        current: 70,
        previous: 68,
        target: 85,
        focus: 'Key concepts, timed practice',
      },
    ])
  }

  function handleRemoveRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  async function handleAnalyze() {
    if (!rows.length) {
      return
    }

    setIsBusy(true)
    const result = await analyzePerformance(rows)
    startTransition(() => {
      setInsights(result)
      toast({ title: 'Analysis Complete', message: 'Generated a personalized study plan.', type: 'success' })
    })
    setIsBusy(false)
  }

  function handleLoadDemo() {
    startTransition(() => {
      setRows(samplePerformanceRows)
      setInsights(samplePerformanceInsight)
    })
  }

  function handleExport() {
    const exportContent = [
      '# AI Learning OS - Performance Dashboard',
      '## Scores',
      ...rows.map(
        (row) =>
          `- ${row.subject}: current ${row.current}, previous ${row.previous}, target ${row.target}, focus ${row.focus}`,
      ),
      '## Narrative',
      insights.narrative,
      '## Weak Areas',
      ...insights.weakAreas.map((item) => `- ${item}`),
      '## Study Plan',
      ...insights.studyPlan.map((item) => `- ${item}`),
      '## Priority Topics',
      ...insights.priorityTopics.map((item) => `- ${item}`),
    ].join('\n')

    downloadTextFile('ai-learning-os-performance.txt', exportContent)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <Panel className="space-y-5">
          <SectionTitle
            eyebrow="Module 2"
            title="Performance Analyzer"
            body="Enter subjects, compare current performance against previous scores and goals, then turn the data into an actionable study plan."
            action={
              <button className={secondaryButtonClass} onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </button>
            }
          />

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid gap-4 md:grid-cols-3"
          >
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <MetricCard label="Average score" value={`${averageScore}%`} tone="accent" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <MetricCard label="Average target gap" value={`${averageGap} pts`} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <MetricCard label="Improving subjects" value={`${improvingSubjects}/${rows.length}`} />
            </motion.div>
          </motion.div>

          <div className="overflow-x-auto rounded-[26px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[rgb(var(--line))] text-[rgb(var(--muted))]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Current</th>
                  <th className="px-4 py-3 font-semibold">Previous</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Focus</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-[rgb(var(--line))] last:border-b-0">
                    <td className="px-4 py-3 align-top">
                      <input
                        title="Subject Name"
                        placeholder="Subject"
                        value={row.subject}
                        onChange={(event) =>
                          updateTextField(row.id, 'subject', event.target.value)
                        }
                        className="w-[150px] rounded-2xl border border-[rgb(var(--line))] bg-transparent px-3 py-2 text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="number"
                        title="Current Grade"
                        placeholder="Current"
                        value={row.current}
                        onChange={(event) =>
                          updateNumberField(row.id, 'current', event.target.value)
                        }
                        className="w-[88px] rounded-2xl border border-[rgb(var(--line))] bg-transparent px-3 py-2 text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="number"
                        title="Previous Grade"
                        placeholder="Previous"
                        value={row.previous}
                        onChange={(event) =>
                          updateNumberField(row.id, 'previous', event.target.value)
                        }
                        className="w-[88px] rounded-2xl border border-[rgb(var(--line))] bg-transparent px-3 py-2 text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="number"
                        title="Target Grade"
                        placeholder="Target"
                        value={row.target}
                        onChange={(event) =>
                          updateNumberField(row.id, 'target', event.target.value)
                        }
                        className="w-[88px] rounded-2xl border border-[rgb(var(--line))] bg-transparent px-3 py-2 text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        title="Focus Area"
                        placeholder="Focus Area"
                        value={row.focus}
                        onChange={(event) => updateTextField(row.id, 'focus', event.target.value)}
                        className="w-[220px] rounded-2xl border border-[rgb(var(--line))] bg-transparent px-3 py-2 text-[rgb(var(--text))] outline-none transition focus:border-[rgb(var(--accent))]"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--line))] text-[rgb(var(--muted))] transition hover:border-[rgb(var(--accent))] hover:text-[rgb(var(--accent-strong))]"
                        onClick={() => handleRemoveRow(row.id)}
                        aria-label={`Remove ${row.subject}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className={primaryButtonClass} onClick={handleAnalyze} disabled={isBusy}>
              {isBusy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate AI Insights
            </button>
            <button className={secondaryButtonClass} onClick={handleAddRow}>
              <Plus className="h-4 w-4" />
              Add Subject
            </button>
            <button className={secondaryButtonClass} onClick={handleLoadDemo}>
              <BarChart3 className="h-4 w-4" />
              Load Demo Scores
            </button>
          </div>
        </Panel>

        <Panel className="space-y-5">
          <SectionTitle
            eyebrow="AI readout"
            title="Personalized coaching layer"
            body="The analysis combines score gaps, trend direction, and declared focus areas to surface what matters most."
          />

          {insights.weakAreas.length ? (
            <div className="space-y-5">
              <div className="rounded-[26px] border border-[rgb(var(--accent-border))] bg-[rgb(var(--accent-soft))] p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--accent-strong))]">
                  Narrative
                </p>
                <p className="mt-3 text-sm leading-6 text-[rgb(var(--text))]">
                  {insights.narrative}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-[rgb(var(--text))]">Weak areas</p>
                <div className="mt-3 space-y-3">
                  {insights.weakAreas.map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-4 text-sm leading-6 text-[rgb(var(--text))]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[rgb(var(--text))]">Suggested study plan</p>
                <div className="mt-3 space-y-3">
                  {insights.studyPlan.map((item) => (
                    <div
                      key={item}
                      className="rounded-[22px] border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] p-4 text-sm leading-6 text-[rgb(var(--text))]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[rgb(var(--text))]">Priority topics</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.priorityTopics.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--panel-strong))] px-3 py-1 text-xs font-semibold text-[rgb(var(--text))]"
                    >
                      {item.replace(/\.$/, '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="No insights yet"
              body="Run the analysis to convert raw marks into an improvement plan."
            />
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="space-y-5">
          <SectionTitle
            eyebrow="Bar chart"
            title="Current vs target"
            body="This view shows where the biggest point gaps still remain."
          />
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" vertical={false} />
                <XAxis dataKey="subject" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(37,99,235,0.1)' }} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(var(--line))', backgroundColor: 'rgba(var(--panel-strong))' }} />
                <Legend />
                <Bar dataKey="current" fill="#2563EB" radius={[10, 10, 0, 0]} />
                <Bar dataKey="target" fill="#FF5722" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="space-y-5">
          <SectionTitle
            eyebrow="Line chart"
            title="Momentum by subject"
            body="Compare previous performance to the latest score to spot recovery or decline."
          />
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" vertical={false} />
                <XAxis dataKey="subject" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(var(--line))', backgroundColor: 'rgba(var(--panel-strong))' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#94a3b8"
                  strokeWidth={3}
                  dot={{ fill: '#94a3b8', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#FF5722' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </motion.div>
  )
}
