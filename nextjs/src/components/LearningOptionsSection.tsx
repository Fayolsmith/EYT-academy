'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Laptop, Home, CheckCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { EYTService, PricingSettings, formatDualRate } from '@/lib/eyt-service';
import { STOCK_IMAGERY } from '@/lib/stock-imagery';

export default function LearningOptionsSection() {
  const [pricing, setPricing] = useState<PricingSettings | null>(null);

  useEffect(() => {
    setPricing(EYTService.getPricingSettings());
  }, []);

  const onlineRateDisplay = formatDualRate(
    pricing?.online_session_rate,
    pricing?.online_session_secondary_rate
  );

  const homeRateDisplay = formatDualRate(
    pricing?.home_session_rate,
    pricing?.home_session_secondary_rate
  );

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
          <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#C7DAF3] shadow-md hover:border-[#1E4E8C] transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#E8F0FA] text-[#1E4E8C] text-[11px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider z-10">
              Convenient & Global
            </div>

            <div className="space-y-5">
              {/* Representative Online Tutorial Photo */}
              {/* Note: Stock photo — replace with real client photo once marketing consent is obtained */}
              <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden border border-[#C7DAF3]/80 bg-[#E8F0FA]/40 shadow-xs">
                <Image
                  src={STOCK_IMAGERY.onlineTutorialChild.src}
                  alt={STOCK_IMAGERY.onlineTutorialChild.alt}
                  width={STOCK_IMAGERY.onlineTutorialChild.width}
                  height={STOCK_IMAGERY.onlineTutorialChild.height}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#1E4E8C] px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1.5 border border-[#C7DAF3]">
                  <Laptop className="w-3.5 h-3.5 text-[#1E4E8C]" />
                  <span>Live Video Tutorial</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                  ONLINE TUTORIAL
                </h3>
                <p className="text-sm font-semibold text-[#D4A017] mt-1">
                  Live interactive sessions from the comfort of your home.
                </p>
                <div className="mt-3 inline-flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8F0FA] border border-[#C7DAF3]">
                  <span className="text-xs font-semibold text-[#1E4E8C]/70">Rate:</span>
                  <span className="text-lg font-black text-[#1E4E8C]">
                    {onlineRateDisplay}
                  </span>
                  {onlineRateDisplay !== 'Contact for pricing' && (
                    <span className="text-xs text-[#1E4E8C]/70 font-medium">/ session</span>
                  )}
                </div>
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
          <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#F3E7C4] shadow-md hover:border-[#D4A017] transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-[#FDF7E7] text-[#D4A017] text-[11px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider z-10">
              Tactile & In-Person
            </div>

            <div className="space-y-5">
              {/* Representative Home Tutorial Photo */}
              {/* Note: Stock photo — replace with real client photo once marketing consent is obtained */}
              <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden border border-[#F3E7C4] bg-[#FDF7E7]/40 shadow-xs">
                <Image
                  src={STOCK_IMAGERY.homeTutorialChild.src}
                  alt={STOCK_IMAGERY.homeTutorialChild.alt}
                  width={STOCK_IMAGERY.homeTutorialChild.width}
                  height={STOCK_IMAGERY.homeTutorialChild.height}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#14263F] px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs flex items-center gap-1.5 border border-amber-200">
                  <Home className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>In-Person Home Visit</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold text-[#1E4E8C]">
                  HOME TUTORIAL
                </h3>
                <p className="text-sm font-semibold text-[#D4A017] mt-1">
                  In-person lessons in a safe and conducive environment.
                </p>
                <div className="mt-3 inline-flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FDF7E7] border border-[#F3E7C4]">
                  <span className="text-xs font-semibold text-[#14263F]/70">Rate:</span>
                  <span className="text-lg font-black text-[#14263F]">
                    {homeRateDisplay}
                  </span>
                  {homeRateDisplay !== 'Contact for pricing' && (
                    <span className="text-xs text-[#14263F]/70 font-medium">/ session</span>
                  )}
                </div>
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

        {/* Monthly Tuition Packages Banner */}
        {pricing?.monthly_package_rate && (
          <div className="mt-6 max-w-4xl mx-auto rounded-2xl bg-white border border-[#C7DAF3] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] shrink-0">
                <Sparkles className="w-5 h-5 text-[#D4A017]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E4E8C]">
                  Custom Monthly Tuition Packages
                </h4>
                <p className="text-sm font-semibold text-[#14263F]">
                  {pricing.monthly_package_rate}
                </p>
              </div>
            </div>
            <Link
              href="#enquiry"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1E4E8C] hover:text-[#153763] hover:underline shrink-0"
            >
              <span>Enquire About Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Trial Session Banner (When enabled by Mrs Sarah) */}
        {pricing?.trial_session_enabled && (
          <div className="mt-6 max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-[#14263F] via-[#1E4E8C] to-[#14263F] text-white p-6 sm:p-7 shadow-lg border border-[#D4A017]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017] text-[#14263F] text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 fill-[#14263F]" />
                Introductory Opportunity
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Book a Diagnostic Trial Session
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                {pricing.trial_session_description ||
                  'Experience Mrs Sarah’s 1-on-1 Montessori guidance before committing to regular sessions. 1 trial per child/family.'}
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2.5 shrink-0">
              <div className="text-center sm:text-right">
                <span className="text-[11px] text-blue-200 block uppercase font-medium">Introductory Fee</span>
                <span className="text-2xl sm:text-3xl font-black text-[#D4A017]">
                  {pricing.trial_session_price === 0
                    ? 'FREE'
                    : `${pricing.currency || '₦'}${Number(pricing.trial_session_price).toLocaleString()}`}
                </span>
              </div>
              <Link
                href="/signup?intent=trial"
                className="px-5 py-2.5 rounded-xl bg-[#D4A017] text-[#14263F] font-bold text-sm hover:bg-[#FDF7E7] transition-all shadow-md shadow-amber-900/20"
              >
                Claim Trial Session
              </Link>
            </div>
          </div>
        )}

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
