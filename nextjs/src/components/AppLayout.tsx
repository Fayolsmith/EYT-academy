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
    UserCheck
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDev, setIsDev] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const { profile, user, loading, logout, setRole } = useGlobal();
    const isOwner = profile?.role === 'owner';

    useEffect(() => {
        if (
            process.env.NODE_ENV === 'development' &&
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ) {
            setIsDev(true);
        }
    }, []);

    useEffect(() => {
        if (!loading && !profile && !user) {
            router.replace('/login');
        }
    }, [loading, profile, user, router]);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    const toggleRole = () => {
        if (isOwner) {
            setRole('parent');
        } else {
            setRole('owner');
        }
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
                            <span>Role: <strong className="capitalize text-[#1E4E8C]">{profile?.role || 'Parent'}</strong></span>
                        </div>
                        {isDev && (
                            <button
                                onClick={toggleRole}
                                className="text-[11px] font-bold text-[#D4A017] hover:underline"
                                title="Localhost Dev only: Switch view between Parent and Owner"
                            >
                                Toggle View
                            </button>
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
                        {/* Quick Role Switcher Button - Localhost Dev Only */}
                        {isDev && (
                            <button
                                onClick={toggleRole}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#C7DAF3] bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-all"
                            >
                                <UserCheck className="w-3.5 h-3.5 text-[#D4A017]" />
                                <span className="hidden sm:inline">Switch Mode:</span>
                                <span className="text-[#D4A017]">{isOwner ? 'Mrs Sarah' : 'Parent'}</span>
                            </button>
                        )}

                        <Link
                            href="/"
                            className="hidden sm:flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-[#14263F] hover:bg-gray-50 transition-all"
                        >
                            Public Site
                        </Link>
                    </div>
                </header>

                {/* Dashboard Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}