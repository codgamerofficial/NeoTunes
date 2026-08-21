'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase-browser';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';

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

  // Validation helpers
  const isValidEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();

    // Field Validations
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
          localStorage.setItem('neotunes_user', JSON.stringify({
            email: data.user.email,
            name: data.user.user_metadata?.full_name || name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80',
          }));
        }

        setSuccessMessage('Signed in successfully! Redirecting...');
        setTimeout(() => router.push('/'), 600);

      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              name: name.trim(),
            },
          },
        });

        if (error) {
          if (error.message.includes('User already registered') || error.message.includes('already exists')) {
            setErrorMessage('An account with this email already exists.');
          } else {
            setErrorMessage(error.message);
          }
          setLoading(false);
          return;
        }

        if (data?.user) {
          localStorage.setItem('neotunes_user', JSON.stringify({
            email: trimmedEmail,
            name: name.trim(),
            avatar_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&q=80',
          }));
        }

        setSuccessMessage('Account created! Setting up your preferences...');
        setTimeout(() => router.push('/auth/preferences'), 800);

      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('We have sent password reset instructions to your email.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOauthConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    if (!isOauthConfigured) {
      setErrorMessage(`${provider.toUpperCase()} authentication is not configured in this environment.`);
      return;
    }
    setLoading(true);
    const supabase = createClientBrowser();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || 'OAuth authentication failed.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#05070B] text-[#F5F5F7] px-4 font-sans select-none overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 -z-10 h-80 w-80 rounded-full bg-[#00D9FF]/10 blur-[130px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 -z-10 h-80 w-80 rounded-full bg-[#DFFF00]/10 blur-[130px] animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#08090C]/90 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2 relative">
          <button
            onClick={() => router.push('/welcome')}
            className="absolute left-0 top-0 p-2 rounded-full bg-white/5 border border-white/10 text-[#A1A1A6] hover:text-white transition-all cursor-pointer"
            title="Back to Welcome"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <NeoTuneLogo size="md" onClick={() => router.push('/')} />

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight pt-2">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-[#A1A1A6]">
            {mode === 'signin' && 'Sign in to continue your listening journey.'}
            {mode === 'signup' && 'Join NeoTunes and build your personal sound universe.'}
            {mode === 'forgot' && 'Enter your email to receive a password reset link.'}
          </p>
        </div>

        {/* Social Auth Option (Only displayed if configured) */}
        {mode !== 'forgot' && isOauthConfigured && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-[#DFFF00]/40 hover:bg-white/10 rounded-2xl py-3 px-4 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.67-5.17 3.67-8.45z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.08C3.26 21.88 7.37 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.29a7.18 7.18 0 0 1 0-2.58V8.63H1.29a11.97 11.97 0 0 0 0 6.74l3.98-3.08z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.12 1.29 5.71l3.98 3.08c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleAuth} className="space-y-3.5" noValidate>
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute top-3.5 left-4 h-4 w-4 text-[#A1A1A6]" />
              <input
                type="text"
                required
                placeholder="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-xs text-white placeholder-[#A1A1A6] outline-none focus:border-[#DFFF00] transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute top-3.5 left-4 h-4 w-4 text-[#A1A1A6]" />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-4 pl-11 text-xs text-white placeholder-[#A1A1A6] outline-none focus:border-[#DFFF00] transition-colors"
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute top-3.5 left-4 h-4 w-4 text-[#A1A1A6]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-11 pl-11 text-xs text-white placeholder-[#A1A1A6] outline-none focus:border-[#DFFF00] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-4 text-[#A1A1A6] hover:text-white"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div className="relative">
              <Lock className="absolute top-3.5 left-4 h-4 w-4 text-[#A1A1A6]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pr-11 pl-11 text-xs text-white placeholder-[#A1A1A6] outline-none focus:border-[#DFFF00] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-3.5 right-4 text-[#A1A1A6] hover:text-white"
                title={showConfirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 rounded-2xl text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl text-xs font-bold bg-[#DFFF00]/10 border border-[#DFFF00]/30 text-[#DFFF00] flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode('forgot'); setErrorMessage(null); setSuccessMessage(null); }}
                className="text-[11px] font-medium text-[#A1A1A6] hover:text-[#DFFF00] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Email'}
                </span>
                <ArrowRight className="h-4 w-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher Footer */}
        <div className="text-center text-xs text-[#A1A1A6] pt-2 border-t border-white/10">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                className="text-white font-bold hover:text-[#DFFF00] underline cursor-pointer ml-1"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
                className="text-white font-bold hover:text-[#DFFF00] underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </>
          )}
        </div>

      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#05070B] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#DFFF00]" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
