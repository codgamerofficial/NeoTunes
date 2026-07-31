'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase-browser';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';

type AuthMode = 'signin' | 'signup' | 'magiclink' | 'forgot';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClientBrowser();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password strength state
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'Too short', color: 'bg-red-500' });

  useEffect(() => {
    if (password.length === 0) {
      setPwdStrength({ score: 0, label: 'Too short', color: 'bg-red-500' });
    } else if (password.length < 6) {
      setPwdStrength({ score: 1, label: 'Weak', color: 'bg-red-400' });
    } else if (password.length < 10) {
      setPwdStrength({ score: 2, label: 'Good strength', color: 'bg-cyan-400' });
    } else {
      setPwdStrength({ score: 3, label: 'Excellent complexity', color: 'bg-emerald-400' });
    }
  }, [password]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#00F5FF', '#9B5CFF', '#34D399'],
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        triggerConfetti();
        setMessage({ type: 'success', text: 'Logged in successfully! Loading workspace...' });
        setTimeout(() => router.push('/home'), 1200);
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              name: name,
            },
          },
        });
        if (error) throw error;
        triggerConfetti();
        setMessage({ type: 'success', text: 'Registered! Please check your email inbox to verify.' });
      } else if (mode === 'magiclink') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Magic Link sent! Please verify in your email app.' });
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password reset link sent! Check your inbox.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred during authentication.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'OAuth redirect failed.' });
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 select-none">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-[#00D4FF]/10 blur-[130px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-[#7A3CFF]/10 blur-[130px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-[28px] p-6 sm:p-8 bg-[#101010]/90 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <NeoTuneLogo size="lg" onClick={() => router.push('/')} />
          
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 text-left w-full">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00D4FF] flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>AI DJ Welcome</span>
            </span>
            <p className="text-xs text-white/60 font-semibold leading-relaxed">
              Sign in to NeoTunes to load your personalized spatial soundscapes and Cloud Locker.
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center space-x-1 rounded-xl bg-white/5 p-1 border border-white/10">
          {[
            { id: 'signin', label: 'Sign In' },
            { id: 'signup', label: 'Sign Up' },
            { id: 'magiclink', label: 'Magic Link' }
          ].map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id as any);
                  setMessage(null);
                }}
                className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                  isActive ? 'bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black shadow-md' : 'text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-left"
            >
              {mode === 'signup' && (
                <div className="relative group">
                  <User className="absolute top-3.5 left-4 h-4.5 w-4.5 text-white/40 group-focus-within:text-[#00D4FF] transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-xs font-semibold text-white placeholder-white/40 outline-none transition-all focus:border-[#00D4FF]"
                  />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute top-3.5 left-4 h-4.5 w-4.5 text-white/40 group-focus-within:text-[#00D4FF] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-xs font-semibold text-white placeholder-white/40 outline-none transition-all focus:border-[#00D4FF]"
                />
              </div>

              {(mode === 'signin' || mode === 'signup') && (
                <div className="relative group">
                  <Lock className="absolute top-3.5 left-4 h-4.5 w-4.5 text-white/40 group-focus-within:text-[#00D4FF] transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-xs font-semibold text-white placeholder-white/40 outline-none transition-all focus:border-[#00D4FF]"
                  />
                </div>
              )}

              {mode === 'signup' && password.length > 0 && (
                <div className="space-y-1.5 pt-1 px-1">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-white/50">
                    <span>Password Complexity</span>
                    <span className="text-[#00D4FF]">{pwdStrength.label}</span>
                  </div>
                  <div className="flex gap-1 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${pwdStrength.color} transition-all duration-300`} style={{ width: `${(pwdStrength.score + 1) * 33.3}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {message && (
            <div className={`rounded-xl p-3 text-xs font-bold border text-left ${message.type === 'success' ? 'border-[#34D399]/30 bg-[#34D399]/10 text-[#34D399]' : 'border-[#FF2D95]/30 bg-[#FF2D95]/10 text-[#FF2D95]'}`}>
              {message.text}
            </div>
          )}

          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-[10px] font-bold text-white/50 hover:text-[#00D4FF] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[10px] font-bold text-white/50 hover:text-[#00D4FF] transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] py-3 text-xs font-extrabold uppercase tracking-widest text-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'magiclink' && 'Send Magic Link'}
                  {mode === 'forgot' && 'Reset Password'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Featured Google Sign In Section */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="text-center text-[10px] font-mono uppercase tracking-widest text-white/40">
              OR SIGN IN WITH
            </div>

            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#00D4FF]/40 rounded-xl py-3 px-4 active:scale-98 transition-all text-xs font-bold text-white shadow-md group"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.67-5.17 3.67-8.45z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.08C3.26 21.88 7.37 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.29a7.18 7.18 0 0 1 0-2.58V8.63H1.29a11.97 11.97 0 0 0 0 6.74l3.98-3.08z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.12 1.29 5.71l3.98 3.08c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
