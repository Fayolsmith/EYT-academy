import { createClient } from '@supabase/supabase-js';

// Load .env.local if present
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch {
  // Ignore if file doesn't exist or already loaded
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PRIVATE_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[SECURITY ERROR]: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env.local or environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function findOrCreateUser(email, password, userMetadata) {
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (listError) throw listError;

  const existing = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    console.log(`User ${email} exists (${existing.id}), updating...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: userMetadata,
      email_confirm: true
    });
    if (updateError) throw updateError;
    return updated.user;
  }

  console.log(`Creating user ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: userMetadata
  });
  if (error) throw error;
  return data.user;
}

async function seed() {
  console.log('--- Seeding Staging Supabase Database ---');

  // 1. Owner & Parents
  const ownerUser = await findOrCreateUser(
    'sarahoakhena@gmail.com',
    'SarahReview2026!',
    { full_name: 'Mrs Sarah Oakhena', role: 'owner', phone: '09133651659' }
  );
  console.log('Owner user ID:', ownerUser.id);

  const parent1User = await findOrCreateUser(
    'elizabeth@example.com',
    'ParentReview2026!',
    { full_name: 'Mrs Elizabeth Adeleke', role: 'parent', phone: '08012345678' }
  );
  console.log('Parent 1 user ID:', parent1User.id);

  const parent2User = await findOrCreateUser(
    'omolara@example.com',
    'ParentReview2026!',
    { full_name: 'Mrs Omolara Bamidele', role: 'parent', phone: '08098765432' }
  );
  console.log('Parent 2 user ID:', parent2User.id);

  // 2. Profiles
  await supabase.from('profiles').upsert({
    id: ownerUser.id,
    role: 'owner',
    full_name: 'Mrs Sarah Oakhena',
    email: 'sarahoakhena@gmail.com',
    phone: '09133651659'
  });

  await supabase.from('profiles').upsert({
    id: parent1User.id,
    role: 'parent',
    full_name: 'Mrs Elizabeth Adeleke',
    email: 'elizabeth@example.com',
    phone: '08012345678'
  });

  await supabase.from('profiles').upsert({
    id: parent2User.id,
    role: 'parent',
    full_name: 'Mrs Omolara Bamidele',
    email: 'omolara@example.com',
    phone: '08098765432'
  });

  // 3. Find Tutor ID for Owner
  const { data: tutorRow, error: tutorFetchErr } = await supabase
    .from('tutors')
    .select('id')
    .eq('profile_id', ownerUser.id)
    .single();

  let tutorId;
  if (tutorRow) {
    tutorId = tutorRow.id;
    await supabase.from('tutors').update({
      headline: 'Early Years Teacher (Montessori Trained | SEN-Inclusive)',
      bio: 'Montessori-trained early years tutor specialising in ages 3–8. Focusing on phonics, early reading, numeracy, and fine motor skills in a nurturing, child-led environment.',
      credentials: 'Montessori Early Childhood Diploma | Certified SEN Specialist',
      hourly_rate: 15000.00
    }).eq('id', tutorId);
  } else {
    const { data: newTutor } = await supabase.from('tutors').insert({
      profile_id: ownerUser.id,
      headline: 'Early Years Teacher (Montessori Trained | SEN-Inclusive)',
      bio: 'Montessori-trained early years tutor specialising in ages 3–8. Focusing on phonics, early reading, numeracy, and fine motor skills in a nurturing, child-led environment.',
      credentials: 'Montessori Early Childhood Diploma | Certified SEN Specialist',
      hourly_rate: 15000.00
    }).select('id').single();
    tutorId = newTutor?.id;
  }
  console.log('Tutor ID:', tutorId);

  // 4. Children
  const childrenData = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      parent_profile_id: parent1User.id,
      name: 'Leo Adeleke',
      date_of_birth: '2021-04-12',
      notes: 'Montessori literacy and numeracy focus. Working on CVC phonics.'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      parent_profile_id: parent1User.id,
      name: 'Amara Adeleke',
      date_of_birth: '2022-08-20',
      notes: 'Early phonics, tactile sound tracing, sound canisters.'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      parent_profile_id: parent2User.id,
      name: 'Felix Okon',
      date_of_birth: '2020-01-15',
      notes: 'Year 1 transition prep, addition concepts.'
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      parent_profile_id: parent2User.id,
      name: 'Ayomide Bamidele',
      date_of_birth: '2022-11-05',
      notes: 'Toddler to primary transition, fine motor skills.'
    }
  ];

  for (const child of childrenData) {
    const { error } = await supabase.from('children').upsert(child);
    if (error) console.error(`Child upsert error for ${child.name}:`, error.message);
  }
  console.log('Seeded 4 demo children successfully');

  // 5. Resources
  const resourcesData = [
    {
      id: 'aaaaaaaa-1111-1111-1111-111111111111',
      tutor_id: tutorId,
      title: 'Montessori Sandpaper Letter Sound Guide (PDF)',
      description: 'Home guide for phoneme articulation and tactile tracing.',
      file_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      file_type: 'pdf',
      subject_area: 'literacy',
      age_range: '3-5'
    },
    {
      id: 'bbbbbbbb-2222-2222-2222-222222222222',
      tutor_id: tutorId,
      title: 'CVC Word Family Reading Sliders',
      description: 'Printable word cards for -at, -an, -op, -ig families.',
      file_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      file_type: 'pdf',
      subject_area: 'literacy',
      age_range: '4-6'
    },
    {
      id: 'cccccccc-3333-3333-3333-333333333333',
      tutor_id: tutorId,
      title: 'Early Numeracy Bead Stair & Counting Cards',
      description: 'Visual quantity recognition and numeral association worksheets.',
      file_url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
      file_type: 'pdf',
      subject_area: 'numeracy',
      age_range: '3-6'
    }
  ];

  for (const r of resourcesData) {
    const { error } = await supabase.from('resources').upsert(r);
    if (error) console.error(`Resource upsert error for ${r.title}:`, error.message);
  }
  console.log('Seeded demo learning resources');

  // 6. Bookings
  const bookingsData = [
    {
      id: 'dddddddd-1111-1111-1111-111111111111',
      tutor_id: tutorId,
      child_id: '11111111-1111-1111-1111-111111111111', // Leo
      start_time: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
      end_time: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 5 * 3600 * 1000).toISOString(),
      mode: 'home',
      status: 'confirmed',
      is_billable: true
    },
    {
      id: 'dddddddd-2222-2222-2222-222222222222',
      tutor_id: tutorId,
      child_id: '11111111-1111-1111-1111-111111111111', // Leo
      start_time: new Date(Date.now() + 9 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
      end_time: new Date(Date.now() + 9 * 24 * 3600 * 1000 + 5 * 3600 * 1000).toISOString(),
      mode: 'home',
      status: 'confirmed',
      is_billable: true
    },
    {
      id: 'dddddddd-3333-3333-3333-333333333333',
      tutor_id: tutorId,
      child_id: '22222222-2222-2222-2222-222222222222', // Amara
      start_time: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 2 * 3600 * 1000).toISOString(),
      end_time: new Date(Date.now() + 3 * 24 * 3600 * 1000 + 3 * 3600 * 1000).toISOString(),
      mode: 'online',
      status: 'confirmed',
      is_billable: true
    },
    {
      id: 'dddddddd-4444-4444-4444-444444444444',
      tutor_id: tutorId,
      child_id: '11111111-1111-1111-1111-111111111111', // Leo
      start_time: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
      end_time: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 5 * 3600 * 1000).toISOString(),
      mode: 'home',
      status: 'completed',
      is_billable: true
    }
  ];

  for (const b of bookingsData) {
    const { error } = await supabase.from('bookings').upsert(b);
    if (error) console.error(`Booking upsert error:`, error.message);
  }
  console.log('Seeded demo bookings');

  // 7. Assignments
  const assignmentsData = [
    {
      id: 'eeeeeeee-1111-1111-1111-111111111111',
      tutor_id: ownerUser.id,
      child_id: '11111111-1111-1111-1111-111111111111', // Leo
      title: 'Montessori Scissor Cutting Strips Practice',
      description: 'Please encourage Leo to practice cutting along the solid straight and zigzag lines on the printed strips. Emphasize thumb-up grip on safety scissors to develop hand strength for writing.',
      materials_needed: 'Child safety scissors, printed cutting strips, small waste basket',
      due_date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'assigned'
    },
    {
      id: 'eeeeeeee-2222-2222-2222-222222222222',
      tutor_id: ownerUser.id,
      child_id: '11111111-1111-1111-1111-111111111111', // Leo
      title: 'CVC Sandpaper Tracing & Phonics Sound Hunt',
      description: 'Find 3 objects around the home that start with the /s/ sound and trace the letter "s" on the tactile card with index and middle fingers.',
      materials_needed: 'Montessori sandpaper letter cards (or rough paper card), 3 small household objects',
      due_date: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'submitted'
    },
    {
      id: 'eeeeeeee-3333-3333-3333-333333333333',
      tutor_id: ownerUser.id,
      child_id: '22222222-2222-2222-2222-222222222222', // Amara
      title: 'Sound Shakers & Auditory Discrimination',
      description: 'Pair two matching sound canisters (rice vs dry beans) by listening carefully to the shakes.',
      materials_needed: '2 opaque spice bottles or small tubs, dry rice, dried beans',
      due_date: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'assigned'
    }
  ];

  for (const a of assignmentsData) {
    const { error } = await supabase.from('assignments').upsert(a);
    if (error) console.error(`Assignment upsert error:`, error.message);
  }
  console.log('Seeded demo assignments');

  // 8. Assignment Submissions
  const submissionData = {
    id: 'ffffffff-2222-2222-2222-222222222222',
    assignment_id: 'eeeeeeee-2222-2222-2222-222222222222',
    submitted_by_profile_id: parent1User.id,
    submission_note: 'Leo found a spoon, a sock, and a sponge! He traced the /s/ card 4 times with two fingers.',
    submission_photo_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    submitted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    tutor_feedback: null,
    reviewed_at: null,
    milestone_marked_achieved: false
  };

  const { error: subErr } = await supabase.from('assignment_submissions').upsert(submissionData);
  if (subErr) console.error('Submission upsert error:', subErr.message);
  else console.log('Seeded demo assignment submission');

  // 9. Invoices
  const invoicesData = [
    {
      id: '12121212-1111-1111-1111-111111111111',
      parent_profile_id: parent1User.id,
      invoice_number: 'INV-2026-001',
      amount: 15000.00,
      currency: 'NGN',
      description: 'Completed 1:1 Early Years Literacy Session (Leo Adeleke)',
      status: 'paid',
      payment_method: 'manual',
      due_date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      paid_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: '12121212-2222-2222-2222-222222222222',
      parent_profile_id: parent1User.id,
      invoice_number: 'INV-2026-002',
      amount: 15000.00,
      currency: 'NGN',
      description: 'Upcoming 1:1 Early Years Literacy & Numeracy Session (Leo Adeleke)',
      status: 'unpaid',
      payment_method: 'manual',
      due_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      paid_at: null
    }
  ];

  for (const inv of invoicesData) {
    const { error } = await supabase.from('invoices').upsert(inv);
    if (error) console.error(`Invoice upsert error:`, error.message);
  }
  console.log('Seeded demo invoices');

  console.log('--- Staging Database Seed Complete Successfully! ---');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
