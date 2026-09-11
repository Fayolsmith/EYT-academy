-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Public Trust, Visible Pricing & Trial Session Feature
-- Adds: pricing_settings table, session_type and trial_price on bookings & invoices

-- 1. Create pricing_settings table
CREATE TABLE IF NOT EXISTS public.pricing_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    online_session_rate TEXT,
    home_session_rate TEXT,
    monthly_package_rate TEXT,
    currency TEXT DEFAULT '₦',
    trial_session_enabled BOOLEAN NOT NULL DEFAULT false,
    trial_session_price NUMERIC NOT NULL DEFAULT 0,
    trial_session_description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default row if not exists
INSERT INTO public.pricing_settings (
    id,
    online_session_rate,
    home_session_rate,
    monthly_package_rate,
    currency,
    trial_session_enabled,
    trial_session_price,
    trial_session_description
) VALUES (
    'default',
    '₦15,000',
    '₦25,000',
    'Custom monthly packages available',
    '₦',
    false,
    0,
    '1-on-1 Montessori Diagnostic & Learning Style Evaluation'
) ON CONFLICT (id) DO NOTHING;

-- 2. Add columns to bookings
ALTER TABLE IF EXISTS public.bookings
    ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS trial_price NUMERIC;

-- Add constraint for session_type
DO $$ BEGIN
    ALTER TABLE public.bookings
        ADD CONSTRAINT check_bookings_session_type
        CHECK (session_type IN ('standard', 'trial'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add column to invoices
ALTER TABLE IF EXISTS public.invoices
    ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'standard';

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_child_session_type ON public.bookings(child_id, session_type);

-- 5. Row Level Security (RLS) for pricing_settings
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view pricing settings"
    ON public.pricing_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Owner can manage pricing settings"
    ON public.pricing_settings
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
