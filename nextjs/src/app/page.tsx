'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import AboutSection from '@/components/AboutSection';
import InteractiveLessonDemoSection from '@/components/InteractiveLessonDemoSection';
import WhatITutorSection from '@/components/WhatITutorSection';
import WhyLearnSection from '@/components/WhyLearnSection';
import LearningOptionsSection from '@/components/LearningOptionsSection';
import LearningMomentsSection from '@/components/LearningMomentsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import EnquiryFormSection from '@/components/EnquiryFormSection';
import Footer from '@/components/Footer';
import { PageTransition, ScrollReveal } from '@/components/motion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#14263F]">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <PageTransition>
          <HeroSection />

          <ScrollReveal>
            <StatsSection />
          </ScrollReveal>

          <ScrollReveal>
            <AboutSection />
          </ScrollReveal>

          <ScrollReveal>
            <InteractiveLessonDemoSection />
          </ScrollReveal>

          <ScrollReveal>
            <WhatITutorSection />
          </ScrollReveal>

          <ScrollReveal>
            <WhyLearnSection />
          </ScrollReveal>

          <ScrollReveal>
            <LearningOptionsSection />
          </ScrollReveal>

          <ScrollReveal>
            <LearningMomentsSection />
          </ScrollReveal>

          <ScrollReveal>
            <TestimonialsSection />
          </ScrollReveal>

          <ScrollReveal>
            <EnquiryFormSection />
          </ScrollReveal>
        </PageTransition>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}