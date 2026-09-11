-- Mrs Sarah Early Years Tutoring Platform
-- Migration: Currency & Timezone Internationalization
-- Adds: secondary pricing fields to pricing_settings, timezone to profiles, and invoice currency constraint

-- 1. Add secondary currency rates to pricing_settings
ALTER TABLE IF EXISTS public.pricing_settings
    ADD COLUMN IF NOT EXISTS secondary_currency TEXT,
    ADD COLUMN IF NOT EXISTS online_session_secondary_rate TEXT,
    ADD COLUMN IF NOT EXISTS home_session_secondary_rate TEXT;

-- 2. Add timezone column to profiles (defaults to Africa/Lagos)
ALTER TABLE IF EXISTS public.profiles
    ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Lagos';

-- 3. Add check constraint for invoice currency
DO $$ BEGIN
    ALTER TABLE public.invoices
        ADD CONSTRAINT check_invoices_currency
        CHECK (currency IN ('NGN', 'GBP', 'EUR', 'USD'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
