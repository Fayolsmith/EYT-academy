'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Zap, Sparkles, HeartHandshake, Smile, TrendingUp } from 'lucide-react';
import { STOCK_IMAGERY } from '@/lib/stock-imagery';

export default function WhyLearnSection() {
  const reasons = [
    {
      title: 'Montessori-based & Child-Centered Approach',
      description: 'Hands-on sensory materials and child-led inquiry allow young learners to grasp abstract literacy and math concepts naturally through play.',
      icon: Sparkles,
    },
    {
      title: "Lessons Tailored to Your Child's Pace and Needs",
      description: 'No one-size-fits-all curriculum. Each lesson plan adapts dynamically to your child’s cognitive milestones and daily emotional energy.',
      icon: HeartHandshake,
    },
    {
      title: 'Support for Fast, Average & Slow Learners',
      description: 'Every learner is celebrated! We challenge advanced pupils, solidify concepts for steady learners, and provide empathetic, patient scaffolding for those needing extra time.',
      icon: TrendingUp,
    },
    {
      title: 'Fun, Engaging & Interactive Sessions',
      description: 'Vibrant flashcards, interactive phonics games, storytelling, and rhythm exercises keep active 3–8 year olds thoroughly captivated and eager for more.',
      icon: Smile,
    },
    {
      title: 'Builds Confidence, Independence & a Love for Learning',
      description: 'Fostering practical life independence, intrinsic motivation, and resilience so your child feels proud of their accomplishments and truly loves discovering new things.',
      icon: Star,
    },
  ];

  return (
    <section id="why-me" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Callout */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 text-[#D4A017] fill-[#D4A017]" />
              Parent Advantage
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E4E8C] leading-tight">
              WHY LEARN <br />
              <span className="text-[#D4A017]">WITH ME?</span>
            </h2>

            <p className="text-base text-[#14263F]/80 leading-relaxed">
              Early childhood is a once-in-a-lifetime window of opportunity. Working with a dedicated Montessori-trained tutor gives your child personalized guidance that typical crowded classrooms cannot match.
            </p>

            <div className="p-5 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E4E8C]">
                <Zap className="w-4 h-4 text-[#D4A017]" />
                Direct 1-on-1 Attention
              </div>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                Noticeable improvement within 3–4 weeks in letter recognition, word blending, pencil grip, or number confidence.
              </p>
            </div>

            {/* Supporting Montessori Hands-On Imagery */}
            {/* Note: Stock photos — replace with real client photos once marketing consent is obtained */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="relative rounded-2xl overflow-hidden border border-[#C7DAF3]/80 shadow-xs group bg-[#FCFBF7]">
                <Image
                  src={STOCK_IMAGERY.whyLearnSensory.src}
                  alt={STOCK_IMAGERY.whyLearnSensory.alt}
                  width={STOCK_IMAGERY.whyLearnSensory.width}
                  height={STOCK_IMAGERY.whyLearnSensory.height}
                  className="w-full h-28 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14263F]/85 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Sensory Manipulatives
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[#F3E7C4] shadow-xs group bg-[#FCFBF7]">
                <Image
                  src={STOCK_IMAGERY.whyLearnNumeracy.src}
                  alt={STOCK_IMAGERY.whyLearnNumeracy.alt}
                  width={STOCK_IMAGERY.whyLearnNumeracy.width}
                  height={STOCK_IMAGERY.whyLearnNumeracy.height}
                  className="w-full h-28 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14263F]/85 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Child-Paced Growth
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="#enquiry"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-sm hover:bg-[#153763] transition-all shadow-md"
              >
                Book Your Child’s Free Chat
              </Link>
            </div>
          </div>

          {/* Right Column: 5 Flyer Reasons List */}
          <div className="lg:col-span-7 space-y-4">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-[#D4A017]/60 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E8F0FA] group-hover:bg-[#D4A017] flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5 text-[#1E4E8C] group-hover:text-white transition-colors" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-[#1E4E8C] group-hover:text-[#D4A017] transition-colors">
                      {reason.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#14263F]/80 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
