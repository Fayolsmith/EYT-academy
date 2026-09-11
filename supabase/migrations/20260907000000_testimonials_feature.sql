-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Parent Testimonials & Moderation Feature
-- Adds: testimonials table, display_name_choice enum, testimonial_status enum, RLS policies, indexes

-- 1. Create enums if not exists
DO $$ BEGIN
    CREATE TYPE testimonial_status AS ENUM ('pending', 'published', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE testimonial_display_name_choice AS ENUM ('full_name', 'first_name_last_initial', 'anonymous');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    body_text TEXT NOT NULL,
    display_name_choice public.testimonial_display_name_choice NOT NULL DEFAULT 'first_name_last_initial',
    status public.testimonial_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_parent_id ON public.testimonials(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_child_id ON public.testimonials(child_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_submitted_at ON public.testimonials(submitted_at DESC);

-- 4. Row Level Security (RLS)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Owner policies: full access to view and moderate testimonials
CREATE POLICY "Owner can view all testimonials"
    ON public.testimonials
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'owner'
        )
    );

CREATE POLICY "Owner can update testimonial status and review notes"
    ON public.testimonials
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'owner'
        )
    );

-- Parent policies: can insert own testimonials
CREATE POLICY "Parents can create testimonials"
    ON public.testimonials
    FOR INSERT
    TO authenticated
    WITH CHECK (
        parent_profile_id = auth.uid()
    );

-- Parents can view only their own testimonials (including status and review feedback)
CREATE POLICY "Parents can view their own testimonials"
    ON public.testimonials
    FOR SELECT
    TO authenticated
    USING (
        parent_profile_id = auth.uid()
    );

-- Public can view ONLY published testimonials
CREATE POLICY "Public can view published testimonials"
    ON public.testimonials
    FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published'
    );
