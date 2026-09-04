'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Compass, Sparkles, BookOpen, ShieldCheck, Smile } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Image Collage & Badges */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#E8F0FA]">
              <Image
                src="/images/flyer1.jpeg"
                alt="Mrs Sarah Early Years Teacher"
                width={500}
                height={550}
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#1E4E8C] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                Montessori Certified
              </div>
            </div>

            {/* Quote badge underneath */}
            <div className="bg-[#E8F0FA] p-4 rounded-xl border border-[#C7DAF3] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center text-white shrink-0 font-bold">
                ♥
              </div>
              <p className="text-xs sm:text-sm text-[#14263F] font-medium">
                Passionate about unlocking each child&apos;s natural curiosity and joy for reading and numbers.
              </p>
            </div>
          </div>

          {/* Right Column: Bio & Core Methodology */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                <span>About Your Tutor</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1E4E8C]">
                Dedicated to Giving Every Child the Very Best Start
              </h2>
              <p className="text-lg font-semibold text-[#14263F]">
                Montessori-Trained | SEN-Inclusive | British Curriculum Specialist
              </p>
            </div>

            <p className="text-base text-[#14263F]/80 leading-relaxed">
              Hello, I am Mrs Sarah, a devoted Early Years Educator with extensive experience in Montessori pedagogy and the British Early Years Foundation Stage (EYFS) curriculum. I specialise in nurturing children aged 3 to 8 during their most critical formative years.
            </p>

            <p className="text-base text-[#14263F]/80 leading-relaxed">
              Every child develops at their own unique pace. Whether your little one is an early reader ready for a challenge, an average learner solidifying fundamentals, or a slow learner who needs gentle patience and multi-sensory techniques, my lessons are tailored specifically to meet them right where they are.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-1.5">
                <div className="flex items-center gap-2 text-[#1E4E8C] font-bold text-sm">
                  <Compass className="w-4 h-4 text-[#D4A017]" />
                  <span>Montessori Child-Centered</span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Hands-on manipulatives, self-discovery, and concrete-to-abstract learning that deepens comprehension.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-1.5">
                <div className="flex items-center gap-2 text-[#1E4E8C] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#D4A017]" />
                  <span>SEN-Inclusive & Patient</span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Empathetic pacing, sensory accommodations, and step-by-step encouragement for every learning style.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-1.5">
                <div className="flex items-center gap-2 text-[#1E4E8C] font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-[#D4A017]" />
                  <span>British EYFS Standards</span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Systematic synthetic phonics, number sense mastery, and structured curriculum progression.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-1.5">
                <div className="flex items-center gap-2 text-[#1E4E8C] font-bold text-sm">
                  <Smile className="w-4 h-4 text-[#D4A017]" />
                  <span>Fun & Confidence-Building</span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Playful games, interactive stories, and positive reinforcement that turn learning into pure delight.
                </p>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="pt-2 flex items-center gap-4 flex-wrap">
              <Link
                href="#services"
                className="px-5 py-2.5 rounded-lg bg-[#1E4E8C] text-white font-semibold text-sm hover:bg-[#153763] transition-colors"
              >
                Explore What I Tutor
              </Link>
              <Link
                href="#enquiry"
                className="px-5 py-2.5 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] font-semibold text-sm hover:bg-[#d8e6f7] transition-colors border border-[#C7DAF3]"
              >
                Schedule Initial Consultation
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
