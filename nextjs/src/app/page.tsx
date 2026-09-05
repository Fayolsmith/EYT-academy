'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import WhatITutorSection from '@/components/WhatITutorSection';
import WhyLearnSection from '@/components/WhyLearnSection';
import LearningOptionsSection from '@/components/LearningOptionsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import EnquiryFormSection from '@/components/EnquiryFormSection';
import Footer from '@/components/Footer';
import { PageTransition } from '@/components/motion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#14263F]">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <PageTransition>
          <HeroSection />
          <AboutSection />
          <WhatITutorSection />
          <WhyLearnSection />
          <LearningOptionsSection />
          <TestimonialsSection />
          <EnquiryFormSection />
        </PageTransition>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}