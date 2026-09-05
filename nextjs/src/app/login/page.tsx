'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Mail, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { createSPAClient } from '@/lib/supabase/client';
import { EYTService } from '@/lib/eyt-service';
import { PageTransition } from '@/components/motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'password' | 'magic_link'>('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Switcher is strictly enabled on localhost during local dev testing only
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setIsDev(true);
    }
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (EYTService.isSupabaseConfigured()) {
        const client = createSPAClient();
        const { data: authData, error: signInError } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (authData.user) {
          // Read the user's role from the profiles table
          const { data: profileData } = await client
            .from('profiles')
            .select('role, full_name')
            .eq('id', authData.user.id)
            .maybeSingle();

          interface ProfileRow {
            role?: 'owner' | 'parent' | 'tutor';
            full_name?: string | null;
          }
          const profileRow = profileData as unknown as ProfileRow | null;
          const role = profileRow?.role || 'parent';

          // Update local session
          EYTService.setCurrentUser({
            id: authData.user.id,
            role: role === 'owner' ? 'owner' : 'parent',
            full_name: profileRow?.full_name || authData.user.email?.split('@')[0] || 'User',
            email: authData.user.email || email,
            phone: null,
            avatar_url: null,
          });

          // Redirect based on role
          window.location.href = '/app';
          return;
        }
      } else {
        // Fallback when Supabase keys are not set up yet
        const cleanEmail = email.toLowerCase().trim();
        if (cleanEmail === 'sarahoakhena@gmail.com' || cleanEmail === 'sarahofure45@gmail.com' || cleanEmail.includes('sarah')) {
          EYTService.loginAsOwner();
        } else {
          EYTService.loginAsParent();
        }
        window.location.href = '/app';
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (EYTService.isSupabaseConfigured()) {
        const client = createSPAClient();
        const { error: magicError } = await client.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (magicError) throw magicError;
      }
      setMagicLinkSent(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to send magic link. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Local dev shortcut helper
  const handleDevQuickLogin = (role: 'owner' | 'parent') => {
    if (role === 'owner') {
      setEmail('sarahoakhena@gmail.com');
      setPassword('admin123');
      EYTService.loginAsOwner();
    } else {
      setEmail('elizabeth@example.com');
      setPassword('parent123');
      EYTService.loginAsParent();
    }
    window.location.href = '/app';
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F3F7FD]/40">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold text-[#1E4E8C] hover:text-[#153763] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 text-[#D4A017]" />
          Back to Public Website
        </Link>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1E4E8C] flex items-center justify-center text-white mx-auto border-2 border-[#D4A017] shadow-md">
            <BookOpen className="w-7 h-7 text-[#D4A017]" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C] mt-3">
            Sign In to Mrs Sarah Tutoring
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            One shared portal for Parents & Mrs Sarah
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10 space-y-6">
          
          {/* Method Toggle: Password vs Magic Link */}
          <div className="flex rounded-xl bg-[#E8F0FA] p-1 border border-[#C7DAF3]/50">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'password'
                  ? 'bg-white text-[#1E4E8C] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1E4E8C]'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode('magic_link')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'magic_link'
                  ? 'bg-white text-[#1E4E8C] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1E4E8C]'
              }`}
            >
              Magic Link
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {magicLinkSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                Check Your Inbox
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                We sent a secure login link to <strong>{email}</strong>. Click the link in your email to sign in automatically.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="text-xs font-bold text-[#1E4E8C] hover:underline pt-2 block mx-auto"
              >
                ← Back to Password Login
              </button>
            </div>
          ) : mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. parent@example.com or sarahoakhena@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#1E4E8C] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1E4E8C] text-white text-sm font-bold hover:bg-[#153763] transition-all shadow-md shadow-blue-200 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#D4A017] text-white text-sm font-bold hover:bg-[#A9790A] transition-all shadow-md shadow-amber-200 disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Magic Link to Email'}
              </button>
            </form>
          )}

          {/* Dev-Only Preview Switcher: HIDDEN in deployed preview */}
          {isDev && (
            <div className="pt-3 border-t border-dashed border-amber-300 bg-amber-50/50 p-3 rounded-xl space-y-2 text-center">
              <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4A017]" />
                Localhost Dev Helper (Hidden in Production)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDevQuickLogin('parent')}
                  className="py-1.5 px-2 rounded-lg bg-white border border-amber-200 text-xs font-bold text-[#1E4E8C] hover:bg-amber-50"
                >
                  Fill Demo Parent
                </button>
                <button
                  type="button"
                  onClick={() => handleDevQuickLogin('owner')}
                  className="py-1.5 px-2 rounded-lg bg-white border border-amber-200 text-xs font-bold text-[#D4A017] hover:bg-amber-50"
                >
                  Fill Demo Sarah
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-[#6B7280] pt-2 border-t border-gray-100">
            <span>New client parent? </span>
            <Link href="/signup" className="font-bold text-[#1E4E8C] hover:underline">
              Create a Parent Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  </PageTransition>
  );
}
