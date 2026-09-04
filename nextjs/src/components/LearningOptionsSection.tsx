'use client';

import React from 'react';
import Link from 'next/link';
import { Laptop, Home, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LearningOptionsSection() {
  return (
    <section id="learning-options" className="py-20 bg-[#F3F7FD]/50 border-t border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F0FA] border border-[#C7DAF3] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            Adaptable Delivery
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E4E8C]">
            FLEXIBLE LEARNING OPTIONS
          </h2>
          <p className="text-base sm:text-lg text-[#6B7280]">
            Choose the delivery mode that best fits your family’s routine and your child’s learning style.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card 1: Online Tutorial */}
          <div className="rounded-3xl p-8 bg-white border-2 border-[#C7DAF3] shadow-md hover:border-[#1E4E8C] transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#E8F0FA] text-[#1E4E8C] text-[11px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Convenient & Global
            </div>

            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] group-hover:scale-105 transition-transform">
                <Laptop className="w-8 h-8 text-[#1E4E8C]" />
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                  ONLINE TUTORIAL
                </h3>
                <p className="text-sm font-semibold text-[#D4A017] mt-1">
                  Live interactive sessions from the comfort of your home.
                </p>
              </div>

              <p className="text-sm text-[#14263F]/80 leading-relaxed">
                Utilizing high-definition interactive screens, digital letter cards, virtual whiteboards, and engaging storytelling to give your child an energizing one-on-one session without travel stress.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Live Google Meet / Zoom link direct in Parent Portal',
                  'Flexible scheduling across weekday afternoons & weekends',
                  'Digital session notes and printable practice worksheets',
                  'Safe, supervised remote learning environment',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#14263F]">
                    <CheckCircle className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="#enquiry"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-sm hover:bg-[#153763] transition-all shadow"
              >
                <span>Enquire for Online Tutorial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Home Tutorial */}
          <div className="rounded-3xl p-8 bg-white border-2 border-[#F3E7C4] shadow-md hover:border-[#D4A017] transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#FDF7E7] text-[#D4A017] text-[11px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Tactile & In-Person
            </div>

            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#FDF7E7] flex items-center justify-center text-[#D4A017] group-hover:scale-105 transition-transform">
                <Home className="w-8 h-8 text-[#D4A017]" />
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                  HOME TUTORIAL
                </h3>
                <p className="text-sm font-semibold text-[#D4A017] mt-1">
                  In-person lessons in a safe and conducive environment.
                </p>
              </div>

              <p className="text-sm text-[#14263F]/80 leading-relaxed">
                Mrs Sarah visits your residence with sensory Montessori didactic materials, sandpaper letters, number rods, and practical life tools for tangible hands-on mastery.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  'Physical Montessori apparatus brought directly to your home',
                  'Intensive focus on fine motor pencil grip and physical posture',
                  'Immediate parent briefing and tactile progress demonstrations',
                  'Custom pace tailored to the child’s home environment',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#14263F]">
                    <CheckCircle className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="#enquiry"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow shadow-amber-200"
              >
                <span>Enquire for Home Tutorial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

        {/* Age group ribbon */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <p className="font-heading font-bold text-[#1E4E8C] text-base">
                Serving Children Ages 3 to 8
              </p>
              <p className="text-xs text-[#6B7280]">
                Early Years Foundation Stage • British Curriculum & Montessori Integration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['Nursery', 'Preschool', 'Primary 1', 'Primary 2'].map((grade) => (
              <span
                key={grade}
                className="px-3 py-1 rounded-full bg-[#E8F0FA] text-[#1E4E8C] font-semibold text-xs border border-[#C7DAF3]"
              >
                {grade}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
