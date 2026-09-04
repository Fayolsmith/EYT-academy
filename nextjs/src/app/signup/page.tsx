'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Mail, Lock, User, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { createSPAClient } from '@/lib/supabase/client';
import { EYTService } from '@/lib/eyt-service';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (EYTService.isSupabaseConfigured()) {
        const client = createSPAClient();
        // Strictly force role to 'parent' — owner/tutor cannot be minted publicly
        const { data: authData, error: signUpError } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              role: 'parent', // Enforced parent role
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          EYTService.setCurrentUser({
            id: authData.user.id,
            role: 'parent',
            full_name: fullName,
            email: email,
            phone: phone,
            avatar_url: null,
          });
        }
      } else {
        // Fallback for preview before Supabase keys are configured
        EYTService.setCurrentUser({
          id: `parent-${Date.now()}`,
          role: 'parent', // Strictly parent
          full_name: fullName || 'Parent',
          phone: phone || null,
          email: email,
          avatar_url: null,
        });
      }

      router.push('/app?new_account=true');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
            Parent Account Registration
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Access lesson schedules, milestone reports, and home materials
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10 space-y-6">
          
          <div className="p-3 bg-[#E8F0FA] rounded-xl border border-[#C7DAF3] flex items-center gap-2.5 text-xs text-[#1E4E8C]">
            <ShieldCheck className="w-4 h-4 text-[#D4A017] shrink-0" />
            <span>Public registration creates a secure <strong>Parent Portal</strong> account.</span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Parent / Guardian Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mrs Elizabeth Adeleke"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent outline-none transition-all"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Phone Number / WhatsApp *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08023456789"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent outline-none transition-all"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Email Address *
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

            <div>
              <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                Create Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#D4A017] text-white text-sm font-bold hover:bg-[#A9790A] transition-all shadow-md shadow-amber-200 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Parent Account'}
            </button>
          </form>

          <div className="text-center text-xs text-[#6B7280] pt-2 border-t border-gray-100">
            <span>Already have an account? </span>
            <Link href="/login" className="font-bold text-[#1E4E8C] hover:underline">
              Sign in here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
