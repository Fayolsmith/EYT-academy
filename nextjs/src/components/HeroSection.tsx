'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Mail, Heart, BookOpen, Star, Calendar, MessageCircle } from 'lucide-react';
import { EYTService, PricingSettings } from '@/lib/eyt-service';

export default function HeroSection() {
  const [ratingSummary, setRatingSummary] = useState<{ average: number | null; count: number }>({
    average: null,
    count: 0,
  });
  const [pricing, setPricing] = useState<PricingSettings | null>(null);

  useEffect(() => {
    setRatingSummary(EYTService.getPublicRatingSummary());
    setPricing(EYTService.getPricingSettings());
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#E8F0FA]/30 via-white to-white pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#D4A017]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#1E4E8C]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Live Trust & Experience Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#D4A017]" />
              <span className="text-xs font-bold tracking-wide uppercase text-[#1E4E8C]">
                {ratingSummary.count > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex items-center text-amber-500 font-extrabold gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {ratingSummary.average?.toFixed(1)}
                    </span>
                    <span className="text-[#6B7280]">
                      ({ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'})
                    </span>
                    <span>•</span>
                    <span>15+ Years Montessori Experience</span>
                  </span>
                ) : (
                  'Montessori Certified • 15+ Years Experience'
                )}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E4E8C] tracking-tight leading-[1.15]">
              Nurturing Young Minds Through{' '}
              <span className="text-[#D4A017] underline decoration-amber-200 decoration-wavy">
                Montessori
              </span>{' '}
              Excellence
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Personalized early years tutoring for Nursery, Preschool, and Primary 1 & 2 learners (ages 3–8).
              Building confidence, phonics fluency, numeracy mastery, and a lifelong love for learning.
            </p>

            {/* Tuition Rate Indicator */}
            {pricing && (
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-semibold text-[#14263F] bg-amber-50/80 border border-amber-200/80 px-4 py-2 rounded-2xl">
                <span>Tuition from:</span>
                <span className="font-extrabold text-[#1E4E8C]">
                  {pricing.currency}{Number(pricing.online_session_rate).toLocaleString()}/session
                </span>
                {pricing.trial_session_enabled && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-700 font-bold">
                      {pricing.trial_session_price === 0
                        ? 'Diagnostic Trial Session Available (Free)'
                        : `Diagnostic Trial: ${pricing.currency}${Number(pricing.trial_session_price).toLocaleString()}`}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="#enquiry"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4A017] text-white font-bold text-base hover:bg-[#A9790A] transition-all shadow-md shadow-amber-200/50 hover:shadow-lg hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5" />
                Book a Session
              </Link>

              <Link
                href="/app"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-base hover:bg-[#153763] transition-all shadow-md shadow-blue-200/50 hover:shadow-lg hover:-translate-y-0.5"
              >
                <BookOpen className="w-5 h-5 text-[#D4A017]" />
                Guardian & Parent Portal
              </Link>

              <a
                href="https://wa.me/2349133651659"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white border-2 border-[#1E4E8C] text-[#1E4E8C] font-bold text-sm hover:bg-[#E8F0FA] transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                WhatsApp
              </a>
            </div>

            {/* Contact Micro Info */}
            <div className="pt-2 text-xs sm:text-sm text-[#6B7280] flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#1E4E8C]" />
                sarahoakhena@gmail.com
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Personalized 1-on-1 & Small Group
              </span>
            </div>
          </div>

          {/* Right Column: Mrs Sarah Profile Showcase Card */}
          <div className="lg:col-span-5 relative">
            {/* Background Accent Frame */}
            <div className="absolute inset-0 bg-[#D4A017]/15 rounded-3xl transform rotate-2 scale-105 -z-10" />
            <div className="absolute inset-0 bg-[#1E4E8C]/10 rounded-3xl transform -rotate-2 scale-102 -z-10" />

            {/* Main Showcase Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-4 sm:p-6 space-y-4">
              
              {/* Tutor Photo & Badges */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-[#E8F0FA] border border-[#C7DAF3]">
                <Image
                  src="/images/flyer1.jpeg"
                  alt="Mrs Sarah — Early Years Tutor"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14263F]/80 via-transparent to-transparent" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-white">Mrs Sarah</h2>
                      <p className="text-xs text-[#FDF7E7] font-medium">Early Years Teacher & Specialist</p>
                    </div>
                    {ratingSummary.count > 0 && ratingSummary.average !== null ? (
                      <div className="bg-[#D4A017] text-[#14263F] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 fill-[#14263F]" />
                        <span>{ratingSummary.average.toFixed(1)} ({ratingSummary.count} {ratingSummary.count === 1 ? 'review' : 'reviews'})</span>
                      </div>
                    ) : (
                      <div className="bg-white/95 backdrop-blur-xs text-[#1E4E8C] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow border border-[#C7DAF3]">
                        <Sparkles className="w-3 h-3 text-[#D4A017]" />
                        <span>New on Platform</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tagline Banner from Flyer */}
              <div className="bg-[#1E4E8C] text-white p-3.5 rounded-xl text-center space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D4A017]">
                  Montessori Trained | SEN-Inclusive
                </p>
                <p className="text-sm font-medium text-blue-50">
                  Experienced • Passionate • Patient
                </p>
              </div>

              {/* Flyer Quote Card */}
              <div className="bg-[#E8F0FA] p-4 rounded-xl border border-[#C7DAF3]/60">
                <div className="flex items-start gap-2">
                  <span className="text-2xl text-[#D4A017] font-serif leading-none">“</span>
                  <p className="text-xs sm:text-sm text-[#14263F] font-medium leading-relaxed italic">
                    Every child can learn, just not on the same day, or in the same way.
                  </p>
                </div>
                <p className="text-right text-[11px] font-bold text-[#1E4E8C] mt-1">
                  — Let&apos;s give your child the best start, together!
                </p>
              </div>

              {/* Interactive Stat strip */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-[#FCFBF7] p-2 rounded-lg border border-amber-100">
                  <div className="text-base font-bold text-[#1E4E8C]">3–8</div>
                  <div className="text-[10px] text-[#6B7280]">Years Age</div>
                </div>
                <div className="bg-[#FCFBF7] p-2 rounded-lg border border-amber-100">
                  <div className="text-base font-bold text-[#D4A017]">100%</div>
                  <div className="text-[10px] text-[#6B7280]">Child-Centered</div>
                </div>
                <div className="bg-[#FCFBF7] p-2 rounded-lg border border-amber-100">
                  <div className="text-base font-bold text-[#1E4E8C]">Online/Home</div>
                  <div className="text-[10px] text-[#6B7280]">Flexible Mode</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
