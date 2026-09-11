'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Trophy,
  BookOpen,
  Lock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Star,
  Calendar,
  Calculator,
  Smile,
  Globe,
  Palette,
} from 'lucide-react';
import { detectUserTimezone, getTimezoneAbbr } from '@/lib/i18n-service';

export const COMPLETED_PILLAR_BADGES = [
  { id: 'numeracy', shortLabel: 'Numeracy', icon: Calculator },
  { id: 'phonics', shortLabel: 'Phonics & Literacy', icon: BookOpen },
  { id: 'practical_life', shortLabel: 'Practical Life', icon: Smile },
  { id: 'cultural', shortLabel: 'Cultural & Nature', icon: Globe },
  { id: 'arts', shortLabel: 'Creative Arts', icon: Palette },
];

export interface DailyCompletionEndScreenProps {
  childName: string;
  onViewTrophies: () => void;
  onViewHomework: () => void;
  onOpenGate: () => void;
  onResetToday?: () => void;
  onPlayAlphabetArt?: () => void;
}

export default function DailyCompletionEndScreen({
  childName = 'Superstar',
  onViewTrophies,
  onViewHomework,
  onOpenGate,
  onResetToday,
  onPlayAlphabetArt,
}: DailyCompletionEndScreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const userTz = detectUserTimezone();
  const tzAbbr = getTimezoneAbbr(userTz);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      {/* 1. Main Celebratory Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
        className="bg-white rounded-3xl border-3 border-[#D4A017] shadow-xl overflow-hidden text-center p-6 sm:p-10 relative"
      >
        {/* Subtle Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-b from-amber-100/60 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Trophy & Sparkles Icon */}
          <div className="relative inline-block">
            <motion.div
              animate={shouldReduceMotion ? {} : { scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#1E4E8C] to-[#0F2A4D] border-4 border-[#D4A017] text-[#D4A017] flex items-center justify-center mx-auto shadow-lg"
            >
              <Trophy className="w-12 h-12 sm:w-14 sm:h-14" />
            </motion.div>
            <div className="absolute -top-2 -right-2 bg-[#D4A017] text-white p-2 rounded-full shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Headline & Personal Praise */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-[#D4A017] border border-amber-200 px-3.5 py-1 rounded-full text-xs font-heading font-extrabold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-[#D4A017]" />
              <span>Session Finished &bull; All 5 Pillars Mastered</span>
              <Star className="w-3.5 h-3.5 fill-[#D4A017]" />
            </div>

            <h2 className="font-heading font-black text-2xl sm:text-4xl text-[#1E4E8C] tracking-tight">
              You completed everything today — great job!
            </h2>

            <p className="text-sm sm:text-base text-[#4B5563] max-w-xl mx-auto leading-relaxed">
              Mrs Sarah is so proud of your dedication, <strong className="text-[#1E4E8C]">{childName}</strong>!
              You explored, counted, matched, and sequenced through all five Montessori learning areas.
            </p>
          </div>

          {/* 5 Completed Pillars Showcase Grid */}
          <div className="pt-2">
            <h3 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#6B7280] mb-3">
              Today&apos;s Completed Achievements
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {COMPLETED_PILLAR_BADGES.map((p, idx) => {
                const IconComp = p.icon;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: shouldReduceMotion ? 0 : idx * 0.1 }}
                    className="p-3.5 rounded-2xl bg-[#FCFBF7] border-2 border-emerald-300 shadow-2xs flex flex-col items-center justify-between text-center space-y-2 hover:border-[#1E4E8C] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-[#1E4E8C] flex items-center justify-center shadow-2xs">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="font-heading font-extrabold text-xs text-[#1E4E8C] line-clamp-1">
                      {p.shortLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Timezone-aware Daily Reset Notice */}
          <div className="inline-flex items-center gap-2 bg-[#E8F0FA]/70 text-[#1E4E8C] px-4 py-2 rounded-2xl border border-blue-200/60 text-xs font-medium">
            <Calendar className="w-4 h-4 text-[#D4A017]" />
            <span>
              Your daily activities refresh tomorrow at midnight local time (<strong>{tzAbbr}</strong>).
            </span>
          </div>

          {/* Optional Bonus Activity Invitation: Alphabet Art */}
          {onPlayAlphabetArt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.3 }}
              className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-rose-50 to-indigo-50 border-2 border-[#D4A017]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#D4A017] shadow-xs flex items-center justify-center text-[#D4A017] shrink-0">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-heading font-extrabold uppercase tracking-wider text-amber-700 bg-white/80 px-2 py-0.5 rounded-full border border-amber-200">
                    <Sparkles className="w-3 h-3 text-[#D4A017]" />
                    <span>Optional Bonus Activity</span>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#1E4E8C]">
                    Want to try one more? Bonus: Alphabet Art!
                  </h4>
                  <p className="text-xs text-[#4B5563]">
                    Match alphabet letters into sunny pictures and trace colorful letter art!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onPlayAlphabetArt}
                className="w-full sm:w-auto shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4A017] to-amber-600 text-white font-heading font-extrabold text-xs sm:text-sm hover:brightness-105 active:scale-98 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Play Alphabet Art</span>
                <Sparkles className="w-4 h-4 text-amber-100" />
              </button>
            </motion.div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onViewTrophies}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#D4A017] text-white font-heading font-extrabold text-sm hover:bg-[#B4820A] active:scale-98 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Explore My Star Trophies</span>
            </button>

            <button
              type="button"
              onClick={onViewHomework}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1E4E8C] text-white font-heading font-extrabold text-sm hover:bg-[#153763] active:scale-98 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#D4A017]" />
              <span>Check My Homework</span>
            </button>

            <button
              type="button"
              onClick={onOpenGate}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white border-2 border-gray-300 text-[#4B5563] font-heading font-bold text-xs hover:border-[#1E4E8C] hover:text-[#1E4E8C] active:scale-98 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Parents Only (Exit)</span>
            </button>
          </div>

          {/* Demo/Testing Reset Helper (Safe, labeled for Parents) */}
          {onResetToday && (
            <div className="pt-4 border-t border-gray-200/60 flex justify-center">
              <button
                type="button"
                onClick={onResetToday}
                className="text-[11px] text-[#6B7280] hover:text-[#1E4E8C] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset daily progress for local testing/demo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Today&apos;s Child Mode Progress (Parent Demo Test)</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
