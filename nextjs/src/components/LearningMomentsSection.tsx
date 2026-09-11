'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { getGalleryMoments } from '@/lib/stock-imagery';

/**
 * Learning Moments Gallery Section
 *
 * PURPOSE:
 * Build emotional warmth and give prospective parents a felt sense of "what this looks like"
 * across Montessori-style early years tutoring moments (hands-on materials, focused activities,
 * warm guidance, home learning nooks, and virtual setups).
 *
 * CONSENT & REPLACEMENT REGISTRY:
 * In strict compliance with privacy/NDPA guidelines, all images here are licensed stock photography.
 * When marketing-use consent is obtained from real EYT Academy families, swap entries in
 * `@/lib/stock-imagery.ts` with real client photography.
 */
export default function LearningMomentsSection() {
  const moments = getGalleryMoments();

  return (
    <section id="moments" className="py-20 sm:py-28 bg-[#FCFBF7] relative overflow-hidden border-t border-b border-[#E5E0D8]/60">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#E8F0FA]/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0FA] border border-[#C7DAF3] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-[#D4A017]" />
            <span>Everyday Montessori Moments</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E4E8C] tracking-tight">
            GLIMPSES INTO OUR LEARNING JOURNEY
          </h2>

          <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            A window into the joy of discovery — tactile materials, deep concentration, and proud milestone breakthroughs, whether at your dining table or across our interactive screen.
          </p>
        </div>

        {/* 6-Card Visual Moments Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {moments.map((moment) => (
            /* Stock photo — replace with real client photo once marketing consent is obtained */
            <div
              key={moment.id}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#E5E0D8] shadow-xs hover:shadow-xl hover:border-[#D4A017]/60 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo Container */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
                <Image
                  src={moment.src}
                  alt={moment.alt}
                  width={moment.width}
                  height={moment.height}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Category Pill Tag */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-xs text-[#1E4E8C] text-[11px] font-bold px-3 py-1 rounded-full shadow-xs border border-gray-100 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#D4A017]" />
                  <span>{moment.category}</span>
                </div>
              </div>

              {/* Card Caption Footer */}
              <div className="p-5 sm:p-6 space-y-2 bg-white flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-heading text-lg font-bold text-[#1E4E8C] group-hover:text-[#D4A017] transition-colors">
                    {moment.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#14263F]/80 leading-relaxed">
                    {moment.caption}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    Montessori Practice
                  </span>
                  <span className="italic text-gray-400 text-[10px]">
                    Curiosity in action
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Warm Reassurance Strip */}
        <div className="mt-12 sm:mt-16 text-center max-w-2xl mx-auto p-6 rounded-3xl bg-white border border-[#C7DAF3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-0.5">
            <h4 className="font-heading font-bold text-sm text-[#1E4E8C]">
              Ready to begin your child’s learning adventure?
            </h4>
            <p className="text-xs text-[#6B7280]">
              Every child’s unique rhythm is respected and nurtured with patience.
            </p>
          </div>

          <Link
            href="#enquiry"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-all shadow-xs"
          >
            <span>Book a Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
