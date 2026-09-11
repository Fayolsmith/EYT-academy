'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Video,
  PlusCircle,
  Repeat,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  MapPin,
  Bell,
  Trash2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Globe,
  Check,
  X,
} from 'lucide-react';
import { useGlobal } from '@/lib/context/GlobalContext';
import {
  EYTService,
  Booking,
  Child,
  AvailabilitySlot,
  LessonMode,
  SessionReminderNotification,
  SessionType,
  PricingSettings,
  SARAH_TIMEZONE,
  detectUserTimezone,
  formatDateInTimezone,
  formatTimeInTimezone,
  formatDateTimeInTimezone,
  getTimezoneAbbr,
  convertLagosTimeToUTC,
  formatDualTimePreview
} from '@/lib/eyt-service';
import { AnimatedModal, Skeleton, useToast } from '@/components/motion';

type ActiveScheduleTab = 'upcoming' | 'history' | 'availability' | 'reminders';

export default function SchedulePage() {
  const { profile } = useGlobal();
  const { showToast } = useToast();
  const isOwner = profile?.role === 'owner';
  const userTz = isOwner ? SARAH_TIMEZONE : (profile?.timezone || detectUserTimezone());
  const tzAbbr = getTimezoneAbbr(userTz);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [reminders, setReminders] = useState<SessionReminderNotification[]>([]);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() =>
    EYTService.getPricingSettings()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Tab & Filter state
  const [activeTab, setActiveTab] = useState<ActiveScheduleTab>('upcoming');
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [attendanceBooking, setAttendanceBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);

  // 1. Book Modal Form State
  const [bookChildId, setBookChildId] = useState('');
  const [bookSessionType, setBookSessionType] = useState<SessionType>('standard');
  const [bookMode, setBookMode] = useState<LessonMode>('online');
  const [isRecurring, setIsRecurring] = useState(false);
  const [weeksCount, setWeeksCount] = useState(4);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('custom');
  const [customDate, setCustomDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [customStartTime, setCustomStartTime] = useState('16:00');
  const [customDurationMin, setCustomDurationMin] = useState(60);
  const [bookHomeAddress, setBookHomeAddress] = useState('');
  const [bookNotes, setBookNotes] = useState('');
  const [customMeetingLink, setCustomMeetingLink] = useState('');

  // 2. Attendance Modal Form State
  const [attendanceStatus, setAttendanceStatus] = useState<'completed' | 'no_show' | 'cancelled'>('completed');
  const [attendanceNotes, setAttendanceNotes] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // 3. Reschedule Modal Form State
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('16:00');

  // 4. Cancel Modal Form State
  const [cancelReason, setCancelReason] = useState('');

  // 5. Add Slot Form State (Owner only)
  const [newSlotDate, setNewSlotDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [newSlotStartTime, setNewSlotStartTime] = useState('10:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('11:00');
  const [newSlotMode, setNewSlotMode] = useState<'online' | 'home' | 'both'>('online');

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    showToast({ message: msg, type: 'success' });
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
    showToast({ message: msg, type: 'error' });
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const loadAllData = useCallback(() => {
    const bList = EYTService.getBookings();
    setBookings(bList);
    setSlots(EYTService.getSlots());
    setChildren(isOwner ? EYTService.getChildren() : EYTService.getChildren(profile?.id));
    setReminders(EYTService.getReminderNotifications());
    setPricingSettings(EYTService.getPricingSettings());
    setIsLoading(false);
  }, [isOwner, profile?.id]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      loadAllData();
      // Also automatically check if any reminders need dispatching
      EYTService.checkAndDispatchReminders(48);
    }, 150);
    return () => clearTimeout(timer);
  }, [profile, loadAllData]);

  // Set default child when modal opens
  useEffect(() => {
    if (children.length > 0 && !bookChildId) {
      setBookChildId(children[0].id);
    }
  }, [children, bookChildId]);

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    if (selectedChildFilter !== 'all' && b.child_id !== selectedChildFilter) return false;
    return true;
  });

  const upcomingBookings = filteredBookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.start_time) >= new Date()
  );

  const historyBookings = filteredBookings.filter(
    (b) => b.status !== 'confirmed' || new Date(b.start_time) < new Date()
  );

  // ------------------------------------------------
  // HANDLERS
  // ------------------------------------------------
  const handleOpenBookingModal = () => {
    if (children.length === 0) {
      showError('Please enroll or add a child profile first before scheduling lessons.');
      return;
    }
    setIsBookModalOpen(true);
  };

  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookChildId) {
      showError('Please select an enrolled child profile.');
      return;
    }

    let startIso: string;
    let endIso: string;
    let usedSlotId: string | undefined = undefined;

    if (selectedSlotId !== 'custom') {
      const foundSlot = slots.find((s) => s.id === selectedSlotId);
      if (!foundSlot) {
        showError('Selected slot is no longer available.');
        return;
      }
      startIso = foundSlot.start_time;
      endIso = foundSlot.end_time;
      usedSlotId = foundSlot.id;
    } else {
      if (isOwner) {
        startIso = convertLagosTimeToUTC(customDate, customStartTime);
        const startDate = new Date(startIso);
        endIso = new Date(startDate.getTime() + customDurationMin * 60 * 1000).toISOString();
      } else {
        const startDate = new Date(`${customDate}T${customStartTime}:00`);
        if (isNaN(startDate.getTime())) {
          showError('Please select a valid date and time.');
          return;
        }
        const endDate = new Date(startDate.getTime() + customDurationMin * 60 * 1000);
        startIso = startDate.toISOString();
        endIso = endDate.toISOString();
      }
    }

    try {
      if (bookSessionType === 'trial') {
        if (EYTService.hasChildBookedTrial(bookChildId)) {
          showError('Only one trial session is permitted per child or family. This child has already booked or completed a trial session.');
          return;
        }
      }

      if (isRecurring && bookSessionType !== 'trial') {
        // Phase 2 Scope 1: Recurring weekly session booking
        const created = EYTService.createRecurringBooking({
          slotId: usedSlotId,
          childId: bookChildId,
          mode: bookMode,
          startTime: startIso,
          endTime: endIso,
          weeksCount: weeksCount,
          homeAddress: bookMode === 'home' ? bookHomeAddress : undefined,
          notes: bookNotes.trim() || undefined,
          meetingLink: bookMode === 'online' ? customMeetingLink : undefined,
          parentTimezone: userTz,
        });
        showSuccess(`Successfully scheduled recurring weekly series (${created.length} individual sessions created).`);
      } else {
        // One-off session booking (Standard or Trial)
        EYTService.createBooking({
          slotId: usedSlotId,
          childId: bookChildId,
          mode: bookMode,
          startTime: startIso,
          endTime: endIso,
          homeAddress: bookMode === 'home' ? bookHomeAddress : undefined,
          notes: bookNotes.trim() || undefined,
          meetingLink: bookMode === 'online' ? customMeetingLink : undefined,
          sessionType: bookSessionType,
          trialPrice: bookSessionType === 'trial' ? pricingSettings.trial_session_price : undefined,
          parentTimezone: userTz,
        });
        showSuccess(
          bookSessionType === 'trial'
            ? 'Diagnostic Trial Session booked and scheduled successfully!'
            : 'Tutorial session confirmed and scheduled successfully.'
        );
      }

      setIsBookModalOpen(false);
      setBookSessionType('standard');
      loadAllData();
      // Trigger automated reminders check for new booking
      EYTService.checkAndDispatchReminders(48);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to schedule booking.');
    }
  };

  // Phase 2 Scope 2: Attendance Tracking Handler
  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceBooking) return;

    try {
      EYTService.recordAttendance(attendanceBooking.id, attendanceStatus, {
        attendanceNotes: attendanceNotes.trim(),
        isBillable: isBillable,
      });
      showSuccess(`Attendance recorded as "${attendanceStatus.replace('_', ' ')}"${isBillable ? ' (Billable)' : ' (Non-billable)'}.`);
      setAttendanceBooking(null);
      loadAllData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to record attendance.');
    }
  };

  // Reschedule single booking occurrence
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleBooking) return;

    try {
      let newStartIso: string;
      if (isOwner) {
        newStartIso = convertLagosTimeToUTC(rescheduleDate, rescheduleTime);
      } else {
        const newStart = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
        if (isNaN(newStart.getTime())) {
          showError('Please choose a valid reschedule date and time.');
          return;
        }
        newStartIso = newStart.toISOString();
      }

      const durationMs =
        new Date(rescheduleBooking.end_time).getTime() - new Date(rescheduleBooking.start_time).getTime();
      const newEndIso = new Date(new Date(newStartIso).getTime() + durationMs).toISOString();

      EYTService.rescheduleBooking(rescheduleBooking.id, newStartIso, newEndIso);
      showSuccess(
        rescheduleBooking.is_recurring
          ? 'Occurrence rescheduled successfully without altering the rest of the recurring series.'
          : 'Session rescheduled successfully.'
      );
      setRescheduleBooking(null);
      loadAllData();
      EYTService.checkAndDispatchReminders(48);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reschedule.');
    }
  };

  // Cancel single booking occurrence
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelBookingTarget) return;

    try {
      EYTService.cancelBooking(cancelBookingTarget.id, cancelReason.trim());
      showSuccess(
        cancelBookingTarget.is_recurring
          ? 'Occurrence cancelled. The rest of your recurring weekly sessions remain active.'
          : 'Session cancelled successfully.'
      );
      setCancelBookingTarget(null);
      setCancelReason('');
      loadAllData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to cancel session.');
    }
  };

  // Add Availability Slot (Owner only)
  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startIso = convertLagosTimeToUTC(newSlotDate, newSlotStartTime);
      const endIso = convertLagosTimeToUTC(newSlotDate, newSlotEndTime);

      EYTService.addSlot({
        tutor_id: 'tutor-sarah-id',
        start_time: startIso,
        end_time: endIso,
        mode: newSlotMode,
      });

      showSuccess('Teaching availability slot added successfully (stored in UTC).');
      setIsAddSlotModalOpen(false);
      loadAllData();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add availability slot.');
    }
  };

  const handleDeleteSlot = (id: string) => {
    EYTService.deleteSlot(id);
    showSuccess('Availability slot removed.');
    loadAllData();
  };

  // Phase 2 Scope 3: Trigger Automated Session Reminders Check
  const handleManualTriggerReminders = () => {
    const dispatched = EYTService.checkAndDispatchReminders(48);
    loadAllData();
    if (dispatched.length > 0) {
      showSuccess(`Automated reminder emails sent to ${dispatched.length} families with upcoming sessions.`);
    } else {
      showSuccess('Upcoming session reminders are all up to date.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0FA] text-xs font-bold text-[#1E4E8C] uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#D4A017]" />
            Tutorial Calendar & Booking Engine
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E4E8C]">
            Session Schedule & Booking
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {isOwner
              ? 'Configure teaching availability, book recurring series, track attendance, and manage session records.'
              : 'Book one-off or recurring weekly sessions, access live lesson links, and review session history.'}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0FA] text-[#1E4E8C] text-[11px] font-semibold border border-blue-100">
              <Globe className="w-3.5 h-3.5 text-[#D4A017]" />
              {isOwner
                ? 'Mrs Sarah’s Lagos Timezone: WAT (UTC+1)'
                : `Times shown in your local timezone: ${tzAbbr} (${userTz})`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Child Filter */}
          {children.length > 1 && (
            <select
              value={selectedChildFilter}
              onChange={(e) => setSelectedChildFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-white text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
            >
              <option value="all">All Children ({children.length})</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Book Session Action */}
          <button
            onClick={handleOpenBookingModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-[#D4A017]" />
            Book Tutorial Session
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Schedule Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 overflow-x-auto pb-1 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'upcoming'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Upcoming Sessions ({upcomingBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'history'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
            }`}
          >
            <Clock className="w-4 h-4" />
            Attendance & History ({historyBookings.length})
          </button>

          <button
            onClick={() => setActiveTab('availability')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'availability'
                ? 'bg-[#1E4E8C] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D4A017]" />
            {isOwner ? `Teaching Slots (${slots.length})` : 'Open Availability'}
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'reminders'
                  ? 'bg-[#1E4E8C] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1E4E8C] hover:bg-[#E8F0FA]'
              }`}
            >
              <Bell className="w-4 h-4 text-[#D4A017]" />
              Automated Reminders ({reminders.length})
            </button>
          )}
        </div>

        {isOwner && activeTab === 'reminders' && (
          <button
            onClick={handleManualTriggerReminders}
            className="text-xs font-bold text-[#1E4E8C] hover:text-[#153763] bg-[#E8F0FA] px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-[#D4A017]" />
            Run Reminders Check
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: UPCOMING SESSIONS                                  */}
      {/* ========================================================= */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <Skeleton className="h-4 w-28 rounded-lg" />
                  <Skeleton className="h-6 w-48 rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#E8F0FA] flex items-center justify-center mx-auto text-[#1E4E8C]">
                <Calendar className="w-7 h-7 text-[#D4A017]" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-heading font-bold text-lg text-[#14263F]">
                  No Upcoming Sessions Scheduled
                </h3>
                <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                  {isOwner
                    ? 'There are no active upcoming tutorials scheduled. You can book on a family’s behalf or create open slots.'
                    : 'You have no tutorials on your schedule. Choose from open availability slots or book a recurring weekly slot with Mrs Sarah.'}
                </p>
              </div>
              <button
                onClick={handleOpenBookingModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all"
              >
                <PlusCircle className="w-4 h-4 text-[#D4A017]" />
                Schedule First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingBookings.map((booking) => {
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4 hover:border-[#1E4E8C]/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1E4E8C]">
                              Student: {booking.child_name || 'Child'}
                            </span>
                            {isOwner && booking.parent_name && (
                              <span className="text-[11px] text-[#6B7280]">
                                ({booking.parent_name})
                              </span>
                            )}
                          </div>

                          <h3 className="font-heading text-lg font-bold text-[#14263F] mt-1">
                            {formatDateInTimezone(booking.start_time, userTz, {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </h3>

                          <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-1">
                            <Clock className="w-3.5 h-3.5 text-[#D4A017]" />
                            <span>
                              {formatTimeInTimezone(booking.start_time, userTz)} -{' '}
                              {formatTimeInTimezone(booking.end_time, userTz)} ({tzAbbr})
                            </span>
                          </div>

                          {/* International Timezone Subtitles */}
                          {userTz !== SARAH_TIMEZONE && (
                            <div className="text-[10px] text-[#6B7280] mt-0.5 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-[#D4A017]" />
                              <span>
                                Mrs Sarah’s Lagos Time: {formatTimeInTimezone(booking.start_time, SARAH_TIMEZONE)} WAT
                              </span>
                            </div>
                          )}
                          {isOwner && booking.parent_timezone && booking.parent_timezone !== SARAH_TIMEZONE && (
                            <div className="text-[10px] text-[#1E4E8C] mt-0.5 flex items-center gap-1">
                              <Globe className="w-3 h-3 text-[#D4A017]" />
                              <span>
                                Family Local Time: {formatTimeInTimezone(booking.start_time, booking.parent_timezone)} ({getTimezoneAbbr(booking.parent_timezone)})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {booking.session_type === 'trial' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Trial Session
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                              booking.mode === 'online'
                                ? 'bg-[#E8F0FA] text-[#1E4E8C]'
                                : 'bg-[#FCFBF7] border border-amber-200 text-[#D4A017]'
                            }`}
                          >
                            {booking.mode === 'online' ? 'Online Video' : 'Home Tutorial'}
                          </span>

                          {booking.is_recurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              <Repeat className="w-3 h-3" />
                              Week {booking.recurrence_index || 1} of {booking.recurrence_total || 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mode Details */}
                      {booking.mode === 'home' && booking.home_address && (
                        <div className="text-xs text-[#6B7280] flex items-center gap-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <MapPin className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
                          <span className="truncate">{booking.home_address}</span>
                        </div>
                      )}

                      {booking.notes && (
                        <p className="text-xs text-[#6B7280] bg-[#F3F7FD] p-3 rounded-xl border border-[#E8F0FA] leading-relaxed">
                          <strong className="text-[#1E4E8C]">Learning Focus:</strong> {booking.notes}
                        </p>
                      )}

                      {/* Reminder status badge */}
                      {booking.reminder_sent_at && (
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Bell className="w-3 h-3 text-emerald-600" />
                          Automated 24h reminder sent to parent
                        </div>
                      )}
                    </div>

                    {/* Actions bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {/* Owner Attendance action */}
                        {isOwner && (
                          <button
                            onClick={() => {
                              setAttendanceBooking(booking);
                              setAttendanceStatus('completed');
                              setAttendanceNotes(booking.attendance_notes || '');
                              setIsBillable(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Record Attendance
                          </button>
                        )}

                        {/* Join Call button if online */}
                        {booking.mode === 'online' && (
                          booking.meeting_link ? (
                            <a
                              href={booking.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E4E8C] text-white font-bold hover:bg-[#153763] transition-colors shadow-2xs"
                            >
                              <Video className="w-3.5 h-3.5 text-[#D4A017]" />
                              Join Video Call
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[11px] font-medium">
                              <Video className="w-3 h-3 text-gray-400" />
                              Meeting link not yet provided
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Reschedule individual occurrence */}
                        <button
                          onClick={() => {
                            setRescheduleBooking(booking);
                            try {
                              const d = new Date(booking.start_time);
                              const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: userTz }).format(d);
                              const hm = new Intl.DateTimeFormat('en-GB', {
                                timeZone: userTz,
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              }).format(d);
                              setRescheduleDate(ymd);
                              setRescheduleTime(hm);
                            } catch {
                              setRescheduleDate(new Date(booking.start_time).toISOString().split('T')[0]);
                              setRescheduleTime('16:00');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 text-[#14263F] font-semibold text-[11px] hover:bg-gray-50 transition-colors"
                        >
                          Reschedule
                        </button>

                        {/* Cancel individual occurrence */}
                        <button
                          onClick={() => {
                            setCancelBookingTarget(booking);
                            setCancelReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 font-semibold text-[11px] hover:bg-rose-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ATTENDANCE & PAST SESSIONS HISTORY                 */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[#E5E0D8] text-xs text-[#14263F]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-[#1E4E8C] block">Attendance & Billing Tracking</span>
              <span>
                Under Mrs Sarah&apos;s tutoring policy, completed sessions and late no-shows are verified and billable for tuition invoicing.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold shrink-0">
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" /> No-Show
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <XCircle className="w-3.5 h-3.5" /> Cancelled
              </span>
            </div>
          </div>

          {historyBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <Clock className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-heading font-bold text-base text-[#14263F]">
                No Past Session History
              </h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                Completed tutorials, attendance records, and teacher lesson notes will be archived here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#14263F]">
                  <thead className="bg-[#E8F0FA] text-[#1E4E8C] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Mode / Link</th>
                      <th className="p-4">Series Type</th>
                      <th className="p-4">Attendance Status</th>
                      <th className="p-4">Teacher Feedback / Notes</th>
                      <th className="p-4">Invoicing Eligibility</th>
                      {isOwner && <th className="p-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#14263F]">
                            {formatDateInTimezone(b.start_time, userTz, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-[#6B7280]">
                            {formatTimeInTimezone(b.start_time, userTz)} ({tzAbbr})
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-[#1E4E8C]">{b.child_name || 'Student'}</span>
                          {b.parent_name && (
                            <div className="text-[10px] text-[#6B7280]">{b.parent_name}</div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="uppercase text-[10px] font-bold text-[#D4A017] block">
                            {b.mode === 'online' ? 'Online' : 'Home'}
                          </span>
                          {b.mode === 'online' && (
                            b.meeting_link ? (
                              <a
                                href={b.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#1E4E8C] hover:underline flex items-center gap-1 mt-0.5"
                              >
                                Meeting Link <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic block mt-0.5">
                                Link pending
                              </span>
                            )
                          )}
                        </td>

                        <td className="p-4">
                          {b.session_type === 'trial' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Trial Session
                            </span>
                          ) : b.is_recurring ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                              <Repeat className="w-3 h-3" />
                              Week {b.recurrence_index || 1} of {b.recurrence_total || 4}
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B7280]">One-off</span>
                          )}
                        </td>

                        <td className="p-4">
                          {b.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                          {b.status === 'no_show' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              No-Show
                            </span>
                          )}
                          {b.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                              <XCircle className="w-3 h-3" />
                              Cancelled
                            </span>
                          )}
                        </td>

                        <td className="p-4 max-w-xs text-xs text-[#6B7280]">
                          {b.attendance_notes ? (
                            <span className="text-[#14263F] italic">&ldquo;{b.attendance_notes}&rdquo;</span>
                          ) : (
                            b.notes || '—'
                          )}
                        </td>

                        <td className="p-4">
                          {b.is_billable ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Billable</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                              Non-Billable
                            </span>
                          )}
                        </td>

                        {isOwner && (
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setAttendanceBooking(b);
                                setAttendanceStatus(
                                  b.status === 'completed' || b.status === 'no_show' || b.status === 'cancelled'
                                    ? b.status
                                    : 'completed'
                                );
                                setAttendanceNotes(b.attendance_notes || '');
                                setIsBillable(Boolean(b.is_billable));
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#E8F0FA] text-[#1E4E8C] hover:bg-[#d8e6f7] transition-colors"
                            >
                              Update Status
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AVAILABILITY SLOTS MANAGEMENT                      */}
      {/* ========================================================= */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                {isOwner ? 'Mrs Sarah’s Teaching Hours & Open Slots' : 'Available Booking Slots'}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                {isOwner
                  ? 'Set open online and home tutorial windows for parents to reserve in real time.'
                  : 'Browse open tutorial slots. You can reserve any slot as a one-off session or weekly recurring slot.'}
              </p>
            </div>

            {isOwner && (
              <button
                onClick={() => setIsAddSlotModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-all shadow-xs shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                Add Teaching Slot
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slots.map((slot) => {
              return (
                <div
                  key={slot.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                    slot.is_booked
                      ? 'border-gray-200 bg-gray-50/50 opacity-80'
                      : 'border-[#C7DAF3] hover:border-[#1E4E8C] shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F0FA] text-[#1E4E8C]">
                        {slot.mode === 'both' ? 'Online or Home' : slot.mode === 'online' ? 'Online Video' : 'Home Tutorial'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          slot.is_booked ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {slot.is_booked ? 'Booked' : 'Available'}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-[#14263F]">
                      {formatDateInTimezone(slot.start_time, userTz, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </h4>

                    <div className="text-xs text-[#6B7280] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D4A017]" />
                      <span>
                        {formatTimeInTimezone(slot.start_time, userTz)} -{' '}
                        {formatTimeInTimezone(slot.end_time, userTz)} ({tzAbbr})
                      </span>
                    </div>

                    {userTz !== SARAH_TIMEZONE && (
                      <div className="text-[10px] text-[#6B7280] flex items-center gap-1 pt-0.5">
                        <Globe className="w-3 h-3 text-[#D4A017]" />
                        <span>Mrs Sarah’s Time: {formatTimeInTimezone(slot.start_time, SARAH_TIMEZONE)} WAT</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    {!slot.is_booked ? (
                      <button
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setBookMode(slot.mode === 'home' ? 'home' : 'online');
                          setIsBookModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-colors text-center"
                      >
                        Reserve Slot
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 font-medium italic">Reserved</span>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="ml-2 p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: AUTOMATED SESSION REMINDERS AUDIT (OWNER ONLY)      */}
      {/* ========================================================= */}
      {isOwner && activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FCFBF7] rounded-2xl border border-[#E5E0D8] text-xs text-[#14263F]/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-[#1E4E8C] block">Automated Pre-Session Reminder Service</span>
              <span>
                System scans confirmed upcoming sessions and automatically delivers reminder emails to parents 24–48 hours before class.
              </span>
            </div>
            <button
              onClick={handleManualTriggerReminders}
              className="px-4 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shrink-0 shadow-xs"
            >
              Scan & Dispatch Reminders Now
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <Bell className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-heading font-bold text-base text-[#14263F]">
                No Reminders Dispatched Yet
              </h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                Automated reminder emails sent ahead of confirmed tutorial sessions will be logged here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#14263F]">
                  <thead className="bg-[#E8F0FA] text-[#1E4E8C] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Sent At</th>
                      <th className="p-4">Recipient</th>
                      <th className="p-4">Student</th>
                      <th className="p-4">Lesson Schedule</th>
                      <th className="p-4">Mode / Call Link</th>
                      <th className="p-4">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reminders.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-[#6B7280]">
                          {formatDateTimeInTimezone(r.sent_at, SARAH_TIMEZONE)} WAT
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#14263F]">{r.recipient_name}</div>
                          <div className="text-[11px] text-[#6B7280]">{r.recipient_email}</div>
                          {r.recipient_timezone && (
                            <span className="text-[10px] text-blue-600">({r.recipient_timezone})</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-[#1E4E8C]">
                          {r.child_name}
                        </td>
                        <td className="p-4">
                          <div>
                            {formatDateInTimezone(r.start_time, SARAH_TIMEZONE, {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                          <div className="text-[11px] text-[#6B7280]">
                            {formatTimeInTimezone(r.start_time, SARAH_TIMEZONE)} WAT
                          </div>
                          {r.recipient_timezone && r.recipient_timezone !== SARAH_TIMEZONE && (
                            <div className="text-[10px] text-[#1E4E8C] mt-0.5 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5 text-[#D4A017]" />
                              <span>Parent: {formatTimeInTimezone(r.start_time, r.recipient_timezone)} {getTimezoneAbbr(r.recipient_timezone)}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="uppercase text-[10px] font-bold text-[#D4A017] block">
                            {r.mode}
                          </span>
                          {r.meeting_link && (
                            <span className="text-[10px] text-[#1E4E8C] truncate block max-w-xs">
                              {r.meeting_link}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: BOOK TUTORIAL SESSION (Single & Recurring)        */}
      {/* ========================================================= */}
      <AnimatedModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <div className="p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-heading font-bold text-xl text-[#1E4E8C]">
                Book Tutorial Session
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Schedule one-off sessions or recurring weekly slots with Mrs Sarah.
              </p>
            </div>
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4 text-xs">
              {/* Child selector */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Enrolled Student *
                </label>
                <select
                  required
                  value={bookChildId}
                  onChange={(e) => setBookChildId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Age {c.age_years || '—'}) {c.parent_name ? `• Parent: ${c.parent_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Type (Standard vs Trial) */}
              {(pricingSettings.trial_session_enabled || isOwner) && (
                <div>
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Session Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookSessionType('standard')}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                        bookSessionType === 'standard'
                          ? 'bg-[#1E4E8C] text-white border-[#1E4E8C] shadow-xs'
                          : 'bg-white text-[#14263F] border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#D4A017]" />
                      Standard Session
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBookSessionType('trial');
                        setIsRecurring(false);
                      }}
                      className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                        bookSessionType === 'trial'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-[#14263F] border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Trial Session {pricingSettings.trial_session_price === 0 ? '(Free)' : `(₦${Number(pricingSettings.trial_session_price).toLocaleString()})`}
                    </button>
                  </div>

                  {/* 1-Trial Limit Warning */}
                  {bookSessionType === 'trial' && EYTService.hasChildBookedTrial(bookChildId) && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Trial session limit reached:</strong> This child / family has already scheduled or completed a trial session. Strictly 1 trial session allowed per family. Please choose <strong>Standard Session</strong> to book.
                      </div>
                    </div>
                  )}

                  {bookSessionType === 'trial' && !EYTService.hasChildBookedTrial(bookChildId) && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Trial Session eligible! {pricingSettings.trial_session_price === 0 ? 'This session is complimentary (₦0).' : `Billed at introductory rate of ₦${Number(pricingSettings.trial_session_price).toLocaleString()}.`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode Selection */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Lesson Mode *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookMode('online')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      bookMode === 'online'
                        ? 'bg-[#1E4E8C] text-white border-[#1E4E8C] shadow-xs'
                        : 'bg-white text-[#14263F] border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Video className="w-4 h-4 text-[#D4A017]" />
                    Online (Google Meet)
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookMode('home')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      bookMode === 'home'
                        ? 'bg-[#1E4E8C] text-white border-[#1E4E8C] shadow-xs'
                        : 'bg-white text-[#14263F] border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[#D4A017]" />
                    Home Tutorial
                  </button>
                </div>
              </div>

              {/* Home Address if home mode */}
              {bookMode === 'home' && (
                <div>
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Home Address in Lagos *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookHomeAddress}
                    onChange={(e) => setBookHomeAddress(e.target.value)}
                    placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />
                </div>
              )}

              {/* Online Meeting Link */}
              {bookMode === 'online' && (
                <div>
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Google Meet Meeting URL
                  </label>
                  <input
                    type="url"
                    value={customMeetingLink}
                    onChange={(e) => setCustomMeetingLink(e.target.value)}
                    placeholder="e.g. https://meet.google.com/abc-defg-hij (optional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />
                </div>
              )}

              {/* RECURRING TOGGLE (Phase 2 Scope 1) - Only for standard sessions */}
              {bookSessionType !== 'trial' && (
                <div className="p-4 rounded-2xl bg-[#FCFBF7] border border-[#F3E7C4] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-[#D4A017]" />
                      <span className="font-bold text-[#14263F]">Repeat Booking (Weekly Recurring Slot)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#1E4E8C] focus:ring-[#1E4E8C]"
                    />
                  </div>

                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    Book this weekly time slot on an ongoing basis. This creates <strong>individual session records</strong> under the hood, so each week can still be individually rescheduled, cancelled, or marked attended.
                  </p>

                  {isRecurring && (
                    <div className="pt-2 flex items-center gap-3">
                      <span className="font-semibold text-[#14263F]">Duration:</span>
                      {[4, 8, 12].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setWeeksCount(w)}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                            weeksCount === w
                              ? 'bg-[#1E4E8C] text-white'
                              : 'bg-white text-[#14263F] border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {w} Weeks
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Slot Selector: Choose from open slots or Custom */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Availability Slot
                </label>
                <select
                  value={selectedSlotId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSlotId(val);
                    if (val !== 'custom') {
                      const s = slots.find((item) => item.id === val);
                      if (s) {
                        setBookMode(s.mode === 'home' ? 'home' : 'online');
                      }
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                >
                  <option value="custom">-- Custom Date & Time --</option>
                  {slots
                    .filter((s) => !s.is_booked || s.id === selectedSlotId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {formatDateInTimezone(s.start_time, userTz, {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        at {formatTimeInTimezone(s.start_time, userTz)} ({tzAbbr}) •{' '}
                        {s.mode === 'both' ? 'Online / Home' : s.mode === 'online' ? 'Online' : 'Home'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Dual-Time Preview when an existing slot is selected */}
              {selectedSlotId !== 'custom' && (() => {
                const s = slots.find((item) => item.id === selectedSlotId);
                if (!s) return null;
                const dual = formatDualTimePreview(s.start_time, userTz);
                return (
                  <div className="p-3.5 rounded-2xl bg-[#F3F7FD] border border-[#C7DAF3] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1E4E8C] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#D4A017]" />
                        Timezone Schedule Preview
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">UTC: {new Date(s.start_time).toISOString().substring(11, 16)}Z</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[10px] text-[#6B7280] block font-bold uppercase">Mrs Sarah’s Time</span>
                        <span className="font-bold text-[#14263F] text-sm">{dual.sarahTime}</span>
                        <span className="text-[10px] text-gray-400 block">WAT (Lagos, UTC+1)</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 block font-bold uppercase">In Your Local Time</span>
                        <span className="font-bold text-emerald-900 text-sm">{dual.parentTime}</span>
                        <span className="text-[10px] text-emerald-600 block">{userTz} ({tzAbbr})</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#4A5568] italic">{dual.explanation}</p>
                  </div>
                );
              })()}

              {/* Date & Time Selection (for Custom) */}
              {selectedSlotId === 'custom' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        {isRecurring ? 'First Session Date *' : 'Session Date *'}
                      </label>
                      <input
                        type="date"
                        required
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                        Start Time ({tzAbbr}) *
                      </label>
                      <input
                        type="time"
                        required
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                      Duration (Minutes)
                    </label>
                    <select
                      value={customDurationMin}
                      onChange={(e) => setCustomDurationMin(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                    >
                      <option value={45}>45 Minutes (Early Montessori)</option>
                      <option value={60}>60 Minutes (Standard Tutorial)</option>
                      <option value={90}>90 Minutes (Intensive / Primary Transition)</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-[#6B7280]">
                    {isOwner
                      ? 'Times are configured in Lagos time (WAT • UTC+1).'
                      : `Entered in your local timezone (${tzAbbr}). Will be stored in UTC internally.`}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Learning Focus / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bookNotes}
                  onChange={(e) => setBookNotes(e.target.value)}
                  placeholder="e.g. Focus on phonics blending and fine motor pincer grip activities"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookSessionType === 'trial' && EYTService.hasChildBookedTrial(bookChildId)}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs ${
                    bookSessionType === 'trial' && EYTService.hasChildBookedTrial(bookChildId)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : bookSessionType === 'trial'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#1E4E8C] hover:bg-[#153763]'
                  }`}
                >
                  {bookSessionType === 'trial'
                    ? 'Confirm Diagnostic Trial Session'
                    : isRecurring
                    ? `Confirm ${weeksCount}-Week Recurring Series`
                    : 'Confirm Booking'}
                </button>
              </div>
            </form>
        </div>
      </AnimatedModal>

      {/* ========================================================= */}
      {/* MODAL 2: ATTENDANCE TRACKING (Owner Only)                  */}
      {/* ========================================================= */}
      <AnimatedModal
        isOpen={!!attendanceBooking}
        onClose={() => setAttendanceBooking(null)}
        maxWidth="max-w-md"
      >
        {attendanceBooking && (
          <div className="p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Record Session Attendance
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {attendanceBooking.child_name} •{' '}
                  {formatDateInTimezone(attendanceBooking.start_time, userTz, {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <button
                onClick={() => setAttendanceBooking(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAttendanceSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-2">
                  Session Attendance Outcome *
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      attendanceStatus === 'completed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Attended & Completed</span>
                    </div>
                    <input
                      type="radio"
                      name="attendance"
                      value="completed"
                      checked={attendanceStatus === 'completed'}
                      onChange={() => {
                        setAttendanceStatus('completed');
                        setIsBillable(true);
                      }}
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      attendanceStatus === 'no_show'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span>Student No-Show (Missed without notice)</span>
                        <span className="block text-[10px] font-normal text-amber-700">
                          Billable under 24-hour notice policy
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="attendance"
                      value="no_show"
                      checked={attendanceStatus === 'no_show'}
                      onChange={() => {
                        setAttendanceStatus('no_show');
                        setIsBillable(true);
                      }}
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      attendanceStatus === 'cancelled'
                        ? 'bg-gray-100 border-gray-300 text-gray-900 font-bold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-gray-500" />
                      <span>Cancelled Session</span>
                    </div>
                    <input
                      type="radio"
                      name="attendance"
                      value="cancelled"
                      checked={attendanceStatus === 'cancelled'}
                      onChange={() => {
                        setAttendanceStatus('cancelled');
                        setIsBillable(false);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Billable Toggle (Configurable per Phase 2 Scope 2) */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#14263F] block">Eligible for Invoicing</span>
                  <span className="text-[11px] text-[#6B7280]">
                    {isBillable ? 'Session fee will be included on tuition invoice' : 'Session is waived / non-billable'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#1E4E8C] focus:ring-[#1E4E8C]"
                />
              </div>

              {/* Teacher Observation Notes */}
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Teacher Notes / Observation
                </label>
                <textarea
                  rows={3}
                  value={attendanceNotes}
                  onChange={(e) => setAttendanceNotes(e.target.value)}
                  placeholder="e.g. Excellent focus on letter sounds 's' and 'a'. Child completed tactile sandpaper tracing."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#1E4E8C] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAttendanceBooking(null)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shadow-xs"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatedModal>

      {/* ========================================================= */}
      {/* MODAL 3: RESCHEDULE OCCURRENCE                            */}
      {/* ========================================================= */}
      <AnimatedModal
        isOpen={!!rescheduleBooking}
        onClose={() => setRescheduleBooking(null)}
        maxWidth="max-w-md"
      >
        {rescheduleBooking && (
          <div className="p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Reschedule Session Occurrence
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {rescheduleBooking.is_recurring
                    ? 'Only this occurrence will change. Other sessions in the weekly series remain unaffected.'
                    : 'Select a new date and time.'}
                </p>
              </div>
              <button
                onClick={() => setRescheduleBooking(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    New Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    New Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-[#1E4E8C] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#D4A017] shrink-0" />
                <span>Automated reminder email will be reset to 24h before this new time.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRescheduleBooking(null)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1E4E8C] text-white font-bold text-xs hover:bg-[#153763] transition-all shadow-xs"
                >
                  Confirm New Date
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatedModal>

      {/* ========================================================= */}
      {/* MODAL 4: CANCEL OCCURRENCE                                */}
      {/* ========================================================= */}
      <AnimatedModal
        isOpen={!!cancelBookingTarget}
        onClose={() => setCancelBookingTarget(null)}
        maxWidth="max-w-md"
      >
        {cancelBookingTarget && (
          <div className="p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-rose-700">
                  Cancel Tutorial Session
                </h3>
                <p className="text-xs text-[#6B7280]">
                  {cancelBookingTarget.child_name} •{' '}
                  {formatDateInTimezone(cancelBookingTarget.start_time, userTz, {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
              <button
                onClick={() => setCancelBookingTarget(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 text-xs leading-relaxed space-y-1">
                <p className="font-bold">24-Hour Notice Policy:</p>
                <p>
                  Per our tutoring policy, session cancellations require at least 24 hours&apos; advance notice. If part of a weekly recurring series, only this single session is cancelled.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Reason for Cancellation (Optional)
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Family travel, child unwell"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCancelBookingTarget(null)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700"
                >
                  Keep Session
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all shadow-xs"
                >
                  Cancel This Session
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatedModal>

      {/* ========================================================= */}
      {/* MODAL 5: ADD TEACHING SLOT (Owner Only)                   */}
      {/* ========================================================= */}
      <AnimatedModal
        isOpen={isAddSlotModalOpen}
        onClose={() => setIsAddSlotModalOpen(false)}
        maxWidth="max-w-md"
      >
        <div className="p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1E4E8C]">
                  Add Teaching Availability Slot
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Define hours in Mrs Sarah’s Lagos time (WAT • UTC+1). Slots are stored in UTC internally and automatically converted for international parents.
                </p>
              </div>
              <button
                onClick={() => setIsAddSlotModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSlotSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Date (WAT Lagos) *
                </label>
                <input
                  type="date"
                  required
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    Start Time (WAT) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newSlotStartTime}
                    onChange={(e) => setNewSlotStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                    End Time (WAT) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newSlotEndTime}
                    onChange={(e) => setNewSlotEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#14263F] uppercase tracking-wider mb-1">
                  Applicable Mode *
                </label>
                <select
                  value={newSlotMode}
                  onChange={(e) => setNewSlotMode(e.target.value as 'online' | 'home' | 'both')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#14263F] focus:ring-2 focus:ring-[#1E4E8C] outline-none"
                >
                  <option value="online">Online Video Tutorial Only</option>
                  <option value="home">Home Tutorial Only</option>
                  <option value="both">Both (Parent Chooses Online or Home)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4A017] text-white font-bold text-xs hover:bg-[#A9790A] transition-all shadow-xs"
                >
                  Save Availability Slot
                </button>
              </div>
            </form>
        </div>
      </AnimatedModal>
    </div>
  );
}
