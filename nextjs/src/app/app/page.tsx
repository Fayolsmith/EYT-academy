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
  Phone,
  BookOpen
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Child, Booking, Enquiry, Invoice, Milestone } from '@/lib/eyt-service';
import AddChildModal from '@/components/AddChildModal';

export default function DashboardPage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [children, setChildren] = useState<Child[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);

  const loadDashboardData = useCallback(() => {
    if (isOwner) {
      setChildren(EYTService.getChildren());
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
            </div>
          ) : (
            <button
              onClick={() => setIsAddChildOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-sm hover:bg-[#A9790A] transition-all shadow-sm shadow-amber-200"
            >
              <PlusCircle className="w-4 h-4" />
              Add Child Profile
            </button>
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#E8F0FA] text-[#1E4E8C]">
                            {b.mode} Tutorial
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800">
                            {b.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#14263F]">
                          {new Date(b.start_time).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })} • {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {b.notes && (
                          <p className="text-xs text-[#6B7280]">Focus: {b.notes}</p>
                        )}
                      </div>

                      {b.meeting_link && b.mode === 'online' && (
                        <a
                          href={b.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E4E8C] text-white text-xs font-bold hover:bg-[#153763] transition-colors shrink-0"
                        >
                          <Video className="w-3.5 h-3.5 text-[#D4A017]" />
                          Join Video Call
                        </a>
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
                    href="tel:09133651659"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4A017] text-white text-xs font-bold hover:bg-[#A9790A] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call 09133651659
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
                          ₦{inv.amount.toLocaleString()}
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
                      className="text-xs font-bold text-[#1E4E8C] hover:underline shrink-0"
                    >
                      View Directory →
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
                      <div className="font-bold text-[#1E4E8C]">₦{inv.amount.toLocaleString()}</div>
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
                        {inv.status === 'paid' ? 'Paid ✓' : 'Mark as Paid'}
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