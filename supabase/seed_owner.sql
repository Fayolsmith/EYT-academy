-- ==============================================================================
-- Mrs Sarah Early Years Tutoring Platform
-- Owner Account Provisioning Script (supabase/seed_owner.sql)
-- ==============================================================================
-- This script provisions or promotes Mrs Sarah's account as 'owner' of the platform.
--
-- RECOMMENDED METHOD (Supabase Dashboard):
-- 1. Go to your Supabase Project Dashboard -> Authentication -> Users.
-- 2. Click "Add user" -> "Create user".
--    Email: sarahoakhena@gmail.com (or your desired email)
--    Password: [Set a secure password]
--    Auto Confirm User: Checked (Yes)
-- 3. Open Supabase SQL Editor and run Part 1 below.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: Promote an Existing Auth User to 'owner' and Setup Tutor Profile
-- (Run this after creating the user in the Supabase Auth Dashboard)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    target_email TEXT := 'sarahoakhena@gmail.com'; -- Replace if using another email
    user_id UUID;
BEGIN
    -- 1. Locate the user in auth.users
    SELECT id INTO user_id FROM auth.users WHERE email = target_email LIMIT 1;

    IF user_id IS NULL THEN
        RAISE NOTICE 'No user found with email %. If you have not created the auth user yet, see Part 2 below.', target_email;
    ELSE
        -- 2. Upsert profile with 'owner' role
        INSERT INTO public.profiles (id, role, full_name, email, phone, avatar_url, updated_at)
        VALUES (
            user_id,
            'owner',
            'Mrs Sarah Oakhena',
            target_email,
            '09133651659',
            NULL,
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'owner',
            full_name = 'Mrs Sarah Oakhena',
            email = EXCLUDED.email,
            phone = '09133651659',
            updated_at = now();

        -- 3. Ensure a corresponding tutor record exists for booking & slots
        INSERT INTO public.tutors (profile_id, headline, bio, credentials, hourly_rate)
        VALUES (
            user_id,
            'Early Years Teacher (Montessori Trained | SEN-Inclusive)',
            'Montessori-trained early years tutor specialising in ages 3–8. Focusing on phonics, early reading, numeracy, and fine motor skills in a nurturing, child-led environment.',
            'Montessori Early Childhood Diploma | Certified SEN Specialist',
            0.00
        )
        ON CONFLICT (profile_id) DO UPDATE SET
            headline = EXCLUDED.headline,
            bio = EXCLUDED.bio,
            credentials = EXCLUDED.credentials;

        RAISE NOTICE 'Successfully provisioned Mrs Sarah (%) as OWNER and TUTOR.', target_email;
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- PART 2 (Alternative): Pure SQL One-Shot Creation (Auth + Profile + Tutor)
-- (Use this only if you want to bypass the Auth Dashboard UI completely)
-- ------------------------------------------------------------------------------
/*
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    target_email TEXT := 'sarahoakhena@gmail.com';
    temp_password TEXT := 'ChangeThisPassword2026!'; -- Change immediately upon first login!
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = target_email) THEN
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
            new_user_id,
            '00000000-0000-00-00-00-00-000000000000',
            target_email,
            crypt(temp_password, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Mrs Sarah Oakhena","role":"owner"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );

        INSERT INTO public.profiles (id, role, full_name, email, phone)
        VALUES (new_user_id, 'owner', 'Mrs Sarah Oakhena', target_email, '09133651659');

        INSERT INTO public.tutors (profile_id, headline, bio, credentials)
        VALUES (
            new_user_id,
            'Early Years Teacher (Montessori Trained | SEN-Inclusive)',
            'Montessori-trained early years tutor specialising in ages 3–8.',
            'Montessori Early Childhood Diploma | Certified SEN Specialist'
        );

        RAISE NOTICE 'Created owner user % with password %', target_email, temp_password;
    ELSE
        RAISE NOTICE 'User with email % already exists.', target_email;
    END IF;
END $$;
*/
