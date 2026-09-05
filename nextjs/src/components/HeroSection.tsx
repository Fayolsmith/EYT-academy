'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Phone, Mail, CheckCircle2, Heart, BookOpen, Star, Calendar } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#E8F0FA]/40 via-white to-white pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Decorative background circles */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-[#E8F0FA]/60 via-[#FDF7E7]/40 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Pill / Motto */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0FA] border border-[#C7DAF3] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#D4A017]" />
              <span className="text-xs sm:text-sm font-semibold text-[#1E4E8C] tracking-wide">
                Nurturing Young Minds. Building Bright Futures.
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E4E8C] leading-[1.1]">
                EARLY YEARS <br />
                <span className="text-[#D4A017] inline-block relative">
                  TUTOR
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 9C50 3 150 3 198 9" stroke="#D4A017" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-[#14263F] pt-2">
                Online & Home Tutorial For Children Ages 3–8
              </p>
            </div>

            {/* Mission / Flyer Quote */}
            <blockquote className="border-l-4 border-[#D4A017] pl-4 py-1 text-base sm:text-lg text-[#14263F]/90 italic bg-[#E8F0FA]/30 rounded-r-lg">
              “I provide engaging, child-centered lessons that build strong foundational skills in a nurturing and supportive environment.”
            </blockquote>

            {/* Key Qualifications Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Montessori Trained',
                'SEN-Inclusive',
                'British Curriculum',
                'Experienced & Patient',
                'Ages 3–8 (Nursery to Primary 2)',
              ].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#E8F0FA] shadow-xs text-xs font-semibold text-[#1E4E8C]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A017]" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/signup?intent=booking"
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
                Client & Parent Portal
              </Link>

              <a
                href="tel:09133651659"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white border-2 border-[#1E4E8C] text-[#1E4E8C] font-bold text-sm hover:bg-[#E8F0FA] transition-all"
              >
                <Phone className="w-4 h-4 text-[#D4A017]" />
                Call 09133651659
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
                    <div className="bg-[#D4A017] text-[#14263F] px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-[#14263F]" />
                      5.0 Tutor
                    </div>
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
