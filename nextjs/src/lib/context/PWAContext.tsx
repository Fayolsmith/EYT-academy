'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<boolean>;
  showGuideModal: boolean;
  setShowGuideModal: (show: boolean) => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

// Module-level variable to capture the event if it fires before React hydration
let earlyDeferredPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    earlyDeferredPrompt = e as BeforeInstallPromptEvent;
    try {
      localStorage.setItem('eyt_pwa_eligible', 'true');
    } catch {
      // ignore
    }
  });
}

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(earlyDeferredPrompt);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      try {
        localStorage.setItem('eyt_pwa_installed', 'true');
      } catch {
        // ignore
      }
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // If early event was captured
    if (earlyDeferredPrompt) {
      setDeferredPrompt(earlyDeferredPrompt);
      setIsInstallable(true);
    } else {
      // Check if browser was previously marked eligible
      try {
        const wasEligible = localStorage.getItem('eyt_pwa_eligible') === 'true';
        const alreadyInstalled = localStorage.getItem('eyt_pwa_installed') === 'true';
        if (wasEligible && !alreadyInstalled) {
          setIsInstallable(true);
        }
      } catch {
        // ignore
      }
    }

    // Single window listener for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      earlyDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
      try {
        localStorage.setItem('eyt_pwa_eligible', 'true');
      } catch {
        // ignore
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      earlyDeferredPrompt = null;
      try {
        localStorage.removeItem('eyt_pwa_eligible');
        localStorage.setItem('eyt_pwa_installed', 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const activePrompt = deferredPrompt || earlyDeferredPrompt;
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          earlyDeferredPrompt = null;
          return true;
        }
        return false;
      } catch (err) {
        console.warn('Error launching install prompt:', err);
      }
    }

    // Fallback: show instructions modal for iOS or browsers without native prompt
    setShowGuideModal(true);
    return false;
  }, [deferredPrompt]);

  return (
    <PWAContext.Provider
      value={{
        isInstallable: isInstallable && !isInstalled,
        isInstalled,
        isIOS,
        promptInstall,
        showGuideModal,
        setShowGuideModal,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      isInstallable: false,
      isInstalled: false,
      isIOS: false,
      promptInstall: async () => false,
      showGuideModal: false,
      setShowGuideModal: () => {},
    };
  }
  return context;
};
