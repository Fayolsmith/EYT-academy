'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, Sparkles, Download, LayoutDashboard, MessageCircle, ChevronDown, Camera, Mail, Star } from 'lucide-react';
import { createSPAClient } from '@/lib/supabase/client';
import { EYTService, UserProfile } from '@/lib/eyt-service';
import { usePWA } from '@/lib/context/PWAContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(null);
  const [isDev, setIsDev] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const { isInstallable, promptInstall } = usePWA();

  const checkAuth = async () => {
    if (EYTService.isSupabaseConfigured()) {
      try {
        const client = createSPAClient();
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          const { data: profileData } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const prof = profileData as Record<string, unknown> | null;
          setAuthProfile({
            id: session.user.id,
            email: session.user.email || '',
            full_name: (prof?.full_name as string) || session.user.email?.split('@')[0] || 'User',
            role: (prof?.role as 'owner' | 'parent') || 'parent',
            phone: (prof?.phone as string) || null,
            avatar_url: (prof?.avatar_url as string) || null,
          });
          return;
        }
      } catch (err) {
        console.error('Navbar auth check error:', err);
      }
    }

    // Local authenticated user check
    const localAuth = EYTService.getAuthenticatedUser();
    if (localAuth) {
      setIsAuthenticated(true);
      setAuthProfile(localAuth);
    } else {
      setIsAuthenticated(false);
      setAuthProfile(null);
    }
  };

  useEffect(() => {
    checkAuth();

    // Dev indicator strictly active only in development on localhost
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      setIsDev(true);
    }

    if (EYTService.isSupabaseConfigured()) {
      const client = createSPAClient();
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          checkAuth();
        } else if (!EYTService.isAuthenticated()) {
          setIsAuthenticated(false);
          setAuthProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Close 'More' dropdown on outside click or Escape key
  useEffect(() => {
    if (!isMoreOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

  const handleSignOut = async () => {
    try {
      if (EYTService.isSupabaseConfigured()) {
        const client = createSPAClient();
        await client.auth.signOut();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
    EYTService.logout();
    setIsAuthenticated(false);
    setAuthProfile(null);
    window.location.href = '/';
  };

  return (
    <>
      {/* Top Notification Bar: Limited to announcements and direct contact */}
      <div className="bg-[#1E4E8C] text-white text-xs sm:text-sm py-1.5 px-4 font-body border-b border-[#153763]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-[#D4A017] text-[#14263F] font-semibold text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wider">
              Enrolling Now
            </span>
            <span className="hidden sm:inline">Nursery, Preschool & Primary 1 & 2 (Ages 3–8)</span>
            <span className="sm:hidden">Ages 3–8 Early Years</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/2349133651659"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#D4A017]" />
              <span className="font-semibold">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo: Brand mark and 'Mrs Sarah' only (no persistent age descriptor) */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#1E4E8C] flex items-center justify-center text-white shadow-md group-hover:bg-[#153763] transition-colors relative overflow-hidden border border-[#D4A017] shrink-0">
                <BookOpen className="w-6 h-6 text-[#D4A017]" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#D4A017] rounded-full flex items-center justify-center text-[#14263F]">
                  <Star className="w-2.5 h-2.5 fill-[#14263F]" />
                </div>
              </div>
              <span className="font-heading text-xl sm:text-2xl font-bold text-[#1E4E8C] leading-tight whitespace-nowrap select-none">
                Mrs Sarah
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-6 shrink-0">
              <Link href="#about" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors whitespace-nowrap">
                About Sarah
              </Link>
              <Link href="#services" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors whitespace-nowrap">
                What I Tutor
              </Link>
              <Link href="#why-me" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors whitespace-nowrap">
                Why Learn
              </Link>
              <Link href="#learning-options" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors whitespace-nowrap">
                Learning Options
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors whitespace-nowrap">
                Testimonials
              </Link>

              {/* 'More' dropdown for secondary items (Moments & Contact) */}
              <div ref={moreDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  onMouseEnter={() => setIsMoreOpen(true)}
                  aria-expanded={isMoreOpen}
                  className={`inline-flex items-center gap-1 text-sm font-medium transition-colors whitespace-nowrap py-2 ${
                    isMoreOpen ? 'text-[#1E4E8C]' : 'text-[#14263F] hover:text-[#1E4E8C]'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMoreOpen ? 'rotate-180 text-[#1E4E8C]' : 'text-gray-400'}`} />
                </button>

                {isMoreOpen && (
                  <div
                    onMouseLeave={() => setIsMoreOpen(false)}
                    className="absolute top-full right-0 w-64 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-1">
                      <Link
                        href="#moments"
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#E8F0FA] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E8F0FA] group-hover:bg-white flex items-center justify-center text-[#1E4E8C] shrink-0 transition-colors">
                          <Camera className="w-4 h-4 text-[#D4A017]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1E4E8C]">
                            Moments Gallery
                          </div>
                          <div className="text-[11px] text-[#6B7280]">
                            Glimpses into tutoring moments
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="#enquiry"
                        onClick={() => setIsMoreOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#E8F0FA] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 group-hover:bg-white flex items-center justify-center text-[#D4A017] shrink-0 transition-colors">
                          <Mail className="w-4 h-4 text-[#D4A017]" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1E4E8C]">
                            Direct Contact
                          </div>
                          <div className="text-[11px] text-[#6B7280]">
                            WhatsApp, email & enquiry form
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Action Buttons: Exactly ONE entry point for Sign In/Dashboard */}
            <div className="hidden xl:flex items-center gap-3 shrink-0">
              {isInstallable && (
                <button
                  onClick={promptInstall}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-all border border-[#C7DAF3]"
                  title="Install Progressive Web App"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              )}

              {isAuthenticated ? (
                <>
                  <Link
                    href="/app"
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg bg-[#1E4E8C] text-white hover:bg-[#153763] transition-all shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#D4A017]" />
                    {authProfile?.role === 'owner' ? "Sarah's Dashboard" : 'Parent Portal'}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-[#14263F] hover:text-[#1E4E8C] px-3 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="#enquiry"
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg bg-[#D4A017] text-white hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    Enquire Now
                  </Link>
                </>
              )}
            </div>

            {/* Mobile / Tablet controls */}
            <div className="flex items-center gap-2 xl:hidden">
              {isAuthenticated ? (
                <Link
                  href="/app"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white"
                >
                  Portal
                </Link>
              ) : (
                <Link
                  href="#enquiry"
                  className="hidden sm:inline-flex text-xs font-bold px-3 py-1.5 rounded-lg bg-[#D4A017] text-white"
                >
                  Enquire
                </Link>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                className="p-2 rounded-md text-[#14263F] hover:text-[#1E4E8C] hover:bg-[#E8F0FA] transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="xl:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                href="#about"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]"
              >
                About Sarah
              </Link>
              <Link
                href="#services"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]"
              >
                What I Tutor
              </Link>
              <Link
                href="#why-me"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]"
              >
                Why Learn With Me
              </Link>
              <Link
                href="#learning-options"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]"
              >
                Flexible Learning Options
              </Link>
              <Link
                href="#moments"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]"
              >
                Moments Gallery
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]"
              >
                Testimonials
              </Link>
              <Link
                href="#enquiry"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-md text-base font-medium text-[#14263F] hover:bg-[#E8F0FA] hover:text-[#1E4E8C]"
              >
                Contact
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/app"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-[#1E4E8C] text-white font-semibold text-sm"
                  >
                    {authProfile?.role === 'owner' ? "Open Sarah's Dashboard" : 'Open Parent Portal'}
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-center py-2.5 rounded-lg border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg border border-[#1E4E8C] text-[#1E4E8C] font-semibold text-sm hover:bg-[#E8F0FA]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="#enquiry"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-[#D4A017] text-white font-semibold text-sm"
                  >
                    Enquire Now
                  </Link>
                </>
              )}
              {isInstallable && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    promptInstall();
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install App to Home Screen
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Dev-only unobtrusive indicator: completely absent in production / Vercel preview */}
      {isDev && (
        <aside
          aria-hidden="true"
          className="fixed bottom-2 right-2 z-50 pointer-events-none opacity-50 hover:opacity-100 transition-opacity bg-neutral-900/90 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700 shadow"
        >
          dev:localhost
        </aside>
      )}
    </>
  );
}
