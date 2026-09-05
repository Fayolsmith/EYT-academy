'use client';

import React from 'react';
import { X, Smartphone, Share, PlusSquare, Check } from 'lucide-react';
import { usePWA } from '@/lib/context/PWAContext';

export default function PWAInstallPrompt() {
  const { showGuideModal, setShowGuideModal, isIOS } = usePWA();

  if (!showGuideModal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative text-[#14263F]">
        {/* Close Button */}
        <button
          onClick={() => setShowGuideModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-[#1E4E8C] flex items-center justify-center text-white border border-[#D4A017] shadow-md">
            <Smartphone className="w-6 h-6 text-[#D4A017]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-[#1E4E8C]">
              Install Mrs Sarah App
            </h3>
            <p className="text-xs text-gray-500">
              Add to your device for instant offline access
            </p>
          </div>
        </div>

        <div className="py-5 space-y-4 text-xs">
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-gray-600 font-medium">
                To install this PWA on your iPhone or iPad:
              </p>
              <ol className="space-y-2.5 text-gray-700">
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] font-bold shrink-0">
                    1
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span>Tap the</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#1E4E8C] bg-gray-100 px-1.5 py-0.5 rounded">
                      <Share className="w-3.5 h-3.5" /> Share
                    </span>
                    <span>button in Safari bar.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] font-bold shrink-0">
                    2
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span>Scroll down and tap</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#1E4E8C] bg-gray-100 px-1.5 py-0.5 rounded">
                      <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] font-bold shrink-0">
                    3
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span>Tap</span>
                    <span className="font-bold text-[#1E4E8C]">Add</span>
                    <span>in the top right corner. Done!</span>
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600 font-medium">
                To install this app on your browser or Android device:
              </p>
              <ul className="space-y-2.5 text-gray-700">
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] font-bold shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#D4A017]" />
                  </div>
                  <span className="pt-0.5">
                    Look for the <strong>Install</strong> icon in the address bar (Chrome, Edge, or Brave).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] font-bold shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#D4A017]" />
                  </div>
                  <span className="pt-0.5">
                    Or open your browser menu (<strong>⋮</strong>) and tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={() => setShowGuideModal(false)}
            className="px-5 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
