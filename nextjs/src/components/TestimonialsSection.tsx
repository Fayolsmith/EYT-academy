'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Quote, Heart, CheckCircle2, MessageSquareHeart, Sparkles } from 'lucide-react';
import { EYTService, Testimonial } from '@/lib/eyt-service';

interface UnifiedTestimonial {
  id: string;
  name: string;
  subtitle: string;
  text: string;
  highlight?: string;
  rating: number;
  isVerified?: boolean;
}

const FLYER_TESTIMONIALS: UnifiedTestimonial[] = [
  {
    id: 'flyer-1',
    name: 'Mrs Elizabeth Adeleke',
    subtitle: 'Parent of Leo (Age 5, Nursery 2)',
    text: 'Mrs Sarah transformed Leo’s confidence with reading. Within just 6 weeks of her phonics sessions, he went from guessing words to effortlessly blending 3-letter words. Her patience and Montessori sensory cards made all the difference!',
    highlight: 'Blended 3-letter words in 6 weeks',
    rating: 5,
    isVerified: true,
  },
  {
    id: 'flyer-2',
    name: 'Dr Kemi Ogunleye',
    subtitle: 'Parent of Tobi (Age 4, Preschool)',
    text: 'Finding a tutor who understands SEN-inclusive methods was a blessing for our family. Mrs Sarah never rushes him; she adapts each lesson to his focus levels. Tobi actually looks forward to tutorial days now!',
    highlight: 'SEN-inclusive & incredibly patient',
    rating: 5,
    isVerified: true,
  },
  {
    id: 'flyer-3',
    name: 'Mr Chukwuma Eze',
    subtitle: 'Parent of Chisom (Age 6, Primary 1)',
    text: 'The online sessions are so engaging and interactive. We receive clear session notes after every single tutorial, and the milestone tracker on the portal keeps us informed on every skill she achieves.',
    highlight: 'Interactive online tutorials & clear progress notes',
    rating: 5,
    isVerified: true,
  },
  {
    id: 'flyer-4',
    name: 'Mrs Funke Balogun',
    subtitle: 'Parent of Daniel (Age 4, Nursery 1)',
    text: 'Daniel was struggling with pencil grip and number recognition. Mrs Sarah’s Montessori sandpaper cards and golden beads clicked immediately with him. He is now counting confidently to 20!',
    highlight: 'Mastered number recognition & pencil grip',
    rating: 5,
    isVerified: true,
  },
];

export default function TestimonialsSection() {
  const [publishedTestimonials, setPublishedTestimonials] = useState<Testimonial[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ average: number | null; count: number }>({
    average: 5.0,
    count: 4,
  });

  useEffect(() => {
    try {
      const live = EYTService.getPublishedTestimonials();
      setPublishedTestimonials(live);
      setRatingSummary(EYTService.getPublicRatingSummary());
    } catch (e) {
      console.warn('Failed to load published testimonials', e);
    }
  }, []);

  // Filter out duplicates and unify format
  const dynamicTestimonials: UnifiedTestimonial[] = publishedTestimonials
    .filter(
      (pt) =>
        !FLYER_TESTIMONIALS.some(
          (ft) => ft.text.toLowerCase().slice(0, 30) === pt.body_text.toLowerCase().slice(0, 30)
        )
    )
    .map((pt) => ({
      id: pt.id,
      name: pt.formatted_display_name || 'EYT Family',
      subtitle: pt.formatted_subtitle || 'Verified EYT Family',
      text: pt.body_text,
      rating: pt.rating || 5,
      isVerified: true,
    }));

  const allItems: UnifiedTestimonial[] = [...FLYER_TESTIMONIALS, ...dynamicTestimonials];

  // Repeat items to ensure a seamless looping marquee
  const marqueeItems = [...allItems, ...allItems];

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E8F0FA]/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FCFBF7] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0FA] border border-[#C7DAF3] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Family Experiences & Reviews</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E4E8C] tracking-tight">
            WHAT PARENTS SAY
          </h2>

          <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Real feedback from families whose children have built foundational reading fluency, numeracy confidence, and joyful independence under Mrs Sarah’s guidance.
          </p>

          {/* Rating Summary & Pause Hint */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#14263F] border border-amber-200 font-bold">
              <Star className="w-3.5 h-3.5 text-[#D4A017] fill-[#D4A017]" />
              <span>{ratingSummary.average ? ratingSummary.average.toFixed(1) : '5.0'}</span>
              <span className="text-[#6B7280] font-normal">
                ({ratingSummary.count || allItems.length} parent reviews)
              </span>
            </div>

            <span className="text-[#6B7280] hidden sm:inline">•</span>

            <span className="text-[11px] text-[#6B7280] italic">
              Hover or touch any card to pause marquee
            </span>
          </div>
        </div>
      </div>

      {/* Full-width continuous horizontal auto-scrolling marquee */}
      <div className="relative w-full overflow-hidden py-4 isolate [contain:paint]">
        {/* Left & right edge gradient fades strictly scoped to marquee track */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 h-full max-h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 select-none overflow-hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 h-full max-h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 select-none overflow-hidden"
        />

        {/* Marquee Track */}
        <div className="eyt-marquee-track flex gap-6 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {marqueeItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[320px] sm:w-[380px] shrink-0 bg-[#FCFBF7]/80 rounded-3xl p-6 sm:p-7 border border-[#E5E0D8] shadow-xs hover:shadow-md hover:border-[#D4A017] hover:bg-white transition-all flex flex-col justify-between space-y-4 select-none"
            >
              <div className="space-y-3">
                {/* Star rating & verified tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#D4A017] fill-[#D4A017]" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Verified Parent
                  </span>
                </div>

                {/* Highlight badge if available */}
                {item.highlight && (
                  <div className="inline-block bg-[#E8F0FA] text-[#1E4E8C] text-[11px] font-bold px-2.5 py-1 rounded-lg">
                    “{item.highlight}”
                  </div>
                )}

                {/* Review body */}
                <p className="text-xs sm:text-sm text-[#14263F]/90 leading-relaxed italic">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-[#E5E0D8]/80 flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#1E4E8C]">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] font-medium">
                    {item.subtitle}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-[#D4A017]/30 flex items-center justify-center text-[#D4A017] shrink-0">
                  <Quote className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-center relative z-20">
        <div className="inline-flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app/testimonials"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-[#1E4E8C] text-[#1E4E8C] text-xs font-bold hover:bg-[#E8F0FA] transition-all shadow-xs opacity-100"
          >
            <MessageSquareHeart className="w-4 h-4 text-[#D4A017]" />
            <span>Share Your Family’s Experience</span>
          </Link>
          <Link
            href="#enquiry"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A017] text-white text-xs font-bold hover:bg-[#A9790A] transition-all shadow-xs opacity-100"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book a Consultation Session</span>
          </Link>
        </div>
      </div>

      {/* Scoped Marquee CSS Animation */}
      <style jsx>{`
        @keyframes eytMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .eyt-marquee-track {
          display: flex;
          width: max-content;
          animation: eytMarquee 38s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .eyt-marquee-track {
            animation: none;
            overflow-x: auto;
          }
        }
      `}</style>
    </section>
  );
}
