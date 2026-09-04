'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('To install on iPhone/iPad: Tap the Share button at the bottom of Safari, then choose "Add to Home Screen". On Android: Tap the 3 dots menu and choose "Install App".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#1E4E8C] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#D4A017] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#D4A017] flex items-center justify-center text-[#14263F] shrink-0 shadow">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white leading-tight">
              Install Mrs Sarah Tutoring App
            </h4>
            <p className="text-xs text-blue-100/90 mt-0.5">
              Instant access on your phone home screen, works offline!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="px-3.5 py-1.5 rounded-lg bg-[#D4A017] text-[#14263F] font-bold text-xs hover:bg-[#A9790A] hover:text-white transition-all shrink-0 shadow-sm"
          >
            Install
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
