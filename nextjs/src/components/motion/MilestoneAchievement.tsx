'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface MilestoneAchievementBadgeProps {
  label?: string;
  isRecent?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MilestoneAchievementBadge({
  label = 'Achieved',
  isRecent = false,
  className = '',
  size = 'md',
}: MilestoneAchievementBadgeProps) {
  const shouldReduceMotion = useReducedMotion();

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[10px] gap-1'
      : size === 'lg'
      ? 'px-4 py-1.5 text-xs gap-2'
      : 'px-3 py-1 text-[11px] gap-1.5';

  if (shouldReduceMotion || !isRecent) {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses} ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0.92, opacity: 0.8 }}
      animate={{
        scale: [0.92, 1.08, 1],
        opacity: 1,
        boxShadow: [
          '0 0 0px rgba(212, 160, 23, 0)',
          '0 0 18px rgba(212, 160, 23, 0.45)',
          '0 0 4px rgba(16, 185, 129, 0.25)',
        ],
      }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`relative inline-flex items-center font-bold rounded-full uppercase tracking-wider bg-gradient-to-r from-emerald-50 via-amber-50/50 to-emerald-50 text-emerald-900 border border-amber-300 shadow-sm ${sizeClasses} ${className}`}
    >
      <motion.div
        animate={{ rotate: [0, 15, -10, 0] }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Award className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
      </motion.div>
      <span>{label}</span>
      <Sparkles className="w-3 h-3 text-[#D4A017] shrink-0 animate-pulse" />
    </motion.span>
  );
}
