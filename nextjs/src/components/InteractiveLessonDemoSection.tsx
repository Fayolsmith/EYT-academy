'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { LearningPillar } from '@/lib/adaptive-tutor';
import MontessoriPillarActivities, {
  MONTESSORI_PILLARS,
  PHONICS_ITEMS,
  PRACTICAL_STEPS,
  CULTURAL_ITEMS,
  ARTS_SWATCHES,
} from './MontessoriPillarActivities';

// Re-export pillar data structures for component consumers & verification tests
export { MONTESSORI_PILLARS, PHONICS_ITEMS, PRACTICAL_STEPS, CULTURAL_ITEMS, ARTS_SWATCHES };
export const PILLAR_KEYS: LearningPillar[] = ['numeracy', 'phonics', 'practical_life', 'cultural', 'arts'];
export const PILLAR_LABELS = [
  'Numeracy & Mathematics',
  'Phonics & Early Literacy',
  'Practical Life Skills',
  'Cultural & General Knowledge',
  'Creative & Expressive Arts',
];

export default function InteractiveLessonDemoSection() {
  const [activePillar, setActivePillar] = useState<LearningPillar>('numeracy');

  return (
    <section id="lesson-preview" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-[#E8F0FA]/50 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FCFBF7] rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0FA] border border-[#C7DAF3] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>5 Core Montessori Learning Pillars</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E4E8C] tracking-tight">
            Try a Real Lesson Activity
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            In Montessori education, learning is hands-on, sequential, and sensory-rich.
            Explore how Mrs Sarah structures lessons across our 5 foundational curriculum areas:
            Numeracy &amp; Mathematics, Phonics &amp; Early Literacy, Practical Life Skills,
            Cultural &amp; General Knowledge, and Creative &amp; Expressive Arts.
          </p>
        </div>

        {/* Reusable Montessori Activities Component */}
        <MontessoriPillarActivities
          activePillar={activePillar}
          onPillarChange={setActivePillar}
          isChildMode={false}
        />

        {/* Unified Celebratory Bottom Action Strip */}
        <div className="bg-[#FCFBF7] border border-[#E5E0D8] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="text-xs text-[#6B7280] space-y-0.5 text-center sm:text-left">
            <div className="font-bold text-[#14263F] flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>Ready to experience this in a real diagnostic session?</span>
            </div>
            <p>Mrs Sarah assesses your learner&apos;s baseline across all 5 Montessori pillars.</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/2349133651659"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#1E4E8C] text-[#1E4E8C] text-xs font-bold hover:bg-[#E8F0FA] transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Mrs Sarah</span>
            </a>

            <Link
              href="#enquiry"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white text-xs font-bold hover:bg-[#A9790A] transition-all shadow-sm"
            >
              <span>Book a Diagnostic Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
