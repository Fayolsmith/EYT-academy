-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Public Career Statistics Settings
-- Adds: public_stats_settings table for editable experience & family counts

CREATE TABLE IF NOT EXISTS public.public_stats_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    years_of_experience NUMERIC NOT NULL DEFAULT 15,
    families_served NUMERIC NOT NULL DEFAULT 100,
    core_learning_areas NUMERIC NOT NULL DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default row if not exists
INSERT INTO public.public_stats_settings (
    id,
    years_of_experience,
    families_served,
    core_learning_areas
) VALUES (
    'default',
    15,
    100,
    5
) ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE public.public_stats_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public career stats"
    ON public.public_stats_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Owner can update public career stats"
    ON public.public_stats_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'owner'
        )
    );
