-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Practice Disengagement Alerts
-- Flags enrolled children with 5+ consecutive days of zero Child Mode activity
-- Includes anti-spam streak_anchor_date to avoid repeated alerts for the same quiet streak

CREATE TABLE IF NOT EXISTS public.practice_disengagement_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    parent_name TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    days_inactive INT NOT NULL,
    last_active_date DATE,
    streak_anchor_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'dismissed')),
    alerted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    CONSTRAINT uq_practice_alert_child_streak UNIQUE (child_id, streak_anchor_date)
);

CREATE INDEX IF NOT EXISTS idx_practice_alerts_status ON public.practice_disengagement_alerts(status);
CREATE INDEX IF NOT EXISTS idx_practice_alerts_child ON public.practice_disengagement_alerts(child_id);

ALTER TABLE public.practice_disengagement_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner and tutors can view and manage practice alerts"
    ON public.practice_disengagement_alerts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('owner', 'tutor')
        )
        OR auth.jwt() ->> 'role' = 'service_role'
    );
