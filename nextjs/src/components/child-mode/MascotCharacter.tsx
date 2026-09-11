'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, ArrowRight, BookOpen, Star } from 'lucide-react';
import { MascotDialogueOption } from '@/lib/adaptive-tutor';

interface MascotCharacterProps {
  childName?: string;
  greeting: string;
  message: string;
  reason?: string;
  options: MascotDialogueOption[];
  onSelectOption: (option: MascotDialogueOption) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPlaySound?: () => void;
}

export default function MascotCharacter({
  greeting,
  message,
  reason,
  options,
  onSelectOption,
  soundEnabled,
  onToggleSound,
  onPlaySound,
}: MascotCharacterProps) {
  const [isWaving, setIsWaving] = useState(false);

  const handleMascotTap = () => {
    setIsWaving(true);
    if (soundEnabled && onPlaySound) {
      onPlaySound();
    }
    setTimeout(() => setIsWaving(false), 1200);
  };

  return (
    <div className="relative bg-gradient-to-br from-[#FCFBF7] via-[#FFFDF9] to-[#E8F0FA] rounded-3xl p-6 sm:p-8 border-3 border-[#D4A017]/35 shadow-md flex flex-col md:flex-row items-center gap-6 sm:gap-8 overflow-hidden">
      {/* Background soft celestial decorations */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-200/25 rounded-full blur-2xl pointer-events-none" />

      {/* Sound toggle floating button */}
      <button
        type="button"
        onClick={onToggleSound}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 border border-gray-200 text-[#14263F] hover:bg-[#E8F0FA] transition-all shadow-xs cursor-pointer z-10"
        title={soundEnabled ? 'Mute helper sound' : 'Enable helper sound'}
        aria-label={soundEnabled ? 'Mute helper sound' : 'Enable helper sound'}
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4 text-[#1E4E8C]" />
        ) : (
          <VolumeX className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Mascot Animated Illustration */}
      <div className="relative shrink-0 flex flex-col items-center">
        <motion.div
          animate={isWaving ? { rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.05, 1] } : { y: [0, -6, 0] }}
          transition={isWaving ? { duration: 0.8 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          onClick={handleMascotTap}
          className="cursor-pointer select-none group"
          title="Tap Pip to wave!"
        >
          {/* Friendly Mascot SVG: "Pip" the Montessori Star Cub */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 relative flex items-center justify-center">
            <svg
              viewBox="0 0 140 140"
              className="w-full h-full drop-shadow-lg"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ears */}
              <circle cx="42" cy="40" r="18" fill="#1E4E8C" />
              <circle cx="42" cy="40" r="10" fill="#D4A017" />
              <circle cx="98" cy="40" r="18" fill="#1E4E8C" />
              <circle cx="98" cy="40" r="10" fill="#D4A017" />

              {/* Head */}
              <circle cx="70" cy="72" r="48" fill="#1E4E8C" />

              {/* Face Cream Mask */}
              <ellipse cx="70" cy="80" rx="36" ry="30" fill="#FCFBF7" />

              {/* Eyes */}
              <circle cx="54" cy="74" r="6" fill="#14263F" />
              <circle cx="56" cy="72" r="2" fill="white" />
              <circle cx="86" cy="74" r="6" fill="#14263F" />
              <circle cx="88" cy="72" r="2" fill="white" />

              {/* Rosy Cheeks */}
              <circle cx="45" cy="84" r="5" fill="#FCA5A5" opacity="0.75" />
              <circle cx="95" cy="84" r="5" fill="#FCA5A5" opacity="0.75" />

              {/* Nose */}
              <polygon points="70,81 65,86 75,86" fill="#D4A017" />

              {/* Smile */}
              <path
                d="M62 90 Q70 98 78 90"
                stroke="#14263F"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Golden Star Headband / Wand Star */}
              <polygon
                points="70,28 73,36 81,37 75,42 77,50 70,45 63,50 65,42 59,37 67,36"
                fill="#D4A017"
                stroke="#B4820A"
                strokeWidth="1"
              />
            </svg>

            {/* Sparkle badge */}
            <div className="absolute bottom-1 right-2 bg-amber-400 text-white p-1.5 rounded-full border-2 border-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </motion.div>

        <span className="text-[11px] font-extrabold text-[#1E4E8C] tracking-wide mt-1 bg-white/80 px-3 py-0.5 rounded-full border border-blue-100 shadow-2xs">
          Pip the Helper
        </span>
      </div>

      {/* Speech Bubble & Interactive Choices */}
      <div className="flex-1 space-y-4 text-center md:text-left">
        {/* Dialogue Bubble */}
        <div className="relative bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#D4A017]/40 shadow-xs space-y-2">
          {/* Arrow pointing to mascot */}
          <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#D4A017]/40" />
          <div className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-white" />

          <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#1E4E8C]">
            {greeting}
          </h3>

          <p className="text-xs sm:text-sm text-[#14263F] leading-relaxed font-medium">
            {message}
          </p>

          {reason && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-center md:justify-start gap-1.5 text-[11px] text-[#6B7280]">
              <Star className="w-3 h-3 text-[#D4A017] shrink-0" />
              <span>{reason}</span>
            </div>
          )}
        </div>

        {/* Bounded Action Choices (Large touch-friendly buttons for kids) */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
          {options.map((opt, idx) => {
            const isPrimary = idx === 0;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectOption(opt)}
                className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-2 ${
                  isPrimary
                    ? 'bg-[#D4A017] text-white hover:bg-[#B4820A] shadow-amber-200/50 ring-2 ring-amber-300'
                    : opt.action === 'view_homework'
                    ? 'bg-[#1E4E8C] text-white hover:bg-[#153763]'
                    : 'bg-white border-2 border-[#1E4E8C] text-[#1E4E8C] hover:bg-[#E8F0FA]'
                }`}
              >
                {opt.action === 'view_homework' && <BookOpen className="w-4 h-4 text-[#D4A017]" />}
                <span>{opt.label}</span>
                {isPrimary && <ArrowRight className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
