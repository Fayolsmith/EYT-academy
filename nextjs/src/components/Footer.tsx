'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Phone, Mail, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#14263F] text-white pt-16 pb-12 border-t-4 border-[#D4A017]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] flex items-center justify-center text-white border border-[#D4A017]">
                <BookOpen className="w-5 h-5 text-[#D4A017]" />
              </div>
              <span className="font-heading text-xl font-bold text-white">
                Mrs Sarah Tutoring
              </span>
            </div>

            <p className="text-sm text-blue-100/80 leading-relaxed max-w-sm">
              Montessori-trained, SEN-inclusive early years tutoring for children ages 3 to 8. Nurturing young minds and building bright futures through child-centered instruction.
            </p>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#FDF7E7] italic">
              &ldquo;Every child can learn, just not on the same day, or in the same way.&rdquo;
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4A017]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li>
                <Link href="#about" className="hover:text-white transition-colors">
                  About Mrs Sarah
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-white transition-colors">
                  What I Tutor
                </Link>
              </li>
              <li>
                <Link href="#why-me" className="hover:text-white transition-colors">
                  Why Learn With Me
                </Link>
              </li>
              <li>
                <Link href="#learning-options" className="hover:text-white transition-colors">
                  Learning Options
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="hover:text-white transition-colors">
                  Parent Testimonials
                </Link>
              </li>
              <li>
                <Link href="#enquiry" className="hover:text-white transition-colors">
                  Contact & Enquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Portals & Access */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4A017]">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-sm text-blue-100/70">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Parent & Tutor Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Create Parent Account
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5 text-xs text-[#D4A017] font-semibold">
                  Privacy Policy (NDPA 2023)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors text-xs text-blue-100/90 font-medium">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-[#D4A017]">
              Direct Contact
            </h4>
            <div className="space-y-2 text-sm text-blue-100/80">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A017]" />
                <a href="tel:09133651659" className="hover:text-white">
                  09133651659
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4A017]" />
                <a href="mailto:sarahoakhena@gmail.com" className="hover:text-white text-xs break-all">
                  sarahoakhena@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4A017]" />
                <a href="mailto:sarahofure45@gmail.com" className="hover:text-white text-xs break-all">
                  sarahofure45@gmail.com
                </a>
              </div>
              <div className="pt-2 text-xs text-blue-200/60">
                Online & On-site / Home Tutorials Available
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-100/60">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} Mrs Sarah Early Years Tutoring Platform. All rights reserved.</span>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-white underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white underline">
              Terms of Service
            </Link>
          </div>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 shrink-0"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
