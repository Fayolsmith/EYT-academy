'use client';

import { createSPASassClient, createSPAClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EYTService } from '@/lib/eyt-service';
import { Sparkles, Mail, UserCheck } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [mode, setMode] = useState<'password' | 'magic_link'>('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (EYTService.isSupabaseConfigured()) {
                const client = await createSPASassClient();
                const { error: signInError } = await client.loginEmail(email, password);
                if (signInError) throw signInError;
            } else {
                // Local demo fallback
                if (email.toLowerCase().includes('sarah')) {
                    EYTService.switchToOwner();
                } else {
                    EYTService.switchToParent();
                }
            }
            router.push('/app');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred. Please try again.');
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
                setError('Unable to send magic link.');
            }
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (role: 'parent' | 'owner') => {
        if (role === 'owner') {
            EYTService.switchToOwner();
        } else {
            EYTService.switchToParent();
        }
        router.push('/app');
    };

    return (
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10 space-y-6">
            {/* Login Mode Toggle */}
            <div className="flex rounded-xl bg-[#E8F0FA] p-1 border border-[#C7DAF3]/50">
                <button
                    type="button"
                    onClick={() => setMode('password')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mode === 'password'
                            ? 'bg-white text-[#1E4E8C] shadow-xs'
                            : 'text-[#6B7280] hover:text-[#1E4E8C]'
                    }`}
                >
                    Password Sign In
                </button>
                <button
                    type="button"
                    onClick={() => setMode('magic_link')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mode === 'magic_link'
                            ? 'bg-white text-[#1E4E8C] shadow-xs'
                            : 'text-[#6B7280] hover:text-[#1E4E8C]'
                    }`}
                >
                    Magic Link (Email)
                </button>
            </div>

            {error && (
                <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            {magicLinkSent ? (
                <div className="text-center py-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8F0FA] text-[#1E4E8C] flex items-center justify-center mx-auto">
                        <Mail className="w-6 h-6 text-[#D4A017]" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                        Check your email!
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                        We sent a secure login magic link to <strong>{email}</strong>. Click it to log directly into your portal.
                    </p>
                    <button
                        onClick={() => setMagicLinkSent(false)}
                        className="text-xs font-semibold text-[#1E4E8C] hover:underline pt-2 block mx-auto"
                    >
                        Back to Login
                    </button>
                </div>
            ) : mode === 'password' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                            Email address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="parent@example.com"
                            className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#1E4E8C] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider">
                                Password
                            </label>
                            <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#1E4E8C] hover:underline">
                                Forgot?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#1E4E8C] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-[#1E4E8C] text-white text-sm font-bold hover:bg-[#153763] transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In to Portal'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                            Enter your email for Magic Link
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="parent@example.com"
                            className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#1E4E8C] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-[#D4A017] text-white text-sm font-bold hover:bg-[#A9790A] transition-all shadow-md shadow-amber-200 disabled:opacity-50"
                    >
                        {loading ? 'Sending link...' : 'Send Magic Link to Email'}
                    </button>
                </form>
            )}

            {/* Quick Demo Preview Access for Testing */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#D4A017]" />
                    Instant Client Demo Access
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => quickLogin('parent')}
                        className="py-2 px-2.5 rounded-xl border border-[#C7DAF3] bg-[#E8F0FA] text-[#1E4E8C] text-xs font-bold hover:bg-[#d8e6f7] transition-all text-center flex items-center justify-center gap-1"
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Demo Parent</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => quickLogin('owner')}
                        className="py-2 px-2.5 rounded-xl border border-[#F3E7C4] bg-[#FCFBF7] text-[#D4A017] text-xs font-bold hover:bg-[#faeed0] transition-all text-center flex items-center justify-center gap-1"
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Demo Mrs Sarah</span>
                    </button>
                </div>
            </div>

            <div className="text-center text-xs text-[#6B7280]">
                <span>New client? </span>
                <Link href="/auth/register" className="font-bold text-[#1E4E8C] hover:underline">
                    Create a Parent Account
                </Link>
            </div>
        </div>
    );
}