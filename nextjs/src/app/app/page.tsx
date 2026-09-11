'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  Award,
  CreditCard,
  PlusCircle,
  Video,
  Mail,
  BookOpen,
  Heart,
  Sparkles,
  MessageCircle,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  EYTService,
  Child,
  Booking,
  Enquiry,
  Invoice,
  Milestone,
  PracticeAlert,
  formatCurrency,
  formatDateInTimezone,
  formatTimeInTimezone,
  detectUserTimezone,
  SARAH_TIMEZONE
} from '@/lib/eyt-service';
import AddChildModal from '@/components/AddChildModal';
import { useGlobal } from '@/lib/context/GlobalContext';

export default function DashboardPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';
  const userTz = isOwner ? SARAH_TIMEZONE : (profile?.timezone || detectUserTimezone());

  const [children, setChildren] = useState<Child[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [practiceAlerts, setPracticeAlerts] = useState<PracticeAlert[]>([]);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  const loadDashboardData = useCallback(() => {
    if (isOwner) {
      setChildren(EYTService.getChildren());
      const checkResult = EYTService.checkAndGenerateDisengagementAlerts();
      setPracticeAlerts(checkResult.allActiveAlerts);
    } else {
      setChildren(EYTService.getChildren(profile?.id));
    }
    setBookings(EYTService.getBookings());
    setEnquiries(EYTService.getEnquiries());
    setInvoices(EYTService.getInvoices());
    setMilestones(EYTService.getMilestones());
  }, [isOwner, profile?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleChildAdded = (newChild: Child) => {
    setChildren([...children, newChild]);
    loadDashboardData();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Welcome Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
            {isOwner ? 'Mrs Sarah • Head Educator Dashboard' : 'Parent & Family Portal'}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Welcome back, {profile?.full_name || 'Family'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            {isOwner
              ? 'Manage tutoring sessions, student milestone records, and client enquiries.'
              : 'Track your child’s Montessori progress, view session notes, and book upcoming tutorials.'}
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 relative z-10">
          {isOwner ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsAddChildOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
              >
                <PlusCircle className="w-4 h-4" />
                Enroll Student
              </button>
              <Link
                href="#enquiries-table"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-sm hover:bg-[#153763] transition-all shadow-sm"
              >
                <Mail className="w-4 h-4 text-[#D4A017]" />
                Enquiries ({enquiries.filter(e => e.status === 'new').length} New)
              </Link>
              <Link
                href="#practice-alerts-section"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                  practiceAlerts.length > 0
                    ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-300'
                    : 'bg-white border border-[#C7DAF3] text-[#1E4E8C] hover:bg-[#E8F0FA]'
                }`}
              >
                <Activity className="w-4 h-4 text-[#D4A017]" />
                Practice Alerts ({practiceAlerts.length})
              </Link>
              <Link
                href="/app/testimonials"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#C7DAF3] text-[#1E4E8C] font-bold text-sm hover:bg-[#E8F0FA] transition-all shadow-xs"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                Testimonials
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/app/child-mode"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-sm hover:bg-[#153763] transition-all shadow-sm shadow-blue-900/20 ring-2 ring-[#D4A017]"
              >
                <Sparkles className="w-4 h-4 text-[#D4A017]" />
                Enter Child Mode
              </Link>
              <button
                onClick={() => setIsAddChildOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
              >
                <PlusCircle className="w-4 h-4" />
                Add Child Profile
              </button>
              <Link
                href="/app/testimonials"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8F0FA] border border-[#C7DAF3] text-[#1E4E8C] font-bold text-sm hover:bg-[#d4e4f7] transition-all shadow-xs"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Leave a Testimonial
              </Link>
            </div>
          )}
        </div>

        {/* Background decorative shape */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-[#E8F0FA] to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
      </div>

      {/* ========================================================= */}
      {/* PARENT VIEW                                               */}
      {/* ========================================================= */}
      {!isOwner && (
        <div className="space-y-8">
          
          {/* Play & Learn Time — Child Mode Launch Card */}
          <div className="bg-gradient-to-r from-[#FCFBF7] via-[#FFFDF9] to-[#E8F0FA] rounded-3xl p-6 sm:p-7 border-2 border-[#D4A017]/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#1E4E8C] text-[#D4A017] flex items-center justify-center border border-[#D4A017] shadow-xs shrink-0 mx-auto sm:mx-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-heading font-extrabold text-lg text-[#1E4E8C]">
                    Play &amp; Learn Time (Child Mode)
                  </h3>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Parent Unlocked
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] max-w-xl">
                  Hand your device to your child for a supervised, distraction-free learning session. Includes Mrs Sarah&apos;s adaptive mascot helper (Pip), home practice tasks, and the 5 Montessori games with a secure parental exit gate.
                </p>
              </div>
            </div>

            <Link
              href="/app/child-mode"
              className="px-6 py-3.5 rounded-2xl bg-[#D4A017] text-white font-heading font-extrabold text-sm hover:bg-[#B4820A] active:scale-95 transition-all shadow-md shadow-amber-200/60 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter Child Mode</span>
            </Link>
          </div>
          
          {/* Children Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4A017]" />
                Registered Children ({children.length})
              </h2>
              <button
                onClick={() => setIsAddChildOpen(true)}
                className="text-xs font-bold text-[#1E4E8C] hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#D4A017]" />
                Add Another Child
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.map((child) => {
                const childMilestones = EYTService.getChildMilestones(child.id);
                const achievedCount = childMilestones.filter((m) => m.status === 'achieved').length;

                return (
                  <div
                    key={child.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#D4A017] transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {child.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={child.avatar_url}
                            alt={child.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-[#C7DAF3] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-[#E8F0FA] text-[#1E4E8C] font-heading font-bold text-lg flex items-center justify-center border border-[#C7DAF3] shrink-0">
                            {child.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-heading text-lg font-bold text-[#14263F]">
                            {child.name}
                          </h3>
                          <p className="text-xs text-[#6B7280]">
                            Age: {child.age_years || 'Early Years'} • DOB: {child.date_of_birth || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <span className="bg-[#FCFBF7] border border-amber-200 text-[#D4A017] text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {achievedCount} Skills Achieved
                      </span>
                    </div>

                    {child.learning_goals && (
                      <div className="p-3 bg-[#F3F7FD] rounded-xl border border-[#E8F0FA] text-xs space-y-1">
                        <div className="font-bold text-[#1E4E8C]">Focus Goals:</div>
                        <p className="text-[#14263F]/80">{child.learning_goals}</p>
                      </div>
                    )}

                    {child.notes && (
                      <p className="text-xs text-[#6B7280] italic">
                        &ldquo;{child.notes}&rdquo;
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
                      <span className="text-[#6B7280]">Tutor: Mrs Sarah</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#1E4E8C] font-bold">
                          Active Learner
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookings & Schedule Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Upcoming Sessions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D4A017]" />
                  Upcoming Tutorials
                </h2>
              </div>

              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center text-xs text-[#6B7280]">
                    No bookings scheduled yet.
                  </div>
                ) : (
                  bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1E4E8C]">
                            {b.child_name}
                          </span>
                          {b.session_type === 'trial' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              Trial Session
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#E8F0FA] text-[#1E4E8C]">
                            {b.mode} Tutorial
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#14263F]">
                          {formatDateInTimezone(b.start_time, userTz, false)} •{' '}
                          {formatTimeInTimezone(b.start_time, userTz, true)}
                        </p>
                        {b.notes && (
                          <p className="text-xs text-[#6B7280]">Focus: {b.notes}</p>
                        )}
                      </div>

                      {b.mode === 'online' && (
                        b.meeting_link ? (
                          <a
                            href={b.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-colors shrink-0"
                          >
                            <Video className="w-3.5 h-3.5 text-[#D4A017]" />
                            Join Video Call
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium shrink-0">
                            <Video className="w-3.5 h-3.5 text-gray-400" />
                            Meeting link not yet provided
                          </span>
                        )
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Contact & Invoices summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Tutor Contact card */}
              <div className="bg-[#1E4E8C] text-white rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-[#D4A017]">
                    <BookOpen className="w-6 h-6 text-[#D4A017]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-white">
                      Mrs Sarah
                    </h3>
                    <p className="text-xs text-blue-100">
                      Montessori Early Years Tutor
                    </p>
                  </div>
                </div>

                <p className="text-xs text-blue-100/90 leading-relaxed">
                  Need to reschedule, request home tutorial arrangements, or discuss your child’s weekly progress?
                </p>

                <div className="pt-1 flex flex-col gap-2">
                  <a
                    href="https://wa.me/2349133651659"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Mrs Sarah
                  </a>
                  <a
                    href="mailto:sarahoakhena@gmail.com"
                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors border border-white/20"
                  >
                    <Mail className="w-4 h-4 text-[#D4A017]" />
                    Email Mrs Sarah
                  </a>
                </div>
              </div>

              {/* Invoices */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-3">
                <h3 className="font-heading font-bold text-base text-[#1E4E8C] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#D4A017]" />
                  Tuition Invoices
                </h3>

                <div className="space-y-2">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 rounded-xl bg-[#FCFBF7] border border-amber-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#14263F]">{inv.invoice_number}</div>
                        <div className="text-[11px] text-[#6B7280]">{inv.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#1E4E8C]">
                          {formatCurrency(inv.amount, inv.currency)}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* OWNER VIEW (Mrs Sarah)                                    */}
      {/* ========================================================= */}
      {isOwner && (
        <div className="space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280] uppercase">Active Students</span>
                <Users className="w-4 h-4 text-[#1E4E8C]" />
              </div>
              <div className="text-2xl font-bold font-heading text-[#1E4E8C] mt-2">
                {children.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Ages 3–8 enrolled</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280] uppercase">Scheduled Bookings</span>
                <Calendar className="w-4 h-4 text-[#D4A017]" />
              </div>
              <div className="text-2xl font-bold font-heading text-[#D4A017] mt-2">
                {bookings.length}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">Online & Home lessons</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280] uppercase">Public Enquiries</span>
                <Mail className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold font-heading text-[#1E4E8C] mt-2">
                {enquiries.length}
              </div>
              <div className="text-[11px] text-rose-600 font-bold mt-1">
                {enquiries.filter(e => e.status === 'new').length} Unread / New
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7280] uppercase">Milestone Bank</span>
                <Award className="w-4 h-4 text-[#D4A017]" />
              </div>
              <div className="text-2xl font-bold font-heading text-[#14263F] mt-2">
                {milestones.length}
              </div>
              <div className="text-[11px] text-[#6B7280] mt-1">Montessori EYFS Skills</div>
            </div>
          </div>

          {/* Home Practice Disengagement Alerts Section (Similar in spirit to Enquiry Inbox) */}
          <div id="practice-alerts-section" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#D4A017]" />
                  Home Practice Inactivity Alerts
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Flagged students with 5+ consecutive days of zero Child Mode activity
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  practiceAlerts.length > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {practiceAlerts.length > 0 ? `${practiceAlerts.length} Attention Needed` : 'All Active / 0 Inactive'}
                </span>
              </div>
            </div>

            {practiceAlerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  All enrolled learners are currently engaged or within regular home practice intervals. No 5+ day inactivity streaks detected.
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#14263F]">
                  <thead className="bg-[#FCFBF7] text-[#1E4E8C] uppercase font-bold text-[10px] border-b border-amber-200/50">
                    <tr>
                      <th className="p-3 rounded-l-lg">Student</th>
                      <th className="p-3">Inactivity Streak</th>
                      <th className="p-3">Last Active</th>
                      <th className="p-3">Parent &amp; Contact</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 rounded-r-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {practiceAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3 font-bold text-[#1E4E8C]">{alert.child_name}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            {alert.days_inactive} consecutive days quiet
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">
                          {alert.last_active_date || 'No activity yet'}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-[#14263F]">{alert.parent_name}</div>
                          <div className="text-[11px] text-[#6B7280]">{alert.parent_email || 'No email'}</div>
                          {alert.parent_phone && (
                            <div className="text-[11px] text-[#D4A017] font-medium">{alert.parent_phone}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                            {alert.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {alert.parent_phone && (
                              <a
                                href={`https://wa.me/${alert.parent_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${alert.parent_name}, Mrs Sarah here! I noticed ${alert.child_name} hasn't been active on Child Mode recently. Hope everything is going well with home practice!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                title="Check in via WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            {alert.parent_email && (
                              <a
                                href={`mailto:${alert.parent_email}?subject=${encodeURIComponent(`Checking in on ${alert.child_name}'s Home Practice with Mrs Sarah`)}&body=${encodeURIComponent(`Dear ${alert.parent_name},\n\nI hope you're having a wonderful week! I noticed ${alert.child_name} hasn't had a chance to practice on Child Mode recently.\n\nPlease let me know if you need any guidance or support with the Montessori activities.\n\nWarm regards,\nMrs Sarah`)}`}
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-colors flex items-center gap-1"
                                title="Send email check-in"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Email</span>
                              </a>
                            )}
                            <button
                              onClick={() => {
                                EYTService.acknowledgePracticeAlert(alert.id);
                                loadDashboardData();
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                              title="Mark this quiet streak as acknowledged"
                            >
                              Acknowledge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enquiries Inbox Section */}
          <div id="enquiries-table" className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#D4A017]" />
                  Public Enquiry Inbox
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Messages received from visitors on the public website enquiry form
                </p>
              </div>
              <span className="text-xs font-bold bg-[#E8F0FA] text-[#1E4E8C] px-3 py-1 rounded-full">
                {enquiries.length} Total Enquiries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#14263F]">
                <thead className="bg-[#E8F0FA] text-[#1E4E8C] uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-lg">Parent Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Child Age / Class</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Message</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3 font-bold text-[#1E4E8C]">{enq.name}</td>
                      <td className="p-3 font-medium">{enq.contact}</td>
                      <td className="p-3">{enq.child_age || '—'}</td>
                      <td className="p-3 uppercase text-[10px] font-bold text-[#D4A017]">{enq.preferred_mode || 'online'}</td>
                      <td className="p-3 max-w-xs text-gray-700 leading-relaxed">{enq.message}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            enq.status === 'new'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            EYTService.updateEnquiryStatus(
                              enq.id,
                              enq.status === 'new' ? 'contacted' : 'new'
                            );
                            loadDashboardData();
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-colors"
                        >
                          {enq.status === 'new' ? 'Mark Contacted' : 'Mark New'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Directory & Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D4A017]" />
                    Enrolled Students ({children.length})
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Students enrolled in active Montessori tutorial programs
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="p-4 rounded-xl border border-gray-100 bg-[#FCFBF7] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {child.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={child.avatar_url}
                          alt={child.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-white flex items-center justify-center font-bold shrink-0">
                          {child.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#14263F]">{child.name}</span>
                          {child.has_portal_account ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Portal Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              No portal access yet
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          Parent: {child.parent_name || 'Unassigned'} ({child.parent_email || 'No email'}) • Age: {child.age_years}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/app/children"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1E4E8C] hover:underline shrink-0"
                    >
                      View Directory
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoices Status & Manual Marking */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#D4A017]" />
                  Billing & Invoices
                </h2>
              </div>

              <div className="space-y-2.5">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#14263F]">{inv.parent_name || 'Parent'}</div>
                      <div className="text-[11px] text-[#6B7280]">{inv.description}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{inv.invoice_number}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold text-[#1E4E8C]">{formatCurrency(inv.amount, inv.currency)}</div>
                      <button
                        onClick={() => {
                          if (inv.status === 'unpaid') {
                            EYTService.markInvoicePaid(inv.id);
                          }
                          loadDashboardData();
                        }}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                      >
                        {inv.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          'Mark as Paid'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        onChildAdded={handleChildAdded}
      />

    </div>
  );
}