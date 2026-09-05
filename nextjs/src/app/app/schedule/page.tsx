'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import { EYTService, Booking } from '@/lib/eyt-service';

export default function SchedulePage() {
  const { profile } = useGlobal();
  const isOwner = profile?.role === 'owner';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setBookings(EYTService.getBookings());
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [profile]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#D4A017]" />
            Tutorial Calendar
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Session Schedule & Booking
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'Manage tutoring hours, availability slots, and student appointments.'
              : 'View upcoming tutorials, access live video links, and review scheduled dates.'}
          </p>
        </div>
      </div>

      {/* Phase 2 Coming Soon Notice Card */}
      <div className="bg-gradient-to-r from-[#1E4E8C] to-[#153763] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A017] text-[#14263F] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Phase 2 Scope: Live Booking System
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
            Automated Slot Selection & Booking Arrives in Phase 2
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            In Phase 2, Mrs Sarah can configure real-time online and in-person slots, and parents will be able to book sessions with automatic video meeting links and cancellation windows.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-md bg-white/10 text-white border border-white/15">
              ✓ Open slot calendar
            </span>
            <span className="px-3 py-1 rounded-md bg-white/10 text-white border border-white/15">
              ✓ Online & Home mode toggles
            </span>
            <span className="px-3 py-1 rounded-md bg-white/10 text-white border border-white/15">
              ✓ 24hr reschedule window
            </span>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-20 -mt-20 pointer-events-none" />
      </div>

      {/* Scheduled Tutorials List */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-[#1E4E8C] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D4A017]" />
          Scheduled Sessions ({bookings.length})
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-6 w-48 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-6 w-28 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F0FA] flex items-center justify-center mx-auto text-[#1E4E8C]">
              <Calendar className="w-7 h-7 text-[#D4A017]" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-heading font-bold text-lg text-[#14263F]">
                No Sessions Scheduled Yet
              </h3>
              <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                {isOwner
                  ? 'There are currently no active bookings in the calendar. Upcoming tutorial dates will appear here.'
                  : 'You do not have any upcoming tutorials scheduled at the moment. As soon as Mrs Sarah confirms your tutorial hours, they will appear here with Google Meet links.'}
              </p>
            </div>
            <div className="pt-2">
              <a
                href="mailto:sarahoakhena@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all"
              >
                <Mail className="w-4 h-4 text-[#D4A017]" />
                Contact Sarah to Arrange a Session
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 hover:border-[#D4A017] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1E4E8C] block">
                      Student: {booking.child_name || 'Child'}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-[#14263F] mt-1">
                      {new Date(booking.start_time).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
                      booking.mode === 'online'
                        ? 'bg-[#E8F0FA] text-[#1E4E8C]'
                        : 'bg-[#FCFBF7] border border-amber-200 text-[#D4A017]'
                    }`}
                  >
                    {booking.mode === 'online' ? 'Online Video' : 'Home Tutorial'}
                  </span>
                </div>

                {booking.notes && (
                  <p className="text-xs text-[#6B7280] bg-[#F3F7FD] p-3 rounded-xl border border-[#E8F0FA]">
                    Focus: {booking.notes}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Confirmed
                  </span>

                  {booking.meeting_link && booking.mode === 'online' && (
                    <a
                      href={booking.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E4E8C] text-white font-bold hover:bg-[#153763] transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-[#D4A017]" />
                      Join Call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Booking Assistance */}
      <div className="bg-[#FCFBF7] rounded-2xl p-6 border border-[#F3E7C4] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-heading font-bold text-base text-[#1E4E8C]">
            Need to request or adjust a tutoring slot today?
          </h4>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Contact Mrs Sarah directly via phone or WhatsApp for immediate confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:09133651659"
            className="px-4 py-2 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            09133651659
          </a>
          <a
            href="mailto:sarahoakhena@gmail.com"
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-[#14263F] font-semibold text-xs hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-[#1E4E8C]" />
            Email Sarah
          </a>
        </div>
      </div>
    </div>
  );
}
