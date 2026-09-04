'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, Phone, Sparkles, Download, LayoutDashboard } from 'lucide-react';
import { createSPAClient } from '@/lib/supabase/client';
import { EYTService, UserProfile } from '@/lib/eyt-service';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authProfile, setAuthProfile] = useState<UserProfile | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDev, setIsDev] = useState(false);

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
        } else {
          setIsAuthenticated(false);
          setAuthProfile(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install on iOS: Tap Share then "Add to Home Screen". On Android: Tap browser menu then "Install App".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

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
      {/* Top Notification / Role Bar */}
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
              href="tel:09133651659"
              className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4A017]" />
              <span className="font-semibold">09133651659</span>
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-blue-100 hidden sm:inline">
                  Signed in as <strong className="text-amber-300 font-bold">{authProfile?.full_name}</strong>
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-amber-300 hover:text-white transition-colors font-bold text-xs underline underline-offset-2"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-blue-100 hover:text-white transition-colors font-semibold text-xs underline decoration-amber-400 underline-offset-2"
              >
                Sign In
              </Link>
            )}

            {isDev && (
              <span className="hidden lg:inline text-[10px] text-amber-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/20">
                Localhost Dev
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-[#1E4E8C] flex items-center justify-center text-white shadow-md group-hover:bg-[#153763] transition-colors relative overflow-hidden border border-[#D4A017]">
                <BookOpen className="w-6 h-6 text-[#D4A017]" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#D4A017] rounded-full flex items-center justify-center text-[9px] font-bold text-[#14263F]">
                  ★
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl sm:text-2xl font-bold text-[#1E4E8C] leading-tight">
                  Mrs Sarah
                </span>
                <span className="text-xs text-[#6B7280] font-medium tracking-wide">
                  Early Years Tutoring (Ages 3–8)
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="#about" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors">
                About Sarah
              </Link>
              <Link href="#services" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors">
                What I Tutor
              </Link>
              <Link href="#why-me" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors">
                Why Learn With Me
              </Link>
              <Link href="#learning-options" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors">
                Learning Options
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors">
                Testimonials
              </Link>
              <Link href="#enquiry" className="text-sm font-medium text-[#14263F] hover:text-[#1E4E8C] transition-colors">
                Contact
              </Link>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-all border border-[#C7DAF3]"
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
                    className="text-xs font-semibold text-[#14263F] hover:text-[#1E4E8C] px-2 py-1 transition-colors"
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

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              {isAuthenticated ? (
                <Link
                  href="/app"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white"
                >
                  Portal
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#1E4E8C] text-[#1E4E8C]"
                >
                  Sign In
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
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
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
                Public Enquiry
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
                    Sign In (Portal Login)
                  </Link>
                  <Link
                    href="#enquiry"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-[#D4A017] text-white font-semibold text-sm"
                  >
                    Book / Send Enquiry
                  </Link>
                </>
              )}
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
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
    </>
  );
}
