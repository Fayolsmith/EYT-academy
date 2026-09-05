-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Continuous Assessment & Assignments Feature
-- Adds: assignments, assignment_submissions, and assignment_notifications tables with RLS and foreign keys

-- 1. Create assignment_status enum if not exists
DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('assigned', 'submitted', 'reviewed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    materials_needed TEXT,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
    due_date DATE,
    status public.assignment_status NOT NULL DEFAULT 'assigned',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create assignment_submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    submitted_by_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_note TEXT NOT NULL,
    submission_photo_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    tutor_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    milestone_marked_achieved BOOLEAN NOT NULL DEFAULT false
);

-- 4. Create assignment_notifications audit table
CREATE TABLE IF NOT EXISTS public.assignment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'assignment_created' | 'assignment_submitted' | 'assignment_reviewed'
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_assignments_child_id ON public.assignments(child_id);
CREATE INDEX IF NOT EXISTS idx_assignments_milestone_id ON public.assignments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_assignments_resource_id ON public.assignments(resource_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_notifications ENABLE ROW LEVEL SECURITY;

-- Owner (Mrs Sarah) policies: full access
CREATE POLICY "Owner can manage all assignments"
    ON public.assignments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

CREATE POLICY "Owner can manage all assignment submissions"
    ON public.assignment_submissions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

CREATE POLICY "Owner can manage all assignment notifications"
    ON public.assignment_notifications
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );

-- Parent policies: strictly scoped to own children
CREATE POLICY "Parents can view assignments for their own children"
    ON public.assignments
    FOR SELECT
    TO authenticated
    USING (
        child_id IN (
            SELECT id FROM public.children
            WHERE children.parent_profile_id = auth.uid()
        )
    );

CREATE POLICY "Parents can view submissions for their own children's assignments"
    ON public.assignment_submissions
    FOR SELECT
    TO authenticated
    USING (
        assignment_id IN (
            SELECT a.id FROM public.assignments a
            JOIN public.children c ON a.child_id = c.id
            WHERE c.parent_profile_id = auth.uid()
        )
    );

CREATE POLICY "Parents can submit homework for their own children's assignments"
    ON public.assignment_submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        submitted_by_profile_id = auth.uid()
        AND assignment_id IN (
            SELECT a.id FROM public.assignments a
            JOIN public.children c ON a.child_id = c.id
            WHERE c.parent_profile_id = auth.uid()
        )
    );

CREATE POLICY "Parents can view their own assignment notifications"
    ON public.assignment_notifications
    FOR SELECT
    TO authenticated
    USING (recipient_email = auth.jwt()->>'email');
