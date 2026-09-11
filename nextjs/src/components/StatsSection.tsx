'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { Award, Users, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { EYTService, PublicStatsSettings, DEFAULT_PUBLIC_STATS } from '@/lib/eyt-service';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, suffix = '', duration = 1.6 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Smooth cubic ease-out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {shouldReduceMotion ? value : displayValue}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState<PublicStatsSettings>(DEFAULT_PUBLIC_STATS);

  useEffect(() => {
    setStats(EYTService.getPublicStats());
  }, []);

  return (
    <section className="relative py-12 sm:py-16 bg-[#FCFBF7] border-y border-[#F3E7C4]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header / Identifier */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0FA] border border-[#C7DAF3] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Experienced Early Childhood Educator</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            A Proven Foundation in Early Learning
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Every number reflects real milestones, trusted parent partnerships, and dedicated one-on-one tutorial care.
          </p>
        </div>

        {/* 3 Truthful Stat Counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Stat 1: Years of Experience */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 pointer-events-none opacity-60" />
            <div className="relative z-10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FCFBF7] border border-[#F3E7C4] flex items-center justify-center text-[#D4A017] shadow-2xs">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1E4E8C] tracking-tight">
                  <AnimatedCounter value={stats.years_of_experience} suffix="+" />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#14263F] mt-1">
                  Years of Teaching Experience
                </h3>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Specialized in early childhood development, British curriculum fundamentals, and Montessori child-led methods.
              </p>
            </div>
            <div className="relative z-10 pt-4 mt-4 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#1E4E8C]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Montessori Trained & SEN-Inclusive</span>
            </div>
          </div>

          {/* Stat 2: Families Served */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 pointer-events-none opacity-60" />
            <div className="relative z-10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FA] border border-[#C7DAF3] flex items-center justify-center text-[#1E4E8C] shadow-2xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1E4E8C] tracking-tight">
                  <AnimatedCounter value={stats.families_served} suffix="+" />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#14263F] mt-1">
                  Families Nurtured & Supported
                </h3>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Guiding young learners across Nigeria and international diaspora households with consistent 1:1 attention.
              </p>
            </div>
            <div className="relative z-10 pt-4 mt-4 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#1E4E8C]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Local & International Flexible Scheduling</span>
            </div>
          </div>

          {/* Stat 3: 5 Core Learning Areas */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none opacity-60" />
            <div className="relative z-10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-4xl sm:text-5xl text-[#1E4E8C] tracking-tight">
                  <AnimatedCounter value={5} suffix="" />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#14263F] mt-1">
                  Core Early Learning Areas
                </h3>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Phonics & Reading, Early Mathematics, Expressive Arts, Practical Life Skills, and Emotional & Social Growth.
              </p>
            </div>
            <div className="relative z-10 pt-4 mt-4 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-[#1E4E8C]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
              <span>Full EYFS & Montessori Alignment</span>
            </div>
          </div>
        </div>

        {/* Distinction Footnote */}
        <p className="text-center text-[11px] text-[#6B7280] mt-8 max-w-xl mx-auto">
          Career statistics are updated directly by Mrs Sarah. Independent parent reviews and star ratings are gathered separately through verified client submissions.
        </p>
      </div>
    </section>
  );
}
