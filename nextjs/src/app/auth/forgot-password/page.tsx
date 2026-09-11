'use client';

import { useState } from 'react';
import { createSPASassClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/motion';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = await createSPASassClient();
            const { error } = await supabase.getSupabaseClient().auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An error occurred while requesting password reset.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10">
                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
                            <CheckCircle className="w-8 h-8" />
                        </div>

                        <h2 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                            Check Your Email
                        </h2>

                        <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                            We have sent a secure password reset link to <strong className="text-[#14263F]">{email}</strong>. Please check your inbox and follow the instructions.
                        </p>

                        <div className="pt-4">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shadow-xs"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Return to Sign In
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="font-heading text-2xl font-extrabold text-[#1E4E8C]">
                                Reset Your Password
                            </h2>
                            <p className="text-xs text-[#6B7280]">
                                Enter your registered account email and we will send you a password recovery link.
                            </p>
                        </div>

                        {error && (
                            <div className="p-3.5 rounded-xl text-xs text-rose-700 bg-rose-50 border border-rose-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-xs font-bold text-[#14263F]">
                                    Registered Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="e.g. parent@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs text-[#14263F] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E4E8C] focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 rounded-xl bg-[#1E4E8C] hover:bg-[#153763] text-white font-bold text-xs tracking-wide transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {loading ? 'Sending Recovery Link...' : 'Send Password Reset Link'}
                            </button>
                        </form>

                        <div className="pt-2 text-center text-xs text-[#6B7280]">
                            Remembered your password?{' '}
                            <Link href="/login" className="font-bold text-[#1E4E8C] hover:underline">
                                Return to Sign In
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </PageTransition>
    );
}