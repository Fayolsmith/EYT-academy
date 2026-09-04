-- Mrs Sarah Early Years Tutoring Platform Database Schema & RLS Policies
-- Compatible with Supabase Postgres

-- 1. Create Enums / Type Definitions
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'tutor', 'parent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lesson_mode AS ENUM ('online', 'home');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE milestone_status AS ENUM ('not_started', 'in_progress', 'achieved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subject_area_type AS ENUM ('literacy', 'numeracy', 'practical_life', 'cultural', 'arts');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('owner', 'tutor', 'parent')),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tutors Table
CREATE TABLE IF NOT EXISTS public.tutors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    credentials TEXT,
    headline TEXT DEFAULT 'Early Years Teacher (Montessori Trained | SEN-Inclusive)',
    hourly_rate NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Children Table
CREATE TABLE IF NOT EXISTS public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date_of_birth DATE,
    age_years INT,
    notes TEXT,
    learning_goals TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Availability Slots Table
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('online', 'home', 'both')),
    is_booked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id UUID REFERENCES public.availability_slots(id) ON DELETE SET NULL,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('online', 'home')),
    meeting_link TEXT,
    home_address TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Session Notes Table
CREATE TABLE IF NOT EXISTS public.session_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    skills_covered JSONB DEFAULT '[]'::jsonb,
    homework_assigned TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Milestones Table (Standard Montessori curriculum items)
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    subject_area TEXT NOT NULL CHECK (subject_area IN ('literacy', 'numeracy', 'practical_life', 'cultural', 'arts')),
    target_age_group TEXT, -- e.g. '3-4', '4-5', '5-6', '6-8'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Child Milestones Table
CREATE TABLE IF NOT EXISTS public.child_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'achieved')),
    date_achieved TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(child_id, milestone_id)
);

-- 10. Resources Table (Learning materials & worksheets)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    subject_area TEXT CHECK (subject_area IN ('literacy', 'numeracy', 'practical_life', 'cultural', 'arts', 'general')),
    age_range TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Resource Assignments Table
CREATE TABLE IF NOT EXISTS public.resource_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(resource_id, child_id)
);

-- 12. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Invoices Table (manual payment marking ready for Paystack)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'NGN',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'cancelled')),
    payment_method TEXT NOT NULL DEFAULT 'manual',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Enquiries Table (public submission from contact form)
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    child_age TEXT,
    preferred_mode TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------
-- HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------

-- Function to get current user's profile role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'
    );
$$;

-- Function to check if user is tutor or owner
CREATE OR REPLACE FUNCTION public.is_tutor_or_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'tutor')
    );
$$;

-- ----------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ----------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------

-- Profiles
CREATE POLICY "Public can view tutor profiles" ON public.profiles
    FOR SELECT USING (role = 'owner' OR role = 'tutor');

CREATE POLICY "Users can view own profile or owner can view all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_owner());

CREATE POLICY "Users can insert own profile on signup" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile, owner can update all" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_owner());

-- Tutors
CREATE POLICY "Anyone can view tutor details" ON public.tutors
    FOR SELECT USING (true);

CREATE POLICY "Owner can manage tutors" ON public.tutors
    FOR ALL USING (public.is_owner());

-- Children
CREATE POLICY "Parents view own children, tutors/owner view relevant children" ON public.children
    FOR SELECT USING (
        parent_profile_id = auth.uid() 
        OR public.is_tutor_or_owner()
    );

CREATE POLICY "Parents can insert own children" ON public.children
    FOR INSERT WITH CHECK (
        parent_profile_id = auth.uid() OR public.is_owner()
    );

CREATE POLICY "Parents update own children, owner can update any" ON public.children
    FOR UPDATE USING (
        parent_profile_id = auth.uid() OR public.is_owner()
    );

CREATE POLICY "Parents delete own children, owner can delete any" ON public.children
    FOR DELETE USING (
        parent_profile_id = auth.uid() OR public.is_owner()
    );

-- Availability Slots
CREATE POLICY "Anyone authenticated can view open availability slots" ON public.availability_slots
    FOR SELECT USING (true);

CREATE POLICY "Tutors & owner can manage availability slots" ON public.availability_slots
    FOR ALL USING (public.is_tutor_or_owner());

-- Bookings
CREATE POLICY "Parents see own child bookings, tutors/owner see assigned bookings" ON public.bookings
    FOR SELECT USING (
        public.is_owner() 
        OR tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid())
        OR child_id IN (SELECT id FROM public.children WHERE parent_profile_id = auth.uid())
    );

CREATE POLICY "Parents can create bookings for own children" ON public.bookings
    FOR INSERT WITH CHECK (
        public.is_owner()
        OR child_id IN (SELECT id FROM public.children WHERE parent_profile_id = auth.uid())
    );

CREATE POLICY "Parents can cancel own bookings, tutors/owner can update" ON public.bookings
    FOR UPDATE USING (
        public.is_owner()
        OR tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid())
        OR child_id IN (SELECT id FROM public.children WHERE parent_profile_id = auth.uid())
    );

-- Session Notes
CREATE POLICY "Parents view notes for own children, tutors/owner view own" ON public.session_notes
    FOR SELECT USING (
        public.is_owner()
        OR tutor_id IN (SELECT id FROM public.tutors WHERE profile_id = auth.uid())
        OR child_id IN (SELECT id FROM public.children WHERE parent_profile_id = auth.uid())
    );

CREATE POLICY "Tutors and owner can create/update session notes" ON public.session_notes
    FOR ALL USING (public.is_tutor_or_owner());

-- Milestones (Curriculum items)
CREATE POLICY "Authenticated users can read milestones" ON public.milestones
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Owner/Tutors can manage milestones" ON public.milestones
    FOR ALL USING (public.is_tutor_or_owner());

-- Child Milestones
CREATE POLICY "Parents view own child milestones, tutors/owner view all" ON public.child_milestones
    FOR SELECT USING (
        public.is_tutor_or_owner()
        OR child_id IN (SELECT id FROM public.children WHERE parent_profile_id = auth.uid())
    );

CREATE POLICY "Tutors & owner can update child milestones" ON public.child_milestones
    FOR ALL USING (public.is_tutor_or_owner());

-- Resources
CREATE POLICY "Authenticated users view resources" ON public.resources
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Tutors and owner manage resources" ON public.resources
    FOR ALL USING (public.is_tutor_or_owner());

-- Resource Assignments
CREATE POLICY "Parents view assignments for own children, tutors view all" ON public.resource_assignments
    FOR SELECT USING (
        public.is_tutor_or_owner()
        OR child_id IN (SELECT id FROM public.children WHERE parent_profile_id = auth.uid())
    );

CREATE POLICY "Tutors and owner manage resource assignments" ON public.resource_assignments
    FOR ALL USING (public.is_tutor_or_owner());

-- Messages
CREATE POLICY "Users view messages sent to or from them" ON public.messages
    FOR SELECT USING (
        sender_profile_id = auth.uid() 
        OR recipient_profile_id = auth.uid() 
        OR public.is_owner()
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_profile_id = auth.uid()
    );

-- Invoices
CREATE POLICY "Parents view own invoices, owner views all" ON public.invoices
    FOR SELECT USING (
        parent_profile_id = auth.uid() OR public.is_owner()
    );

CREATE POLICY "Owner manages invoices" ON public.invoices
    FOR ALL USING (public.is_owner());

-- Enquiries (Public form submission!)
CREATE POLICY "Anyone can submit enquiry" ON public.enquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner and tutors can view/manage enquiries" ON public.enquiries
    FOR ALL USING (public.is_tutor_or_owner());

-- ----------------------------------------------------
-- AUTOMATIC PROFILE TRIGGER ON USER SIGNUP
-- ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    default_role TEXT := 'parent';
BEGIN
    -- Check if this is the owner email
    IF NEW.email IN ('sarahoakhena@gmail.com', 'sarahofure45@gmail.com') THEN
        default_role := 'owner';
    END IF;

    INSERT INTO public.profiles (id, role, full_name, email, phone)
    VALUES (
        NEW.id,
        default_role,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- If user is owner, ensure a tutor record exists
    IF default_role = 'owner' THEN
        INSERT INTO public.tutors (profile_id, bio, credentials, headline)
        VALUES (
            NEW.id,
            'Passionate Montessori-trained Early Years Teacher dedicated to nurturing young minds and building bright futures.',
            'Montessori Trained, SEN-Inclusive, British Curriculum Specialist',
            'Mrs Sarah — Early Years Tutor (Montessori Trained | SEN-Inclusive)'
        )
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------
-- SEED FOUNDATIONAL MONTESSORI MILESTONES
-- ----------------------------------------------------
INSERT INTO public.milestones (name, description, subject_area, target_age_group) VALUES
-- Literacy
('Letter Sounds Recognition (Phase 1/2)', 'Recognises individual letter sounds (s, a, t, p, i, n)', 'literacy', '3-4'),
('Blending CVC Words', 'Can blend sounds to read simple 3-letter words (cat, dog, pin)', 'literacy', '4-5'),
('High-Frequency Sight Words', 'Reads 20+ common sight words (the, to, and, he, she, no, go)', 'literacy', '4-6'),
('Phonics Digraphs (sh, ch, th, ng)', 'Identifies consonant digraphs in spoken and written words', 'literacy', '5-6'),
('Independent Sentence Reading', 'Reads short emergent storybooks with comprehension', 'literacy', '5-7'),
('Early Handwriting & Letter Formation', 'Writes letters with correct pencil grip and orientation', 'literacy', '4-6'),

-- Numeracy
('Number Recognition 1 to 10', 'Recognises and names numerals from 1 to 10', 'numeracy', '3-4'),
('One-to-One Counting', 'Accurately counts up to 20 concrete items', 'numeracy', '3-5'),
('Number Recognition 11 to 50', 'Identifies two-digit numerals and understanding place value', 'numeracy', '4-6'),
('Basic Addition with Manipulatives', 'Combines two groups of objects to find total up to 10', 'numeracy', '4-6'),
('Simple Subtraction Concepts', 'Takes away objects to find remainder up to 10', 'numeracy', '4-6'),
('2D & 3D Shape & Pattern Recognition', 'Names shapes and continues repeating patterns (AB, AABB)', 'numeracy', '3-5'),

-- Practical Life
('Fine Motor: Pincer Grip Control', 'Manipulates small pegs, tweezers, threading beads with precision', 'practical_life', '3-4'),
('Independent Dressing & Fastenings', 'Manages buttons, zips, and self-shoes independently', 'practical_life', '3-5'),
('Work Area Care & Packing Away', 'Takes pride in returning learning materials to designated places', 'practical_life', '3-6'),
('Sustained Focus & Task Completion', 'Maintains concentration on a chosen task for 15-20 minutes', 'practical_life', '4-6'),

-- Cultural & General Knowledge
('Four Seasons & Weather Observations', 'Understands changes in weather and seasonal characteristics', 'cultural', '3-5'),
('Living vs Non-Living Things', 'Distinguishes between animals/plants and inanimate objects', 'cultural', '4-6'),
('Continents, Flags & World Cultures', 'Explores simple geography and cultural diversity appreciation', 'cultural', '5-7'),
('Animal Habitats & Life Cycles', 'Identifies animal groups and life cycles (frog, butterfly)', 'cultural', '4-6'),

-- Arts & Creative Expression
('Color Blending & Primary Colors', 'Knows primary colors and experiments with mixing secondary colors', 'arts', '3-5'),
('Scissor Skills & Paper Crafting', 'Cuts along straight, curved, and zigzag lines safely', 'arts', '3-5'),
('Expressive Storytelling & Roleplay', 'Uses props and imagination to re-tell stories with expression', 'arts', '4-7'),
('Rhythm, Rhyme & Singing', 'Claps syllables, memorises nursery rhymes and sings in rhythm', 'arts', '3-5')
ON CONFLICT DO NOTHING;
