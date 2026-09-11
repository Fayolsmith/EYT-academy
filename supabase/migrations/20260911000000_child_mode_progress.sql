-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Child Mode Daily Progress Tracking
-- Tracks per-child, per-day pillar completion with timezone awareness

CREATE TABLE IF NOT EXISTS public.child_mode_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pillars_completed TEXT[] NOT NULL DEFAULT '{}',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_child_mode_progress_child_date UNIQUE (child_id, date)
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_child_mode_progress_child_date ON public.child_mode_progress(child_id, date);

-- Enable RLS
ALTER TABLE public.child_mode_progress ENABLE ROW LEVEL SECURITY;

-- Policies:
-- Parents can view and update their own children's progress, and tutors/owners have full visibility
CREATE POLICY "Parents can view their children's progress"
    ON public.child_mode_progress
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.children c
            WHERE c.id = child_mode_progress.child_id
            AND (c.parent_profile_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('owner', 'tutor')
        )
    );

CREATE POLICY "Parents can insert their children's progress"
    ON public.child_mode_progress
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.children c
            WHERE c.id = child_mode_progress.child_id
            AND (c.parent_profile_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('owner', 'tutor')
        )
    );

CREATE POLICY "Parents can update their children's progress"
    ON public.child_mode_progress
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.children c
            WHERE c.id = child_mode_progress.child_id
            AND (c.parent_profile_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('owner', 'tutor')
        )
    );
