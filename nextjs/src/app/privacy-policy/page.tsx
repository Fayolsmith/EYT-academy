'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  FileText,
  UserCheck,
  Mail,
  Scale,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
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
            Nigeria Data Protection Act (NDPA) 2023 Compliance
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1E4E8C] tracking-tight">
            Privacy Policy & Child Data Protection Notice
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Effective Date: {lastUpdated} • Applicable to Mrs Sarah Early Years Tutoring Platform
          </p>
        </div>

        {/* Legal Overview Box */}
        <div className="my-8 p-5 sm:p-6 rounded-2xl bg-[#E8F0FA]/80 border border-[#C7DAF3] flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-[#D4A017] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-[#14263F] leading-relaxed">
            <h2 className="font-bold text-[#1E4E8C]">Our Commitment to Child Data Privacy</h2>
            <p>
              Mrs Sarah Early Years Tutoring Platform is dedicated to protecting the personal data of our learners (ages 3–8) and their families. This Privacy Notice is published in strict adherence to the <strong>Nigeria Data Protection Act 2023 (NDPA 2023)</strong> and describes how we collect, use, store, and safeguard your personal information.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 text-sm leading-relaxed text-[#14263F]/90">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">1</span>
              Data Controller Identity
            </h2>
            <p>
              For the purposes of the Nigeria Data Protection Act 2023, the Data Controller responsible for the processing of personal data on this platform is:
            </p>
            <div className="p-4 bg-white rounded-xl border border-gray-200 text-xs space-y-1">
              <p><strong>Name / Business:</strong> Mrs Sarah Oakhena (Operating as Mrs Sarah Early Years Tutoring Platform)</p>
              <p><strong>Practice Location:</strong> Lagos, Nigeria</p>
              <p><strong>Data Protection Contact Email:</strong> <a href="mailto:sarahoakhena@gmail.com" className="text-[#1E4E8C] font-semibold hover:underline">sarahoakhena@gmail.com</a></p>
              <p><strong>Business WhatsApp:</strong> <a href="https://wa.me/2349133651659" target="_blank" rel="noopener noreferrer" className="text-[#1E4E8C] font-semibold hover:underline">+234 913 365 1659</a></p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">2</span>
              Categories of Personal Data Collected
            </h2>
            <p>
              To provide personalized Montessori early years education and manage tutorial operations, we collect and process the following categories of information:
            </p>
            
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                <h3 className="font-bold text-[#1E4E8C] text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#D4A017]" />
                  A. Parent / Guardian Information
                </h3>
                <ul className="list-disc pl-5 text-xs text-[#6B7280] space-y-1">
                  <li><strong>Contact Details:</strong> Full name, verified email address, phone number, and WhatsApp contact details.</li>
                  <li><strong>Financial & Billing Records:</strong> Invoices issued, payment receipt files/screenshots uploaded for manual transfer verification, and fee settlement histories. (We do not store credit or debit card numbers).</li>
                  <li><strong>Communication History:</strong> In-platform session feedback, direct messages exchanged with Mrs Sarah, and public contact enquiries.</li>
                </ul>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                <h3 className="font-bold text-[#1E4E8C] text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D4A017]" />
                  B. Child / Minor Learner Information (Ages 3–8)
                </h3>
                <ul className="list-disc pl-5 text-xs text-[#6B7280] space-y-1">
                  <li><strong>Identity & Demographics:</strong> Child’s full name, date of birth, and age grouping.</li>
                  <li><strong>Educational & Milestone Assessments:</strong> Mastery records across the 5 Montessori developmental areas (Phonics & Literacy, Early Numeracy, Practical Life, Cultural Knowledge, and Creative Arts).</li>
                  <li><strong>Learning Notes & SEN Observations:</strong> Special educational needs (SEN), sensory preferences, pencil grip observations, learning strengths, and allergies.</li>
                  <li><strong>Profile Photos / Avatars:</strong> Optional learner photo uploaded by the parent or tutor for visual recognition in the portal.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">3</span>
              Lawful Basis & Parental Consent (Section 31 NDPA 2023)
            </h2>
            <p>
              In accordance with Section 31 of the Nigeria Data Protection Act 2023, the processing of personal data of a child or minor is lawful only where consent is given or authorized by a parent or legal guardian.
            </p>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-[#D4A017]" />
                Mandatory Parental Consent at Registration
              </div>
              <p>
                Every parent registering on our platform must explicitly check the statutory consent box affirming parental authority to collect and process their child’s educational records. We record the electronic timestamp, parent identifier, and consent version in our compliance audit log.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">4</span>
              Why We Collect This Data (Purpose of Processing)
            </h2>
            <ul className="list-disc pl-5 text-xs text-[#6B7280] space-y-1.5">
              <li><strong>Personalized Curriculum:</strong> Tailoring phonics, numeracy, and fine motor lessons to your child’s exact pace.</li>
              <li><strong>Progress Tracking & Reporting:</strong> Providing parents with transparent visibility into developmental milestone achievements.</li>
              <li><strong>Lesson Scheduling:</strong> Coordinating online video sessions (Google Meet) and home lesson appointments.</li>
              <li><strong>Financial Administration:</strong> Generating monthly fee invoices and manually verifying direct bank transfer proofs.</li>
              <li><strong>Child Safety & Safeguarding:</strong> Maintaining emergency parent contacts and allergy notes during home visits.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">5</span>
              Data Retention & Storage Security
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards to prevent unauthorized access, alteration, or disclosure of children’s records:
            </p>
            <ul className="list-disc pl-5 text-xs text-[#6B7280] space-y-1.5">
              <li><strong>Row Level Security (RLS):</strong> Database records are strictly partitioned using PostgreSQL Row Level Security so that parents can only access data pertaining to their own linked children.</li>
              <li><strong>Encryption in Transit:</strong> All data exchanged with our application is encrypted using Transport Layer Security (TLS/HTTPS).</li>
              <li><strong>Retention Schedule:</strong> Learner milestone progress and lesson records are maintained throughout active enrollment and retained for up to twelve (12) months following the conclusion of tutoring to allow parents to retrieve records upon primary school transition. Upon written request or account closure, records are securely erased.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">6</span>
              Your Statutory Rights Under the NDPA 2023
            </h2>
            <p>
              As a parent or guardian under the Nigeria Data Protection Act 2023, you have clear statutory rights regarding your own data and your child’s data:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-[#1E4E8C] block">Right of Access</span>
                <p className="text-[#6B7280]">You can view all records regarding your child at any time through the Parent Portal or request an export.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-[#1E4E8C] block">Right to Rectification</span>
                <p className="text-[#6B7280]">You may update incorrect contact details, child birthdates, or learning goals directly in Settings.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-[#1E4E8C] block">Right to Erasure (Deletion)</span>
                <p className="text-[#6B7280]">You have the right to request full erasure of your child’s profile, milestone notes, and uploaded photos.</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1">
                <span className="font-bold text-[#1E4E8C] block">Right to Data Portability</span>
                <p className="text-[#6B7280]">You can request a complete structured export of your child’s educational records in digital format.</p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#E8F0FA] text-[#1E4E8C] text-xs flex items-center justify-center font-mono font-bold">7</span>
              How to Submit a Data Access or Deletion Request
            </h2>
            <p>
              We have established a direct, transparent procedure for parents to exercise their privacy rights:
            </p>
            <div className="p-5 bg-white rounded-2xl border border-gray-200 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-[#1E4E8C]">
                <Mail className="w-4 h-4 text-[#D4A017]" />
                <span>Dedicated Privacy Request Channel:</span>
              </div>
              <p className="text-[#6B7280]">
                Navigate to <strong>Settings &gt; Data Privacy &amp; Statutory Rights</strong> inside the Parent Portal to trigger an instant data export or request complete account erasure, or email Mrs Sarah directly at:
              </p>
              <div className="p-3 bg-[#FCFBF7] rounded-xl border border-[#F3E7C4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="font-mono font-bold text-[#1E4E8C]">sarahoakhena@gmail.com</span>
                <a
                  href="mailto:sarahoakhena@gmail.com?subject=NDPA%20Data%20Privacy%20Request%20-%20Mrs%20Sarah%20Tutoring"
                  className="px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white font-bold text-xs text-center hover:bg-[#153763] transition-colors"
                >
                  Send Privacy Request Email
                </a>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Statutory Response Window: Under the NDPA 2023, all verifiable requests will be acknowledged within 72 hours and completed within 30 days without charge.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 pt-4 border-t border-gray-200 text-xs text-[#6B7280]">
            <h2 className="font-heading text-base font-bold text-[#1E4E8C]">Updates to this Policy</h2>
            <p>
              We may revise this Privacy Policy to reflect changes in our educational offerings or statutory guidelines under the Nigeria Data Protection Commission (NDPC). Material modifications will be communicated via the portal notice board and email.
            </p>
          </section>

        </div>

        {/* Back Link */}
        <div className="pt-8 mt-12 border-t border-gray-200 flex items-center justify-between text-xs">
          <Link href="/" className="font-bold text-[#1E4E8C] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <Link href="/terms" className="font-bold text-[#D4A017] hover:underline flex items-center gap-1">
            <span>View Terms of Service</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
