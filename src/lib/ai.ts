import type { ChatMessage, PerformanceRow } from '../types'
import type { AiApiResponse, AiRequestPayload, AiResponsePayload } from './ai-contract'
import {
  buildMockFlashcards,
  buildMockHomeworkSimple,
  buildMockHomeworkSolution,
  buildMockPerformanceInsight,
  buildMockPracticeQuestions,
  buildMockQuiz,
  buildMockStudyAnswer,
  buildMockSummary,
  extractKeywords,
} from './mockAi'

type AiRuntime = {
  mode: 'mock' | 'secure'
  label: string
  detail: string
}

export type AiFallbackNotice = {
  id: string
  task: AiRequestPayload['task']
  title: string
  message: string
}

const AI_FALLBACK_EVENT = 'ailos:secure-ai-fallback'

const taskLabels = {
  'study-summary': 'Summary generation',
  'study-quiz': 'Quiz generation',
  'study-chat': 'Tutor chat',
  'performance-insights': 'Performance analysis',
  'homework-solve': 'Homework solving',
  'homework-simple': 'Simple explanation',
  'homework-practice': 'Practice question generation',
  'jarvis-chat': 'Jarvis assistant',
  'flashcard-generate': 'Flashcard generation',
} satisfies Record<AiRequestPayload['task'], string>

function getProvider() {
  return import.meta.env.VITE_AI_PROVIDER || 'mock'
}

export function getAiRuntime(): AiRuntime {
  if (getProvider() === 'server') {
    return {
      mode: 'secure',
      label: 'Secure AI',
      detail: 'Requests are sent through a Vercel Function so your model key stays server-side.',
    }
  }

  return {
    mode: 'mock',
    label: 'Demo AI',
    detail: 'The app is running in polished demo mode until you enable the secure server integration.',
  }
}

export { extractKeywords }

export function onAiFallback(listener: (notice: AiFallbackNotice) => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handleEvent = (event: Event) => {
    listener((event as CustomEvent<AiFallbackNotice>).detail)
  }

  window.addEventListener(AI_FALLBACK_EVENT, handleEvent)

  return () => window.removeEventListener(AI_FALLBACK_EVENT, handleEvent)
}

function emitAiFallback(task: AiRequestPayload['task'], error: unknown) {
  if (typeof window === 'undefined') {
    return
  }

  const reason =
    error instanceof Error ? error.message : 'Unexpected secure AI server error.'

  window.dispatchEvent(
    new CustomEvent<AiFallbackNotice>(AI_FALLBACK_EVENT, {
      detail: {
        id: `${task}-${Date.now()}`,
        task,
        title: `${taskLabels[task]} used local fallback output.`,
        message: `Secure AI request failed: ${reason}`,
      },
    }),
  )
}

async function runWithSecureFallback<T>(
  task: AiRequestPayload['task'],
  secureAction: () => Promise<T>,
  fallbackAction: () => T,
) {
  if (getAiRuntime().mode === 'mock') {
    return fallbackAction()
  }

  try {
    return await secureAction()
  } catch (error) {
    emitAiFallback(task, error)
    return fallbackAction()
  }
}

async function callSecureAi<TTask extends AiRequestPayload['task']>(
  payload: Extract<AiRequestPayload, { task: TTask }>,
) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = (await response.json()) as AiApiResponse

  if (!response.ok || !result.ok) {
    const reason = result.ok ? `Request failed with ${response.status}` : result.error
    throw new Error(reason)
  }

  return result.data as Extract<AiResponsePayload, { task: TTask }>
}

export async function generateSummary(notes: string) {
  return runWithSecureFallback(
    'study-summary',
    async () => {
      const response = await callSecureAi({ task: 'study-summary', notes })
      return response.bullets
    },
    () => buildMockSummary(notes),
  )
}

export async function generateQuiz(notes: string) {
  return runWithSecureFallback(
    'study-quiz',
    async () => {
      const response = await callSecureAi({ task: 'study-quiz', notes })
      return response.questions
    },
    () => buildMockQuiz(notes),
  )
}

export async function answerStudyQuestion(notes: string, question: string, history: ChatMessage[]) {
  return runWithSecureFallback(
    'study-chat',
    async () => {
      const response = await callSecureAi({ task: 'study-chat', notes, question, history })
      return response.answer
    },
    () => buildMockStudyAnswer(notes, question),
  )
}

export async function analyzePerformance(rows: PerformanceRow[]) {
  return runWithSecureFallback(
    'performance-insights',
    async () => {
      const response = await callSecureAi({ task: 'performance-insights', rows })
      return response.insight
    },
    () => buildMockPerformanceInsight(rows),
  )
}

export async function solveHomework(question: string) {
  return runWithSecureFallback(
    'homework-solve',
    async () => {
      const response = await callSecureAi({ task: 'homework-solve', question })
      return response.steps
    },
    () => buildMockHomeworkSolution(question),
  )
}

export async function explainHomeworkSimply(question: string) {
  return runWithSecureFallback(
    'homework-simple',
    async () => {
      const response = await callSecureAi({ task: 'homework-simple', question })
      return response.explanation
    },
    () => buildMockHomeworkSimple(question),
  )
}

export async function generateSimilarQuestions(question: string) {
  return runWithSecureFallback(
    'homework-practice',
    async () => {
      const response = await callSecureAi({ task: 'homework-practice', question })
      return response.questions
    },
    () => buildMockPracticeQuestions(question),
  )
}

export async function askJarvis(question: string, history: ChatMessage[]) {
  return runWithSecureFallback(
    'jarvis-chat',
    async () => {
      const response = await callSecureAi({ task: 'jarvis-chat', question, history })
      return response.answer
    },
    () => `I'm currently operating in demo mode. To unlock my full capabilities, please configure the secure AI server. In the meantime, I received your question: "${question}" — and I assure you, the real J.A.R.V.I.S. would have a brilliant answer ready.`,
  )
}

export async function generateFlashcards(notes: string, count = 8) {
  return runWithSecureFallback(
    'flashcard-generate',
    async () => {
      const response = await callSecureAi({ task: 'flashcard-generate', notes, count })
      return response.cards
    },
    () => buildMockFlashcards(notes, count),
  )
}
