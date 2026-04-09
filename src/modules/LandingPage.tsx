import { motion } from 'framer-motion'
import { Sparkles, Brain, Clock, Sigma, BarChart3, LogIn, Layers, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function LandingPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[20%] -top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute -right-[10%] top-[40%] h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-6 md:px-8">
        
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Learning OS
          </div>
          <button 
            onClick={signInWithGoogle}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur-md transition hover:bg-white/10"
          >
            <LogIn className="h-4 w-4" />
            Sign in with Google
          </button>
        </nav>

        {/* Hero Section */}
        <main className="mt-24 md:mt-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400">
              Welcome to the future of learning
            </div>
            
            <h1 className="font-display text-5xl font-bold leading-tight tracking-[-0.04em] sm:text-6xl md:text-7xl">
              Stop memorizing. <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Start understanding.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400">
              An all-in-one workspace designed for students who want to cut the noise. Generate summaries, get step-by-step homework solutions, test yourself, and lock in deep work with a unified Pomodoro timer.
            </p>

            <div className="pt-8">
              <button 
                onClick={signInWithGoogle}
                className="relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-blue-600 px-8 py-4 font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
              >
                <span>Continue with Google</span>
              </button>
              <p className="mt-4 text-sm text-slate-500">Secure OAuth. Connect directly with your Google account.</p>
            </div>
          </motion.div>
        </main>

        {/* Features Grids */}
        <section className="mt-32 grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-32">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[34px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Study Copilot</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Upload your raw chaotic notes and immediately transform them into flashcards, bullet points, and multi-choice quizzes using state-of-the-art open source models.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-[34px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sigma className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Homework Solver</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Don't just copy answers. Get step-by-step logic, simpler explanations, and the underlying formulas right inside the workspace context.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-[34px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Performance Tracking</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Log your grades over time and let the AI find your weak spots. It automatically drafts a tailored study plan hitting the exact chapters you struggle with.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-[34px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Focus Engine</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">
              A built in Pomodoro timer with animated radial progress. Keep your time tracked and your mind focused with ambient sounds and a streak tracker.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-[34px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Flashcard Studio</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Generate 3D animated flip-cards from your notes using AI. Test your active recall and track your mastery sequentially across your entire deck.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="rounded-[34px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Study Planner</h3>
            <p className="mt-3 text-slate-400 leading-relaxed">
              Design a visual color-coded weekly schedule. Hit blockages? Let the AI analyze your weak subjects and auto-generate a balanced plan for you.
            </p>
          </motion.div>

        </section>

      </div>
    </div>
  )
}
