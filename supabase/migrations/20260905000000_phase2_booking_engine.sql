-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Phase 2 Booking Engine & Availability Management
-- Adds: Recurring booking support, Attendance tracking (completed, no_show, cancelled), Billable flags, and Reminder timestamps

-- 1. Update booking_status type if needed
DO $$ BEGIN
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'no_show';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Phase 2 columns to public.bookings
ALTER TABLE IF EXISTS public.bookings
    ADD COLUMN IF NOT EXISTS recurring_group_id TEXT,
    ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
    ADD COLUMN IF NOT EXISTS recurrence_index INT,
    ADD COLUMN IF NOT EXISTS recurrence_total INT,
    ADD COLUMN IF NOT EXISTS attendance_notes TEXT,
    ADD COLUMN IF NOT EXISTS attendance_recorded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_billable BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- 3. Indexes for scheduling & recurring query optimization
CREATE INDEX IF NOT EXISTS idx_bookings_recurring_group ON public.bookings(recurring_group_id) WHERE recurring_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- 4. Session Reminders Audit Table
CREATE TABLE IF NOT EXISTS public.session_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    child_name TEXT NOT NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    mode TEXT NOT NULL,
    meeting_link TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'sent'
);

ALTER TABLE public.session_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage all session reminders"
    ON public.session_reminders
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

CREATE POLICY "Parents can view their own session reminders"
    ON public.session_reminders
    FOR SELECT
    TO authenticated
    USING (recipient_email = auth.jwt()->>'email');
