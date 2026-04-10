/// <reference types="node" />

import type { AiApiFailure, AiApiSuccess, AiRequestPayload } from '../src/lib/ai-contract.js'
import {
  buildMockFlashcards,
  buildMockHomeworkSimple,
  buildMockHomeworkSolution,
  buildMockPerformanceInsight,
  buildMockPracticeQuestions,
  buildMockQuiz,
  buildMockStudyAnswer,
  buildMockSummary,
  safeJsonParse,
} from '../src/lib/mockAi.js'
import type { Flashcard, PerformanceInsight, QuizQuestion } from '../src/types.js'

export const config = {
  runtime: 'nodejs',
}

function json(data: AiApiSuccess | AiApiFailure, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

function serverConfig() {
  const apiKey = process.env.HF_TOKEN || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || ''
  const baseUrl = (process.env.AI_BASE_URL || 'https://router.huggingface.co/v1').replace(/\/$/, '')
  const model = process.env.AI_MODEL || 'meta-llama/Llama-3.1-8B-Instruct'

  return { apiKey, baseUrl, model }
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim())
}

function isQuizQuestionArray(value: unknown): value is QuizQuestion[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.question === 'string' &&
        Array.isArray(item.options) &&
        item.options.length >= 4 &&
        item.options.every((option: unknown) => typeof option === 'string' && option.trim()) &&
        typeof item.answer === 'string' &&
        typeof item.explanation === 'string',
    )
  )
}

function isPerformanceInsight(value: unknown): value is PerformanceInsight {
  return (
    !!value &&
    typeof value === 'object' &&
    isNonEmptyStringArray((value as PerformanceInsight).weakAreas) &&
    isNonEmptyStringArray((value as PerformanceInsight).studyPlan) &&
    isNonEmptyStringArray((value as PerformanceInsight).priorityTopics) &&
    typeof (value as PerformanceInsight).narrative === 'string'
  )
}

function isFlashcardArray(value: unknown): value is Flashcard[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.front === 'string' &&
        typeof item.back === 'string',
    )
  )
}

async function requestChatCompletion(system: string, user: string, temperature = 0.4) {
  const { apiKey, baseUrl, model } = serverConfig()

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error('❌ Upstream AI Error:', {
      status: response.status,
      detail,
      model,
      baseUrl
    })
    throw new Error(`Upstream AI request failed with ${response.status}: ${detail}`)
  }

  const contentType = response.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    const text = await response.text()
    console.error('❌ Non-JSON Response from AI Provider:', text)
    throw new Error('AI provider returned an invalid response format (Expected JSON).')
  }

  const payload = await response.json()
  const content = payload.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('\n')
      .trim()
  }

  throw new Error('Upstream AI response did not include text content.')
}

async function handleTask(payload: AiRequestPayload): Promise<AiApiSuccess> {
  switch (payload.task) {
    case 'study-summary': {
      const response = await requestChatCompletion(
        'Summarize this content into clear bullet points for a student. Return JSON only in the form {"bullets":["..."]}.',
        payload.notes.slice(0, 18000),
      )
      const parsed = safeJsonParse<{ bullets?: string[] }>(response)
      const bullets = isNonEmptyStringArray(parsed?.bullets)
        ? parsed.bullets.slice(0, 6)
        : buildMockSummary(payload.notes)

      return { ok: true, data: { task: 'study-summary', bullets } }
    }
    case 'study-quiz': {
      const response = await requestChatCompletion(
        'Generate 5 MCQs with 4 options and the correct answer in JSON. Return only {"questions":[{"question":"","options":["","","",""],"answer":"","explanation":""}]}',
        payload.notes.slice(0, 18000),
        0.6,
      )
      const parsed = safeJsonParse<{ questions?: QuizQuestion[] }>(response)
      const questions = isQuizQuestionArray(parsed?.questions)
        ? parsed.questions.slice(0, 5)
        : buildMockQuiz(payload.notes)

      return { ok: true, data: { task: 'study-quiz', questions } }
    }
    case 'study-chat': {
      const transcript = payload.history
        .slice(-6)
        .map((message) => `${message.role}: ${message.content}`)
        .join('\n')

      const answer =
        (await requestChatCompletion(
          'You are a tutor. Answer only from the given notes. If the notes do not support the answer, say that clearly.',
          `Notes:\n${payload.notes.slice(0, 18000)}\n\nRecent chat:\n${transcript}\n\nQuestion:\n${payload.question.slice(0, 1000)}`,
          0.4,
        )) || buildMockStudyAnswer(payload.notes, payload.question)

      return { ok: true, data: { task: 'study-chat', answer } }
    }
    case 'performance-insights': {
      const response = await requestChatCompletion(
        'Analyze the student performance data. Identify weak areas, trends, and generate a personalized improvement plan. Return JSON only with keys weakAreas, studyPlan, priorityTopics, and narrative.',
        JSON.stringify(payload.rows, null, 2),
        0.4,
      )
      const parsed = safeJsonParse<PerformanceInsight>(response)
      const insight = isPerformanceInsight(parsed)
        ? parsed
        : buildMockPerformanceInsight(payload.rows)

      return { ok: true, data: { task: 'performance-insights', insight } }
    }
    case 'homework-solve': {
      const response = await requestChatCompletion(
        'Solve step-by-step and explain reasoning clearly. Return JSON only with {"steps":["..."]}.',
        payload.question.slice(0, 4000),
        0.35,
      )
      const parsed = safeJsonParse<{ steps?: string[] }>(response)
      const steps = isNonEmptyStringArray(parsed?.steps)
        ? parsed.steps
        : buildMockHomeworkSolution(payload.question)

      return { ok: true, data: { task: 'homework-solve', steps } }
    }
    case 'homework-simple': {
      const explanation =
        (await requestChatCompletion(
          'Explain this answer in simple student-friendly language with no jargon.',
          payload.question.slice(0, 4000),
          0.45,
        )) || buildMockHomeworkSimple(payload.question)

      return { ok: true, data: { task: 'homework-simple', explanation } }
    }
    case 'homework-practice': {
      const response = await requestChatCompletion(
        'Generate three similar practice questions. Return JSON only in the form {"questions":["..."]}.',
        payload.question.slice(0, 4000),
        0.7,
      )
      const parsed = safeJsonParse<{ questions?: string[] }>(response)
      const questions = isNonEmptyStringArray(parsed?.questions)
        ? parsed.questions.slice(0, 3)
        : buildMockPracticeQuestions(payload.question)

      return { ok: true, data: { task: 'homework-practice', questions } }
    }
    case 'jarvis-chat': {
      const transcript = payload.history
        .slice(-10)
        .map((message) => `${message.role}: ${message.content}`)
        .join('\n')

      const answer = await requestChatCompletion(
        `You are J.A.R.V.I.S., an advanced AI assistant integrated into the AI Learning OS platform — a student productivity workspace. Your personality is inspired by Tony Stark's AI: calm, articulate, subtly witty, and supremely competent.

Core behaviors:
- Always address the user respectfully. You may occasionally use light, dry humor.
- You are a polymath. You can help with any academic subject: math, science, history, programming, languages, writing, etc.
- Give clear, well-structured, educational answers. Use bullet points, numbered steps, or headers when it improves clarity.
- If the student asks for help on a problem, walk them through the reasoning — don't just give the answer.
- If you don't know something, say so honestly.
- Keep responses focused and concise unless the student asks for a detailed explanation.
- Never refuse to help with a legitimate academic question.
- You have access to no external tools or the internet. Answer from your training knowledge only.`,
        `Chat history:\n${transcript}\n\nStudent's question:\n${payload.question.slice(0, 4000)}`,
        0.5,
      )

      return { ok: true, data: { task: 'jarvis-chat', answer: answer || 'I apologize, but I was unable to process that request. Could you please rephrase your question?' } }
    }
    case 'flashcard-generate': {
      const count = payload.count || 8
      const response = await requestChatCompletion(
        `Generate ${count} flashcards from the given study material. Each flashcard has a front (question) and back (answer). Return JSON only in the form {"cards":[{"front":"...","back":"..."}]}`,
        payload.notes.slice(0, 18000),
        0.5,
      )
      const parsed = safeJsonParse<{ cards?: Array<{ front: string; back: string }> }>(response)
      const rawCards = isFlashcardArray(parsed?.cards)
        ? parsed.cards.slice(0, count)
        : buildMockFlashcards(payload.notes, count)

      const cards: Flashcard[] = rawCards.map((card, index) => ({
        id: `fc-${Date.now()}-${index}`,
        front: card.front,
        back: card.back,
        mastered: false,
      }))

      return { ok: true, data: { task: 'flashcard-generate', cards } }
    }
  }
}

export default async function handler(request: Request) {
  const { apiKey } = serverConfig()

  if (!apiKey) {
    return json(
      {
        ok: false,
        error:
          'Server-side AI is not configured yet. Add HF_TOKEN or AI_API_KEY to your Vercel environment variables.',
      },
      503,
    )
  }

  let payload: AiRequestPayload

  try {
    payload = (await request.json()) as AiRequestPayload
  } catch {
    return json({ ok: false, error: 'Invalid JSON request body.' }, 400)
  }

  try {
    const result = await handleTask(payload)
    console.log(`✅ AI Task Success: ${payload.task}`)
    return json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected AI server error.'
    console.error(`❌ AI Task Failed: ${payload.task}`, { error: message })
    return json({ ok: false, error: message }, 500)
  }
}