-- Storage bucket configuration for EYT Platform

-- 1. Create resources bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
CREATE POLICY "Public or Authenticated Read Resources"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resources');

CREATE POLICY "Tutors and Owner Manage Resources"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'resources' AND (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'tutor'))
));

CREATE POLICY "Public Read Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users Manage Own Avatar"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'avatars' AND (name ~ ('^' || auth.uid()::text || '/')));
