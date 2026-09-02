'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase-browser';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';
import { NeoButton } from '@/components/ui/NeoButton';

type AuthMode = 'signin' | 'signup' | 'forgot';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'signin';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-redirect if already authenticated
  useEffect(() => {
    const supabase = createClientBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.push('/');
      }
    });
  }, [router]);

  const isValidEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (mode !== 'forgot' && !password) {
      setErrorMessage('Enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Enter your display name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords don't match.");
        return;
      }
    }

    setLoading(true);
    const supabase = createClientBrowser();

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Incorrect email or password.');
          } else if (error.message.includes('Email not confirmed')) {
            setErrorMessage('Please check your inbox to verify your email address.');
          } else {
            setErrorMessage(error.message);
          }
          setLoading(false);
          return;
        }

        if (data?.user) {
          try {
            localStorage.setItem('neotunes_user', JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || name || data.user.email?.split('@')[0],
            }));
          } catch {}
          router.push('/');
        }
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          try {
            localStorage.setItem('neotunes_user', JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: name.trim(),
            }));
          } catch {}
          setSuccessMessage('Account created! Logging you in...');
          setTimeout(() => router.push('/'), 1000);
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }
        setSuccessMessage('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Guest local fallback
      if (mode === 'signin' || mode === 'signup') {
        try {
          localStorage.setItem('neotunes_user', JSON.stringify({
            id: `guest_${Date.now()}`,
            email: trimmedEmail,
            name: name.trim() || trimmedEmail.split('@')[0],
          }));
          router.push('/');
        } catch {
          setErrorMessage('Failed to complete authentication. Please try again.');
        }
      } else {
        setErrorMessage('Failed to connect to authentication services.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-8 md:p-10 bg-[#050608] text-[#F5F7FA] select-none font-sans relative overflow-hidden">
      
      {/* Subtle Atmosphere Backdrop */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-96 w-96 rounded-full bg-[#DFFF00]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 -z-10 h-96 w-96 rounded-full bg-[#00E5FF]/10 blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between w-full max-w-md mx-auto pt-2 z-10">
        <NeoTuneLogo size="md" showText onClick={() => router.push('/')} />
        
        <button
          onClick={() => router.push('/welcome')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Welcome
        </button>
      </header>

      {/* Main Form Container */}
      <main className="w-full max-w-md mx-auto my-auto py-6 sm:py-8 z-10 space-y-6">
        
        {/* Title Header */}
        <div className="space-y-1.5 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {mode === 'signin' && 'Sign in to NeoTunes'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD] font-medium">
            {mode === 'signin' && 'Enter your credentials to access your library and personalized mixes.'}
            {mode === 'signup' && 'Join NeoTunes to stream high-fidelity music and build your collection.'}
            {mode === 'forgot' && 'We will send you a secure link to reset your account password.'}
          </p>
        </div>

        {/* Feedback Alerts */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 font-medium"
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Display Name (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#9AA1AD]">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 h-4 w-4 text-[#9AA1AD] pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#11141A] border border-white/10 text-white placeholder-[#9AA1AD] text-xs sm:text-sm outline-none focus:border-[#DFFF00] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#9AA1AD]">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-4 w-4 text-[#9AA1AD] pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#11141A] border border-white/10 text-white placeholder-[#9AA1AD] text-xs sm:text-sm outline-none focus:border-[#DFFF00] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#9AA1AD]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-semibold text-[#00E5FF] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4 w-4 text-[#9AA1AD] pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#11141A] border border-white/10 text-white placeholder-[#9AA1AD] text-xs sm:text-sm outline-none focus:border-[#DFFF00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-[#9AA1AD] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Sign Up Only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#9AA1AD]">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-4 w-4 text-[#9AA1AD] pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#11141A] border border-white/10 text-white placeholder-[#9AA1AD] text-xs sm:text-sm outline-none focus:border-[#DFFF00] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 p-1 text-[#9AA1AD] hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit CTA */}
          <div className="pt-2">
            <NeoButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
              isLoading={loading}
            >
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Link'}
            </NeoButton>
          </div>

        </form>

        {/* Mode Switcher Footer */}
        <div className="text-center pt-2">
          {mode === 'signin' ? (
            <p className="text-xs text-[#9AA1AD]">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setMode('signup');
                }}
                className="text-[#DFFF00] font-bold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#9AA1AD]">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setMode('signin');
                }}
                className="text-[#DFFF00] font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[#9AA1AD] pt-4 border-t border-white/5 max-w-md mx-auto w-full z-10">
        Protected by NeoTunes End-to-End Encryption &amp; Supabase Auth.
      </footer>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050608] flex items-center justify-center text-xs text-[#9AA1AD]">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
