import Link from 'next/link';
import { Compass, Home, Calendar, BookOpen, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col justify-between selection:bg-[#E8F0FA] selection:text-[#1E4E8C]">
      {/* Header bar */}
      <header className="border-b border-[#E5E0D8] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#1E4E8C] flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs group-hover:bg-[#153763] transition-colors">
              S
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-[#1E4E8C] block leading-tight">
                Mrs Sarah
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#D4A017] block">
                Early Years Tutoring
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1E4E8C] hover:text-[#153763] bg-[#E8F0FA] px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center text-center justify-center">
        {/* Soft Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0FA] border border-[#C5D7F0] text-xs font-bold text-[#1E4E8C] mb-6">
          <Compass className="w-4 h-4 text-[#D4A017]" />
          <span>Error 404 &bull; Page Not Found</span>
        </div>

        {/* Large Decorative 404 with Brand Palette */}
        <div className="relative mb-6 select-none">
          <span className="font-heading font-black text-8xl sm:text-9xl tracking-tighter text-[#1E4E8C]/10 block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-xl border border-gray-100 flex items-center justify-center transform -rotate-6 transition-transform hover:rotate-0">
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-[#D4A017]" />
            </div>
          </div>
        </div>

        {/* Headings */}
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#14263F] max-w-xl leading-tight">
          This learning trail wandered off the map
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#6B7280] max-w-lg leading-relaxed">
          The page or lesson record you are looking for might have been renamed, moved, or is temporarily unavailable. Let’s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1E4E8C] text-white font-bold text-sm hover:bg-[#153763] shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </Link>

          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] shadow-md hover:shadow-lg transition-all"
          >
            <Calendar className="w-4 h-4" />
            Open Portal & Dashboard
          </Link>

          <Link
            href="/#enquire"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-gray-200 text-[#1E4E8C] font-bold text-sm hover:bg-gray-50 shadow-xs transition-all"
          >
            <Mail className="w-4 h-4 text-[#D4A017]" />
            Send an Enquiry
          </Link>
        </div>

        {/* Helpful Shortcut Cards */}
        <div className="mt-14 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <Link
            href="/app/resources"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#1E4E8C]/40 hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FA] flex items-center justify-center text-[#1E4E8C] mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4 text-[#1E4E8C]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#14263F] group-hover:text-[#1E4E8C] transition-colors">
              Learning Resources
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              Phonics worksheets, numeracy guides, and Montessori printables.
            </p>
          </Link>

          <Link
            href="/privacy-policy"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#1E4E8C]/40 hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#14263F] group-hover:text-[#1E4E8C] transition-colors">
              Data Privacy & NDPA
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              Statutory child data protection and parental consent under NDPA 2023.
            </p>
          </Link>

          <Link
            href="/terms"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#1E4E8C]/40 hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FCFBF7] border border-[#E5E0D8] flex items-center justify-center text-[#D4A017] mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4 text-[#D4A017]" />
            </div>
            <h3 className="font-heading font-bold text-sm text-[#14263F] group-hover:text-[#1E4E8C] transition-colors">
              Terms of Service
            </h3>
            <p className="text-xs text-[#6B7280] mt-1">
              Tutoring guidelines, 24-hr session notice, and payment policies.
            </p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D8] bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <div>
            &copy; {new Date().getFullYear()} Mrs Sarah Early Years Tutoring. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-[#1E4E8C] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#1E4E8C] transition-colors">
              Terms of Service
            </Link>
            <Link href="/#contact" className="hover:text-[#1E4E8C] transition-colors">
              Contact Sarah
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
