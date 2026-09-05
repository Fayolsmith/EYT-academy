'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    BookOpen,
    Users,
    Calendar,
    Award,
    FileText,
    CreditCard,
    MessageSquare,
    Mail,
    Menu,
    X,
    LogOut,
    Home,
    UserCheck,
    Eye,
    EyeOff
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { profile, user, loading, logout, isParentPreview, previewAsParent, exitParentPreview } = useGlobal();
    const isOwner = profile?.role === 'owner';
    const isRealOwner = user?.role === 'owner' || isParentPreview;

    useEffect(() => {
        if (!loading && !profile && !user) {
            router.replace('/login');
        }
    }, [loading, profile, user, router]);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    // Navigation items tailored to roles
    const parentNav = [
        { name: 'Dashboard Overview', href: '/app', icon: Home },
        { name: 'My Children', href: '/app/children', icon: Users },
        { name: 'Book Session / Schedule', href: '/app/schedule', icon: Calendar },
        { name: 'Milestones & Progress', href: '/app/milestones', icon: Award },
        { name: 'Learning Resources', href: '/app/resources', icon: FileText },
        { name: 'Invoices & Receipts', href: '/app/invoices', icon: CreditCard },
        { name: 'Messages', href: '/app/messages', icon: MessageSquare },
    ];

    const ownerNav = [
        { name: 'Tutor Overview', href: '/app', icon: Home },
        { name: 'Student Directory', href: '/app/children', icon: Users },
        { name: 'Schedule & Slots', href: '/app/schedule', icon: Calendar },
        { name: 'Milestone Tracking', href: '/app/milestones', icon: Award },
        { name: 'Resource Library', href: '/app/resources', icon: FileText },
        { name: 'Enquiry Inbox', href: '/app/enquiries', icon: Mail },
        { name: 'Invoices & Payments', href: '/app/invoices', icon: CreditCard },
        { name: 'Parent Messages', href: '/app/messages', icon: MessageSquare },
    ];

    const navItems = isOwner ? ownerNav : parentNav;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F3F7FD]/40">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#1E4E8C] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-[#1E4E8C]">Loading Portal...</span>
                </div>
            </div>
        );
    }

    if (!profile && !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#F3F7FD]/40 text-[#14263F]">
            {/* Mobile backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-200 ease-in-out z-40 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 flex flex-col justify-between`}
            >
                <div>
                    {/* Brand Header */}
                    <div className="h-20 flex items-center justify-between px-5 border-b border-gray-100 bg-[#1E4E8C] text-white">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-[#D4A017]">
                                <BookOpen className="w-5 h-5 text-[#D4A017]" />
                            </div>
                            <div>
                                <h1 className="font-heading font-bold text-base text-white leading-tight">
                                    Mrs Sarah
                                </h1>
                                <p className="text-[11px] text-[#D4A017] font-medium">
                                    {isOwner ? 'Owner / Tutor Hub' : 'Parent Portal'}
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white/80 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Role Indicator Ribbon */}
                    <div className="p-3 bg-[#E8F0FA] border-b border-[#C7DAF3]/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-[#1E4E8C]">
                            <UserCheck className="w-3.5 h-3.5 text-[#D4A017]" />
                            <span>
                                Role: <strong className="capitalize text-[#1E4E8C]">{isParentPreview ? 'Parent (QA Preview)' : (profile?.role || 'Parent')}</strong>
                            </span>
                        </div>
                        {isRealOwner && (
                            isParentPreview ? (
                                <button
                                    onClick={exitParentPreview}
                                    className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                                    title="Exit preview and return to Mrs Sarah owner dashboard"
                                >
                                    <EyeOff className="w-3 h-3" />
                                    Exit Preview
                                </button>
                            ) : (
                                <button
                                    onClick={previewAsParent}
                                    className="text-[11px] font-bold text-[#1E4E8C] hover:underline flex items-center gap-1"
                                    title="Preview parent view as Mrs Sarah"
                                >
                                    <Eye className="w-3 h-3 text-[#D4A017]" />
                                    Preview Parent
                                </button>
                            )
                        )}
                    </div>

                    {/* Nav Links */}
                    <nav className="p-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? 'bg-[#1E4E8C] text-white shadow-sm'
                                            : 'text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A017]' : 'text-[#6B7280]'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom user profile & back link */}
                <div className="p-4 border-t border-gray-100 bg-[#FCFBF7] space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1E4E8C] text-[#D4A017] flex items-center justify-center font-bold text-xs border border-[#D4A017]">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-[#14263F] truncate">
                                {profile?.full_name || 'User'}
                            </p>
                            <p className="text-[11px] text-[#6B7280] truncate">
                                {profile?.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                        <Link
                            href="/"
                            className="font-semibold text-[#1E4E8C] hover:underline"
                        >
                            ← Public Website
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                                {isOwner ? "Owner Administration" : "Parent Family Portal"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Owner Parent Preview Toggle - strictly restricted to Mrs Sarah */}
                        {isRealOwner && (
                            isParentPreview ? (
                                <button
                                    onClick={exitParentPreview}
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all shadow-xs"
                                >
                                    <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                                    <span>Exit Parent Preview</span>
                                </button>
                            ) : (
                                <button
                                    onClick={previewAsParent}
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#C7DAF3] bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-all"
                                >
                                    <Eye className="w-3.5 h-3.5 text-[#D4A017]" />
                                    <span className="hidden sm:inline">Preview as</span>
                                    <span>Parent</span>
                                </button>
                            )
                        )}

                        <Link
                            href="/"
                            className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-[#14263F] hover:bg-gray-50 transition-all"
                        >
                            Public Site
                        </Link>
                    </div>
                </header>

                {/* QA Parent Preview Banner */}
                {isParentPreview && (
                    <div className="bg-amber-500 text-white px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 text-xs font-semibold shadow-inner">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-700 text-white font-bold uppercase text-[10px] tracking-wider">
                                QA Mode
                            </span>
                            <span>You are previewing the Parent Portal as Mrs Sarah. Real client data remains protected.</span>
                        </div>
                        <button
                            onClick={exitParentPreview}
                            className="px-3 py-1 rounded-lg bg-white text-amber-900 font-bold hover:bg-amber-50 transition-colors shrink-0 shadow-xs"
                        >
                            Exit Preview
                        </button>
                    </div>
                )}

                {/* Dashboard Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}