'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Scale,
  BookOpen
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
  const lastUpdated = 'September 5, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#14263F]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold text-[#1E4E8C] hover:text-[#153763] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 text-[#D4A017]" />
          Back to Homepage
        </Link>

        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-gray-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-[#D4A017]" />
            Client Agreement & Service Terms
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E4E8C] tracking-tight">
            Terms of Service & Tutoring Agreement
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Effective Date: {lastUpdated} • Mrs Sarah Early Years Tutoring Platform
          </p>
        </div>

        {/* Intro Highlight */}
        <div className="my-8 p-5 sm:p-6 rounded-2xl bg-[#E8F0FA]/80 border border-[#C7DAF3] flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-[#D4A017] flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-[#14263F] leading-relaxed">
            <h2 className="font-bold text-[#1E4E8C]">Educational Partnership with Families</h2>
            <p>
              These Terms of Service govern the engagement between Mrs Sarah Early Years Tutoring Platform and the parents or guardians of enrolled learners (ages 3–8). By registering an account or booking a tutorial, you agree to these clear, collaborative service terms.
            </p>
          </div>
        </div>

        {/* Terms Body */}
        <div className="space-y-10 text-sm leading-relaxed text-[#14263F]/90">
          
          {/* 1. Scope */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">1</span>
              Scope of Educational Services
            </h2>
            <p>
              Mrs Sarah provides specialized early years instruction centered on the British Early Years Foundation Stage (EYFS) and authentic Montessori principles for learners aged 3 to 8 years:
            </p>
            <ul className="list-disc pl-5 text-xs text-[#6B7280] space-y-1">
              <li><strong>Core Subjects:</strong> Phonics & Reading, Early Numeracy & Number Bonds, Practical Life skills, Cultural & World studies, and Creative Arts.</li>
              <li><strong>Inclusive Learning:</strong> Accommodations and individualized pacing for Special Educational Needs (SEN) including mild speech delays, sensory processing, and neurodiverse learners.</li>
              <li><strong>Lesson Modes:</strong> Interactive online video tutorials (via Google Meet) and in-person home tutoring visits across scheduled areas in Lagos, Nigeria.</li>
            </ul>
          </section>

          {/* 2. Scheduling & Rescheduling */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">2</span>
              Session Booking & Rescheduling Policy
            </h2>
            <div className="p-4 bg-white rounded-xl border border-gray-200 text-xs space-y-2">
              <div className="font-bold text-[#1E4E8C] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D4A017]" />
                24-Hour Notice for Rescheduling
              </div>
              <p className="text-[#6B7280] leading-relaxed">
                Consistency is vital to early childhood developmental progress. If a family must reschedule an upcoming session due to illness or travel, notice must be provided at least <strong>24 hours prior</strong> to the scheduled start time. Sessions cancelled with less than 24 hours notice may be forfeited at the tutor’s discretion.
              </p>
            </div>
          </section>

          {/* 3. Fees & Manual Bank Transfers */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">3</span>
              Fees, Invoicing & Manual Payment Verification
            </h2>
            <p>
              Tutorial packages are billed in advance per agreed monthly block in Nigerian Naira (NGN):
            </p>
            <ul className="list-disc pl-5 text-xs text-[#6B7280] space-y-1.5">
              <li><strong>Invoices:</strong> Invoices are issued directly into the Parent Portal with full details on the sessions covered and the due date.</li>
              <li><strong>Manual Bank Transfer:</strong> Fees are settled via direct electronic bank transfer to Mrs Sarah’s designated corporate account as displayed on the invoice.</li>
              <li><strong>Proof Upload:</strong> Parents are requested to upload transfer receipts or transaction screenshots via the <em>Upload Proof</em> button in the portal or submit via WhatsApp to 09133651659. Once verified, invoices are marked Paid.</li>
              <li><strong>Security:</strong> The platform does not store debit card credentials or bank account passwords.</li>
            </ul>
          </section>

          {/* 4. Child Safeguarding & Parental Presence */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">4</span>
              Child Safeguarding & Parental Supervision
            </h2>
            <p>
              To maintain the highest safeguarding standards for children between 3 and 8 years old:
            </p>
            <ul className="list-disc pl-5 text-xs text-[#6B7280] space-y-1.5">
              <li><strong>Online Lessons:</strong> A parent or designated adult guardian must be present in the home and within earshot throughout the duration of all virtual tutorials.</li>
              <li><strong>Home Visits:</strong> For in-person tutorials, a responsible adult must remain present on the premises at all times.</li>
              <li><strong>Safe Environment:</strong> Parents agree to provide a quiet, well-lit learning environment with required Montessori sensory manipulatives or writing materials.</li>
            </ul>
          </section>

          {/* 5. Learning Resources & IP */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">5</span>
              Intellectual Property & Resource Library
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              All printable worksheets, phonics flashcards, numeracy manipulatives templates, and milestone progress rubrics available in the Learning Resource Library are provided for the sole non-commercial personal use of enrolled families. Commercial redistribution or re-publishing without express written consent from Mrs Sarah Oakhena is prohibited.
            </p>
          </section>

          {/* 6. Milestone Progress Records */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">6</span>
              Milestone Progress Records & Developmental Purpose
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Developmental milestones tracked in the platform reflect individualized early years progress benchmarks and observational feedback. They are formative educational tools designed to support the child’s learning trajectory and should not be construed as formal medical or diagnostic evaluations.
            </p>
          </section>

          {/* 7. Governing Law */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">7</span>
              Governing Law & Jurisdiction
            </h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>. Both parties submit to the exclusive jurisdiction of the competent courts of Lagos State, Nigeria.
            </p>
          </section>

          {/* 8. Contact */}
          <section className="space-y-3 pt-4 border-t border-gray-200 text-xs">
            <h2 className="font-heading text-base font-bold text-[#1E4E8C]">Questions Regarding These Terms?</h2>
            <p className="text-[#6B7280]">
              If you have any questions regarding tutoring packages, scheduling policies, or terms of service, please contact Mrs Sarah Oakhena directly at <a href="mailto:sarahoakhena@gmail.com" className="text-[#1E4E8C] font-semibold hover:underline">sarahoakhena@gmail.com</a> or call <a href="tel:09133651659" className="text-[#1E4E8C] font-semibold hover:underline">09133651659</a>.
            </p>
          </section>

        </div>

        {/* Back Link */}
        <div className="pt-8 mt-12 border-t border-gray-200 flex items-center justify-between text-xs">
          <Link href="/" className="font-bold text-[#1E4E8C] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <Link href="/privacy-policy" className="font-bold text-[#D4A017] hover:underline">
            Read Child Privacy Policy →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
