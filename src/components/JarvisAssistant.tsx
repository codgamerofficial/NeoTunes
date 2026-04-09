import { useState, useRef, useEffect, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Sparkles, Loader2, Bot, User, Trash2 } from 'lucide-react'
import { askJarvis } from '../lib/ai'
import type { ChatMessage } from '../types'

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'assistant',
      content:
        'Good day. I am J.A.R.V.I.S., your personal AI learning assistant. I can help you with any academic subject — mathematics, science, history, programming, writing, and more. How may I assist you today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      const answer = await askJarvis(trimmed, [...messages, userMessage])

      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            content: answer,
          },
        ])
        setIsThinking(false)
      })
    } catch {
      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'assistant',
            content:
              'I apologize — I encountered a connectivity issue with my core systems. Please try again momentarily.',
          },
        ])
        setIsThinking(false)
      })
    }
  }

  function handleClear() {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: 'Memory cleared. How may I assist you next?',
      },
    ])
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="jarvis-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full shadow-2xl"
            {...{ style: {
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1, #8b5cf6)',
              boxShadow:
                '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(14, 165, 233, 0.2), 0 8px 32px rgba(0,0,0,0.3)',
            }}}
            title="Open J.A.R.V.I.S. Assistant"
            aria-label="Open J.A.R.V.I.S. Assistant"
          >
            <Sparkles className="h-7 w-7 text-white" />

            {/* Pulsing ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              {...{ style: {
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              }}}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="jarvis-panel"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-5 right-5 z-[100] flex flex-col overflow-hidden rounded-[28px] border shadow-2xl"
            {...{ style: {
              width: 'min(420px, calc(100vw - 40px))',
              height: 'min(620px, calc(100vh - 100px))',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.97) 0%, rgba(10, 15, 30, 0.99) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.25)',
              boxShadow:
                '0 0 40px rgba(99, 102, 241, 0.15), 0 0 80px rgba(14, 165, 233, 0.08), 0 25px 60px rgba(0,0,0,0.5)',
            }}}
          >
            {/* Header */}
            <div
              className="relative flex items-center justify-between px-5 py-4"
              {...{ style: {
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(99, 102, 241, 0.1))',
                borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
              }}}
            >
              <div className="flex items-center gap-3">
                {/* Jarvis Icon */}
                <div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full"
                  {...{ style: {
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                  }}}
                >
                  <Bot className="h-5 w-5 text-white" />
                  {/* Live indicator */}
                  <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <div>
                  <h3
                    className="text-sm font-bold tracking-wide text-white"
                    {...{ style: { fontFamily: "'Inter', system-ui, sans-serif" } }}
                  >
                    J.A.R.V.I.S.
                  </h3>
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-sky-400/70">
                    {isThinking ? 'Processing...' : 'Online • AI Learning OS'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClear}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                  title="Close J.A.R.V.I.S."
                  aria-label="Close J.A.R.V.I.S."
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      {...{ style: {
                        background:
                          msg.role === 'assistant'
                            ? 'linear-gradient(135deg, #0ea5e9, #6366f1)'
                            : 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow:
                          msg.role === 'assistant'
                            ? '0 0 12px rgba(99, 102, 241, 0.3)'
                            : '0 0 12px rgba(16, 185, 129, 0.3)',
                      }}}
                    >
                      {msg.role === 'assistant' ? (
                        <Bot className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className="max-w-[80%] rounded-2xl px-4 py-3 text-[0.85rem] leading-relaxed"
                      {...{ style:
                        msg.role === 'assistant'
                          ? {
                              background: 'rgba(30, 41, 59, 0.8)',
                              border: '1px solid rgba(99, 102, 241, 0.12)',
                              color: '#e2e8f0',
                            }
                          : {
                              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))',
                              border: '1px solid rgba(14, 165, 233, 0.2)',
                              color: '#f1f5f9',
                            }
                      }}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Thinking Indicator */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5"
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    {...{ style: {
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      boxShadow: '0 0 12px rgba(99, 102, 241, 0.3)',
                    }}}
                  >
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-3"
                    {...{ style: {
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(99, 102, 241, 0.12)',
                    }}}
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                    <span className="text-[0.8rem] text-sky-400/80">Analyzing...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Bar */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              {...{ style: {
                background: 'rgba(15, 23, 42, 0.9)',
                borderTop: '1px solid rgba(99, 102, 241, 0.12)',
              }}}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask me anything..."
                title="Message input"
                className="flex-1 rounded-xl border bg-transparent px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-sky-500/50"
                {...{ style: {
                  borderColor: 'rgba(99, 102, 241, 0.15)',
                  background: 'rgba(30, 41, 59, 0.5)',
                }}}
                disabled={isThinking}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={isThinking || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-30"
                {...{ style: {
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  boxShadow: input.trim() ? '0 0 16px rgba(99, 102, 241, 0.3)' : 'none',
                }}}
                title="Send message"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
