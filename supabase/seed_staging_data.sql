-- Mrs Sarah Early Years Tutoring Platform
-- Staging Seed Script: Owner, Parent, Children, and Demo Records

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    owner_id UUID;
    parent_id UUID;
    child_leo_id UUID := '11111111-1111-1111-1111-111111111111';
    child_amara_id UUID := '22222222-2222-2222-2222-222222222222';
    child_felix_id UUID := '33333333-3333-3333-3333-333333333333';
    child_ayomide_id UUID := '44444444-4444-4444-4444-444444444444';
    owner_email TEXT := 'sarahoakhena@gmail.com';
    owner_pass TEXT := 'SarahReview2026!';
    parent_email TEXT := 'elizabeth@example.com';
    parent_pass TEXT := 'ParentReview2026!';
BEGIN
    -- 1. Create/Ensure Owner in auth.users
    SELECT id INTO owner_id FROM auth.users WHERE email = owner_email LIMIT 1;
    IF owner_id IS NULL THEN
        owner_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            owner_id,
            '00000000-0000-00-00-00-00-000000000000',
            owner_email,
            crypt(owner_pass, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Mrs Sarah Oakhena","role":"owner"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = crypt(owner_pass, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = '{"full_name":"Mrs Sarah Oakhena","role":"owner"}'
        WHERE id = owner_id;
    END IF;

    -- Ensure Owner profile
    INSERT INTO public.profiles (id, role, full_name, email, phone)
    VALUES (owner_id, 'owner', 'Mrs Sarah Oakhena', owner_email, '09133651659')
    ON CONFLICT (id) DO UPDATE SET
        role = 'owner',
        full_name = 'Mrs Sarah Oakhena',
        email = owner_email,
        phone = '09133651659';

    -- Ensure Tutor profile
    INSERT INTO public.tutors (profile_id, headline, bio, credentials, hourly_rate)
    VALUES (
        owner_id,
        'Early Years Teacher (Montessori Trained | SEN-Inclusive)',
        'Montessori-trained early years tutor specialising in ages 3–8. Focusing on phonics, early reading, numeracy, and fine motor skills in a nurturing, child-led environment.',
        'Montessori Early Childhood Diploma | Certified SEN Specialist',
        15000.00
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        credentials = EXCLUDED.credentials,
        hourly_rate = EXCLUDED.hourly_rate;

    -- 2. Create/Ensure Parent in auth.users
    SELECT id INTO parent_id FROM auth.users WHERE email = parent_email LIMIT 1;
    IF parent_id IS NULL THEN
        parent_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            parent_id,
            '00000000-0000-00-00-00-00-000000000000',
            parent_email,
            crypt(parent_pass, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Mrs Elizabeth Adeleke","role":"parent"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = crypt(parent_pass, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            raw_user_meta_data = '{"full_name":"Mrs Elizabeth Adeleke","role":"parent"}'
        WHERE id = parent_id;
    END IF;

    -- Ensure Parent profile
    INSERT INTO public.profiles (id, role, full_name, email, phone)
    VALUES (parent_id, 'parent', 'Mrs Elizabeth Adeleke', parent_email, '08012345678')
    ON CONFLICT (id) DO UPDATE SET
        role = 'parent',
        full_name = 'Mrs Elizabeth Adeleke',
        email = parent_email,
        phone = '08012345678';

    -- 3. Seed Children
    INSERT INTO public.children (id, parent_profile_id, name, date_of_birth, notes, created_at)
    VALUES
    (child_leo_id, parent_id, 'Leo Adeleke', '2021-04-12', 'Montessori literacy and numeracy focus. Working on CVC phonics.', now()),
    (child_amara_id, parent_id, 'Amara Adeleke', '2022-08-20', 'Early phonics, tactile sound tracing, sound canisters.', now()),
    (child_felix_id, NULL, 'Felix Okon', '2020-01-15', 'Year 1 transition prep, addition concepts.', now()),
    (child_ayomide_id, NULL, 'Ayomide Bamidele', '2022-11-05', 'Toddler to primary transition, fine motor skills.', now())
    ON CONFLICT (id) DO UPDATE SET
        parent_profile_id = EXCLUDED.parent_profile_id,
        name = EXCLUDED.name,
        date_of_birth = EXCLUDED.date_of_birth,
        notes = EXCLUDED.notes;

    -- 4. Seed Learning Resources
    INSERT INTO public.resources (id, tutor_id, title, description, file_url, file_type, subject_area, age_range, created_at)
    VALUES
    ('aaaaaaaa-1111-1111-1111-111111111111', owner_id, 'Montessori Sandpaper Letter Sound Guide (PDF)', 'Home guide for phoneme articulation and tactile tracing.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', 'pdf', 'literacy', '3-5', now()),
    ('bbbbbbbb-2222-2222-2222-222222222222', owner_id, 'CVC Word Family Reading Sliders', 'Printable word cards for -at, -an, -op, -ig families.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', 'pdf', 'literacy', '4-6', now()),
    ('cccccccc-3333-3333-3333-333333333333', owner_id, 'Early Numeracy Bead Stair & Counting Cards', 'Visual quantity recognition and numeral association worksheets.', 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80', 'pdf', 'numeracy', '3-6', now())
    ON CONFLICT (id) DO NOTHING;

    -- 5. Seed Bookings (Upcoming and Past)
    INSERT INTO public.bookings (id, tutor_id, child_id, start_time, end_time, mode, status, is_billable, created_at)
    VALUES
    ('dddddddd-1111-1111-1111-111111111111', owner_id, child_leo_id, now() + interval '2 days 4 hours', now() + interval '2 days 5 hours', 'home', 'confirmed', true, now()),
    ('dddddddd-2222-2222-2222-222222222222', owner_id, child_leo_id, now() + interval '9 days 4 hours', now() + interval '9 days 5 hours', 'home', 'confirmed', true, now()),
    ('dddddddd-3333-3333-3333-333333333333', owner_id, child_amara_id, now() + interval '3 days 2 hours', now() + interval '3 days 3 hours', 'online', 'confirmed', true, now()),
    ('dddddddd-4444-4444-4444-444444444444', owner_id, child_leo_id, now() - interval '5 days 4 hours', now() - interval '5 days 3 hours', 'home', 'completed', true, now())
    ON CONFLICT (id) DO NOTHING;

    -- 6. Seed Assignments
    INSERT INTO public.assignments (id, tutor_id, child_id, title, description, materials_needed, due_date, status, created_at)
    VALUES
    ('eeeeeeee-1111-1111-1111-111111111111', owner_id, child_leo_id, 'Montessori Scissor Cutting Strips Practice', 'Please encourage Leo to practice cutting along the solid straight and zigzag lines on the printed strips. Emphasize thumb-up grip on safety scissors to develop hand strength for writing.', 'Child safety scissors, printed cutting strips, small waste basket', (now() + interval '3 days')::date, 'assigned', now()),
    ('eeeeeeee-2222-2222-2222-222222222222', owner_id, child_leo_id, 'CVC Sandpaper Tracing & Phonics Sound Hunt', 'Find 3 objects around the home that start with the /s/ sound and trace the letter "s" on the tactile card with index and middle fingers.', 'Montessori sandpaper letter cards (or rough paper card), 3 small household objects', (now() + interval '1 day')::date, 'submitted', now()),
    ('eeeeeeee-3333-3333-3333-333333333333', owner_id, child_amara_id, 'Sound Shakers & Auditory Discrimination', 'Pair two matching sound canisters (rice vs dry beans) by listening carefully to the shakes.', '2 opaque spice bottles or small tubs, dry rice, dried beans', (now() + interval '4 days')::date, 'assigned', now())
    ON CONFLICT (id) DO NOTHING;

    -- 7. Seed Submission for asgn 2
    INSERT INTO public.assignment_submissions (id, assignment_id, submitted_by_profile_id, submission_note, submission_photo_url, submitted_at, tutor_feedback, reviewed_at, milestone_marked_achieved)
    VALUES
    ('ffffffff-2222-2222-2222-222222222222', 'eeeeeeee-2222-2222-2222-222222222222', parent_id, 'Leo found a spoon, a sock, and a sponge! He traced the /s/ card 4 times with two fingers.', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80', now() - interval '2 hours', NULL, NULL, false)
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Staging database seeded successfully with Owner (%), Parent (%), and demo children.', owner_email, parent_email;
END $$;
