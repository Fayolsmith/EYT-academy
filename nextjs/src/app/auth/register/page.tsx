'use client';

import { createSPAClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EYTService } from '@/lib/eyt-service';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (EYTService.isSupabaseConfigured()) {
                const client = createSPAClient();
                const { error: signUpError } = await client.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone: phone,
                            role: 'parent',
                        },
                    },
                });
                if (signUpError) throw signUpError;
            } else {
                // Local demo registration
                EYTService.setCurrentUser({
                    id: `parent-${Date.now()}`,
                    role: 'parent',
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
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10 space-y-6">
            <div>
                <h3 className="font-heading text-xl font-bold text-[#1E4E8C]">
                    Create Parent Account
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                    Access lesson bookings, child progress & learning resources
                </p>
            </div>

            {error && (
                <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Mrs Elizabeth Adeleke"
                        className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#1E4E8C] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Phone / WhatsApp *
                    </label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 08023456789"
                        className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#1E4E8C] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Email address *
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
                    <label className="block text-xs font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Password *
                    </label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="block w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#1E4E8C] focus:outline-none focus:ring-1 focus:ring-[#1E4E8C]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-[#D4A017] text-white text-sm font-bold hover:bg-[#A9790A] transition-all shadow-md shadow-amber-200 disabled:opacity-50"
                >
                    {loading ? 'Creating Account...' : 'Create Account & Add Child'}
                </button>
            </form>

            <div className="text-center text-xs text-[#6B7280]">
                <span>Already registered? </span>
                <Link href="/auth/login" className="font-bold text-[#1E4E8C] hover:underline">
                    Sign in here
                </Link>
            </div>
        </div>
    );
}