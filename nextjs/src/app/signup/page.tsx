'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Mail, Lock, User, Phone, ShieldCheck, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { createSPAClient } from '@/lib/supabase/client';
import { EYTService } from '@/lib/eyt-service';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const isBookingIntent = intent === 'booking';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!consentGiven) {
      setError("You must consent to your child's personal data being collected and processed as described in the Privacy Policy to create an account.");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const consentTimestamp = new Date().toISOString();
      let newUserId = '';

      if (EYTService.isSupabaseConfigured()) {
        const client = createSPAClient();
        // Strictly force role to 'parent' — owner/tutor cannot be minted publicly
        const { data: authData, error: signUpError } = await client.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role: 'parent', // Enforced parent role
              parental_consent_given: true,
              parental_consent_at: consentTimestamp,
              parental_consent_version: '2026-v1',
            },
          },
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          newUserId = authData.user.id;
          EYTService.setCurrentUser({
            id: newUserId,
            role: 'parent',
            full_name: fullName.trim(),
            email: normalizedEmail,
            phone: phone.trim() || null,
            avatar_url: null,
            parental_consent_given: true,
            parental_consent_at: consentTimestamp,
            parental_consent_version: '2026-v1',
          });
        }
      } else {
        // Fallback for preview before Supabase keys are configured
        newUserId = `parent-${Date.now()}`;
        EYTService.setCurrentUser({
          id: newUserId,
          role: 'parent', // Strictly parent
          full_name: fullName.trim() || 'Parent',
          phone: phone.trim() || null,
          email: normalizedEmail,
          avatar_url: null,
          parental_consent_given: true,
          parental_consent_at: consentTimestamp,
          parental_consent_version: '2026-v1',
        });
      }

      // Automatically link any student profiles Mrs Sarah may have previously created
      // with matching parent email. Prevents duplicate child profiles!
      const claimedChildren = EYTService.claimChildrenByParentEmail(
        normalizedEmail,
        newUserId,
        fullName.trim(),
        phone.trim()
      );

      if (isBookingIntent) {
        router.push('/app/schedule?intent=booking&new_account=true');
      } else if (claimedChildren.length > 0) {
        router.push('/app?new_account=true&claimed=true');
      } else {
        router.push('/app?new_account=true');
      }
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
            {isBookingIntent ? (
              <Calendar className="w-7 h-7 text-[#D4A017]" />
            ) : (
              <BookOpen className="w-7 h-7 text-[#D4A017]" />
            )}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C] mt-3">
            {isBookingIntent ? 'Book a Session with Mrs Sarah' : 'Parent Account Registration'}
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            {isBookingIntent
              ? 'Create your parent account to choose tutorial timeslots & register your child'
              : 'Access lesson schedules, milestone reports, and home materials'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10 space-y-6">
          
          {isBookingIntent ? (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <Sparkles className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
              <div>
                <strong>High-Intent Booking:</strong> Complete your quick parent setup to select your child’s learning mode (Online or Home) and reserve tutorial slots directly.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#E8F0FA] rounded-xl border border-[#C7DAF3] flex items-center gap-2.5 text-xs text-[#1E4E8C]">
              <ShieldCheck className="w-4 h-4 text-[#D4A017] shrink-0" />
              <span>Public registration creates a secure <strong>Parent Portal</strong> account.</span>
            </div>
          )}

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
              <p className="text-[11px] text-gray-500 mt-1">
                If Mrs Sarah previously enrolled your child, use the same email to automatically connect your child&apos;s records.
              </p>
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Nigeria Data Protection Act 2023 - Mandatory Parental Consent */}
            <div className="pt-1 pb-1">
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] cursor-pointer text-xs text-[#14263F] leading-relaxed select-none hover:border-[#1E4E8C] transition-colors">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#1E4E8C] focus:ring-[#1E4E8C] h-4 w-4 shrink-0"
                />
                <span>
                  I confirm I am the parent or legal guardian, and <strong>I consent to my child&apos;s personal data being collected and processed as described in the{' '}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="font-bold text-[#1E4E8C] hover:underline"
                  >
                    Privacy Policy
                  </Link></strong> and{' '}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-bold text-[#1E4E8C] hover:underline"
                  >
                    Terms of Service
                  </Link>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !consentGiven}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#1E4E8C] text-white font-bold text-sm hover:bg-[#153763] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E4E8C] transition-all shadow-md shadow-blue-200/50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isBookingIntent ? (
                'Continue to Booking Schedule →'
              ) : (
                'Create Parent Account'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center space-y-2">
            <p className="text-xs text-[#6B7280]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#1E4E8C] hover:underline">
                Sign In to Portal
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F3F7FD]/40">
          <div className="w-8 h-8 border-3 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
