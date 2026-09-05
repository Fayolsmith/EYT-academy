// Mrs Sarah Early Years Tutoring Platform Data Service
// Seamlessly connects to Supabase when configured, or provides local persistent storage for instant demo/testing

import { createSPAClient } from '@/lib/supabase/client';
import { UserRole, LessonMode, BookingStatus, MilestoneStatus, SubjectArea, InvoiceStatus, EnquiryStatus } from '@/lib/types';
export type { UserRole, LessonMode, BookingStatus, MilestoneStatus, SubjectArea, InvoiceStatus, EnquiryStatus };

export interface Child {
  id: string;
  parent_profile_id: string;
  name: string;
  date_of_birth: string | null;
  age_years: number | null;
  notes: string | null;
  learning_goals: string | null;
  parent_name?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
  has_portal_account?: boolean;
  avatar_url?: string | null;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  tutor_id: string;
  start_time: string;
  end_time: string;
  mode: 'online' | 'home' | 'both';
  is_booked: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  slot_id: string | null;
  child_id: string;
  tutor_id: string;
  mode: LessonMode;
  meeting_link: string | null;
  home_address: string | null;
  status: BookingStatus;
  start_time: string;
  end_time: string;
  notes: string | null;
  created_at: string;
  child_name?: string;
  parent_name?: string;
  parent_email?: string;
  parent_profile_id?: string;
  // Phase 2 scope additions:
  recurring_group_id?: string | null;
  is_recurring?: boolean;
  recurrence_rule?: string | null; // e.g. 'weekly'
  recurrence_index?: number | null; // e.g. 1
  recurrence_total?: number | null; // e.g. 4
  attendance_notes?: string | null;
  attendance_recorded_at?: string | null;
  is_billable?: boolean;
  reminder_sent_at?: string | null;
}

export interface SessionReminderNotification {
  id: string;
  booking_id: string;
  recipient_email: string;
  recipient_name: string;
  child_name: string;
  start_time: string;
  end_time: string;
  mode: LessonMode;
  meeting_link: string | null;
  home_address: string | null;
  sent_at: string;
  status: 'sent' | 'delivered';
}

export interface SessionNote {
  id: string;
  booking_id: string;
  tutor_id: string;
  child_id: string;
  notes: string;
  skills_covered: string[];
  homework_assigned: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string | null;
  subject_area: SubjectArea;
  target_age_group: string | null;
  created_at: string;
}

export interface ChildMilestone {
  id: string;
  child_id: string;
  milestone_id: string;
  status: MilestoneStatus;
  date_achieved: string | null;
  notes: string | null;
  milestone?: Milestone;
}

export interface Resource {
  id: string;
  tutor_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
  subject_area: string | null;
  age_range: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_profile_id: string;
  recipient_profile_id: string;
  sender_name?: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  parent_profile_id: string;
  parent_name?: string;
  child_id?: string | null;
  child_name?: string | null;
  invoice_number: string;
  amount: number;
  currency: string;
  description: string | null;
  status: InvoiceStatus;
  payment_method: string;
  payment_proof_url?: string | null;
  payment_proof_name?: string | null;
  payment_proof_uploaded_at?: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  contact: string;
  child_age: string | null;
  preferred_mode: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string;
  avatar_url: string | null;
  parental_consent_given?: boolean;
  parental_consent_at?: string | null;
  parental_consent_version?: string | null;
}

export interface EnquiryEmailNotification {
  id: string;
  enquiry_id: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: 'delivered' | 'sent';
  details: {
    parent_name: string;
    contact: string;
    child_age?: string | null;
    preferred_mode?: string | null;
    message: string;
  };
}

export interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  instructions: string;
  whatsapp_number: string;
  business_email: string;
  business_phone?: string;
}

export const DEFAULT_BANK_DETAILS: BankDetails = {
  bank_name: 'Guaranty Trust Bank (GTBank)',
  account_name: 'Sarah Adeleke / EYT Academy',
  account_number: '0123456789',
  instructions: 'Please transfer tutorial fees directly to Mrs Sarah’s designated account. After payment, click Upload Proof on your invoice below or send via WhatsApp.',
  whatsapp_number: '09133651659',
  business_email: 'sarahoakhena@gmail.com',
  business_phone: '09133651659',
};

export interface ChildNotificationPreference {
  session_reminders: boolean;
  milestone_updates: boolean;
}

export interface NotificationPreferences {
  email_reminders: boolean;
  session_reminders: boolean;
  invoice_alerts: boolean;
  milestone_updates: boolean;
  child_notifications?: Record<string, ChildNotificationPreference>;
  per_child_reminders?: Record<string, boolean>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_reminders: true,
  session_reminders: true,
  invoice_alerts: true,
  milestone_updates: true,
  child_notifications: {},
  per_child_reminders: {},
};

// Initial default seed data
const DEFAULT_MILESTONES: Milestone[] = [
  // Literacy
  { id: 'm-lit-1', name: 'Letter Sounds Recognition (Phase 1/2)', description: 'Recognises individual letter sounds (s, a, t, p, i, n)', subject_area: 'literacy', target_age_group: '3-4', created_at: new Date().toISOString() },
  { id: 'm-lit-2', name: 'Blending CVC Words', description: 'Can blend sounds to read simple 3-letter words (cat, dog, pin)', subject_area: 'literacy', target_age_group: '4-5', created_at: new Date().toISOString() },
  { id: 'm-lit-3', name: 'High-Frequency Sight Words', description: 'Reads 20+ common sight words (the, to, and, he, she, no, go)', subject_area: 'literacy', target_age_group: '4-6', created_at: new Date().toISOString() },
  { id: 'm-lit-4', name: 'Phonics Digraphs (sh, ch, th, ng)', description: 'Identifies consonant digraphs in spoken and written words', subject_area: 'literacy', target_age_group: '5-6', created_at: new Date().toISOString() },
  { id: 'm-lit-5', name: 'Early Handwriting & Letter Formation', description: 'Writes letters with correct pencil grip and orientation', subject_area: 'literacy', target_age_group: '4-6', created_at: new Date().toISOString() },
  // Numeracy
  { id: 'm-num-1', name: 'Number Recognition 1 to 10', description: 'Recognises and names numerals from 1 to 10', subject_area: 'numeracy', target_age_group: '3-4', created_at: new Date().toISOString() },
  { id: 'm-num-2', name: 'One-to-One Counting', description: 'Accurately counts up to 20 concrete items', subject_area: 'numeracy', target_age_group: '3-5', created_at: new Date().toISOString() },
  { id: 'm-num-3', name: 'Basic Addition with Manipulatives', description: 'Combines two groups of objects to find total up to 10', subject_area: 'numeracy', target_age_group: '4-6', created_at: new Date().toISOString() },
  { id: 'm-num-4', name: 'Simple Subtraction Concepts', description: 'Takes away objects to find remainder up to 10', subject_area: 'numeracy', target_age_group: '4-6', created_at: new Date().toISOString() },
  { id: 'm-num-5', name: '2D & 3D Shape & Pattern Recognition', description: 'Names shapes and continues repeating patterns (AB, AABB)', subject_area: 'numeracy', target_age_group: '3-5', created_at: new Date().toISOString() },
  // Practical Life
  { id: 'm-prac-1', name: 'Fine Motor: Pincer Grip Control', description: 'Manipulates small pegs, tweezers, threading beads with precision', subject_area: 'practical_life', target_age_group: '3-4', created_at: new Date().toISOString() },
  { id: 'm-prac-2', name: 'Independent Dressing & Fastenings', description: 'Manages buttons, zips, and self-shoes independently', subject_area: 'practical_life', target_age_group: '3-5', created_at: new Date().toISOString() },
  { id: 'm-prac-3', name: 'Work Area Care & Packing Away', description: 'Takes pride in returning learning materials to designated places', subject_area: 'practical_life', target_age_group: '3-6', created_at: new Date().toISOString() },
  { id: 'm-prac-4', name: 'Sustained Focus & Task Completion', description: 'Maintains concentration on a chosen task for 15-20 minutes', subject_area: 'practical_life', target_age_group: '4-6', created_at: new Date().toISOString() },
  // Cultural
  { id: 'm-cul-1', name: 'Four Seasons & Weather Observations', description: 'Understands changes in weather and seasonal characteristics', subject_area: 'cultural', target_age_group: '3-5', created_at: new Date().toISOString() },
  { id: 'm-cul-2', name: 'Living vs Non-Living Things', description: 'Distinguishes between animals/plants and inanimate objects', subject_area: 'cultural', target_age_group: '4-6', created_at: new Date().toISOString() },
  { id: 'm-cul-3', name: 'Animal Habitats & Life Cycles', description: 'Identifies animal groups and life cycles (frog, butterfly)', subject_area: 'cultural', target_age_group: '4-6', created_at: new Date().toISOString() },
  // Arts
  { id: 'm-art-1', name: 'Color Blending & Primary Colors', description: 'Knows primary colors and experiments with mixing secondary colors', subject_area: 'arts', target_age_group: '3-5', created_at: new Date().toISOString() },
  { id: 'm-art-2', name: 'Scissor Skills & Paper Crafting', description: 'Cuts along straight, curved, and zigzag lines safely', subject_area: 'arts', target_age_group: '3-5', created_at: new Date().toISOString() },
  { id: 'm-art-3', name: 'Expressive Storytelling & Roleplay', description: 'Uses props and imagination to re-tell stories with expression', subject_area: 'arts', target_age_group: '4-7', created_at: new Date().toISOString() },
];

const DEFAULT_SARAH_PROFILE: UserProfile = {
  id: 'sarah-owner-id',
  role: 'owner',
  full_name: 'Mrs Sarah Oakhena',
  phone: '09133651659',
  email: 'sarahoakhena@gmail.com',
  avatar_url: '/images/flyer1.jpeg',
};

const DEFAULT_PARENT_PROFILE: UserProfile = {
  id: 'parent-demo-id',
  role: 'parent',
  full_name: 'Mrs Elizabeth Adeleke',
  phone: '08023456789',
  email: 'elizabeth@example.com',
  avatar_url: null,
  parental_consent_given: true,
  parental_consent_at: '2026-09-01T08:00:00.000Z',
  parental_consent_version: '2026-v1',
};

const DEFAULT_CHILDREN: Child[] = [
  {
    id: 'child-1',
    parent_profile_id: 'parent-demo-id',
    name: 'Leo Adeleke',
    date_of_birth: '2021-04-12',
    age_years: 5,
    notes: 'Very energetic, loves Montessori sensory math beads and hands-on building blocks.',
    learning_goals: 'Master CVC blending and phonics digraphs (sh, ch).',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_phone: '08023456789',
    has_portal_account: true,
    avatar_url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=300&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'child-2',
    parent_profile_id: 'parent-demo-id',
    name: 'Amara Adeleke',
    date_of_birth: '2023-01-18',
    age_years: 3,
    notes: 'Gentle learner, developing pincer grip and starting sound recognition.',
    learning_goals: 'Letter sounds Phase 1 and counting objects 1-10.',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_phone: '08023456789',
    has_portal_account: true,
    avatar_url: 'https://images.unsplash.com/photo-1595454223600-91fb57cb2e1e?auto=format&fit=crop&w=300&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'child-3',
    parent_profile_id: 'unclaimed-uche@example.com',
    name: 'Tobi Balogun',
    date_of_birth: '2020-09-10',
    age_years: 6,
    notes: 'Transitioning to Primary 1, focuses on reading comprehension and mental maths.',
    learning_goals: 'Phonics digraphs, CVC fluency, and addition within 20.',
    parent_name: 'Mr Uche Balogun',
    parent_email: 'uche@example.com',
    parent_phone: '08098765432',
    has_portal_account: false,
    avatar_url: null,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_SLOTS: AvailabilitySlot[] = [
  {
    id: 'slot-1',
    tutor_id: 'tutor-sarah-id',
    start_time: new Date(Date.now() + 86400000 * 1 + 3600000 * 9).toISOString(), // Tomorrow 9am
    end_time: new Date(Date.now() + 86400000 * 1 + 3600000 * 10).toISOString(),
    mode: 'online',
    is_booked: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'slot-2',
    tutor_id: 'tutor-sarah-id',
    start_time: new Date(Date.now() + 86400000 * 1 + 3600000 * 11).toISOString(), // Tomorrow 11am
    end_time: new Date(Date.now() + 86400000 * 1 + 3600000 * 12).toISOString(),
    mode: 'home',
    is_booked: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'slot-3',
    tutor_id: 'tutor-sarah-id',
    start_time: new Date(Date.now() + 86400000 * 2 + 3600000 * 14).toISOString(), // 2 days 2pm
    end_time: new Date(Date.now() + 86400000 * 2 + 3600000 * 15).toISOString(),
    mode: 'online',
    is_booked: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'slot-4',
    tutor_id: 'tutor-sarah-id',
    start_time: new Date(Date.now() + 86400000 * 3 + 3600000 * 10).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 3 + 3600000 * 11).toISOString(),
    mode: 'both',
    is_booked: false,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'book-1',
    slot_id: 'slot-1',
    child_id: 'child-1',
    tutor_id: 'tutor-sarah-id',
    mode: 'online',
    meeting_link: 'https://meet.google.com/abc-montessori-session',
    home_address: null,
    status: 'confirmed',
    start_time: new Date(Date.now() + 86400000 * 1 + 3600000 * 9).toISOString(),
    end_time: new Date(Date.now() + 86400000 * 1 + 3600000 * 10).toISOString(),
    notes: 'Focus on CVC word blending and tactile sandpaper letters.',
    created_at: new Date().toISOString(),
    child_name: 'Leo Adeleke',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_profile_id: 'parent-demo-id',
    is_recurring: false,
    is_billable: true,
  },
  {
    id: 'book-rec-1',
    slot_id: null,
    child_id: 'child-1',
    tutor_id: 'tutor-sarah-id',
    mode: 'online',
    meeting_link: 'https://meet.google.com/sarah-tuesday-series',
    home_address: null,
    status: 'completed',
    start_time: new Date(Date.now() - 86400000 * 7 + 3600000 * 16).toISOString(), // 1 week ago
    end_time: new Date(Date.now() - 86400000 * 7 + 3600000 * 17).toISOString(),
    notes: 'Weekly Tuesday Tutoring Slot (Week 1 of 4)',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    child_name: 'Leo Adeleke',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_profile_id: 'parent-demo-id',
    recurring_group_id: 'rec-group-tue-4pm',
    is_recurring: true,
    recurrence_rule: 'weekly',
    recurrence_index: 1,
    recurrence_total: 4,
    attendance_notes: 'Attended & completed on time. Demonstrated mastery in vowel blending cards.',
    attendance_recorded_at: new Date(Date.now() - 86400000 * 7 + 3600000 * 18).toISOString(),
    is_billable: true,
  },
  {
    id: 'book-rec-2',
    slot_id: null,
    child_id: 'child-1',
    tutor_id: 'tutor-sarah-id',
    mode: 'online',
    meeting_link: 'https://meet.google.com/sarah-tuesday-series',
    home_address: null,
    status: 'confirmed',
    start_time: new Date(Date.now() + 86400000 * 2 + 3600000 * 16).toISOString(), // In 2 days
    end_time: new Date(Date.now() + 86400000 * 2 + 3600000 * 17).toISOString(),
    notes: 'Weekly Tuesday Tutoring Slot (Week 2 of 4)',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    child_name: 'Leo Adeleke',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_profile_id: 'parent-demo-id',
    recurring_group_id: 'rec-group-tue-4pm',
    is_recurring: true,
    recurrence_rule: 'weekly',
    recurrence_index: 2,
    recurrence_total: 4,
    is_billable: true,
  },
  {
    id: 'book-rec-3',
    slot_id: null,
    child_id: 'child-1',
    tutor_id: 'tutor-sarah-id',
    mode: 'online',
    meeting_link: 'https://meet.google.com/sarah-tuesday-series',
    home_address: null,
    status: 'confirmed',
    start_time: new Date(Date.now() + 86400000 * 9 + 3600000 * 16).toISOString(), // In 9 days
    end_time: new Date(Date.now() + 86400000 * 9 + 3600000 * 17).toISOString(),
    notes: 'Weekly Tuesday Tutoring Slot (Week 3 of 4)',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    child_name: 'Leo Adeleke',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_profile_id: 'parent-demo-id',
    recurring_group_id: 'rec-group-tue-4pm',
    is_recurring: true,
    recurrence_rule: 'weekly',
    recurrence_index: 3,
    recurrence_total: 4,
    is_billable: true,
  },
  {
    id: 'book-rec-4',
    slot_id: null,
    child_id: 'child-1',
    tutor_id: 'tutor-sarah-id',
    mode: 'online',
    meeting_link: 'https://meet.google.com/sarah-tuesday-series',
    home_address: null,
    status: 'confirmed',
    start_time: new Date(Date.now() + 86400000 * 16 + 3600000 * 16).toISOString(), // In 16 days
    end_time: new Date(Date.now() + 86400000 * 16 + 3600000 * 17).toISOString(),
    notes: 'Weekly Tuesday Tutoring Slot (Week 4 of 4)',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    child_name: 'Leo Adeleke',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_profile_id: 'parent-demo-id',
    recurring_group_id: 'rec-group-tue-4pm',
    is_recurring: true,
    recurrence_rule: 'weekly',
    recurrence_index: 4,
    recurrence_total: 4,
    is_billable: true,
  },
  {
    id: 'book-past-noshow',
    slot_id: null,
    child_id: 'child-1',
    tutor_id: 'tutor-sarah-id',
    mode: 'online',
    meeting_link: 'https://meet.google.com/sample-room',
    home_address: null,
    status: 'no_show',
    start_time: new Date(Date.now() - 86400000 * 3 + 3600000 * 11).toISOString(),
    end_time: new Date(Date.now() - 86400000 * 3 + 3600000 * 12).toISOString(),
    notes: 'Introductory early math evaluation',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    child_name: 'Leo Adeleke',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_profile_id: 'parent-demo-id',
    attendance_notes: 'Learner did not connect to lesson call without prior notice. Marked as No-Show; billable under policy.',
    attendance_recorded_at: new Date(Date.now() - 86400000 * 3 + 3600000 * 13).toISOString(),
    is_billable: true,
  },
  {
    id: 'book-past-cancelled',
    slot_id: null,
    child_id: 'child-2',
    tutor_id: 'tutor-sarah-id',
    mode: 'home',
    meeting_link: null,
    home_address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    status: 'cancelled',
    start_time: new Date(Date.now() - 86400000 * 5 + 3600000 * 14).toISOString(),
    end_time: new Date(Date.now() - 86400000 * 5 + 3600000 * 15).toISOString(),
    notes: 'Fine motor coordination session [Cancellation: 48hr advance parent notice for family event]',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    child_name: 'Amara Adeleke',
    parent_name: 'Mrs Elizabeth Adeleke',
    parent_email: 'elizabeth@example.com',
    parent_profile_id: 'parent-demo-id',
    is_billable: false,
  },
];

const DEFAULT_CHILD_MILESTONES: ChildMilestone[] = [
  { id: 'cm-1', child_id: 'child-1', milestone_id: 'm-lit-1', status: 'achieved', date_achieved: '2026-08-20', notes: 'Knows all single letter sounds with 100% accuracy!' },
  { id: 'cm-2', child_id: 'child-1', milestone_id: 'm-lit-2', status: 'in_progress', date_achieved: null, notes: 'Blending c-a-t and d-o-g smoothly.' },
  { id: 'cm-3', child_id: 'child-1', milestone_id: 'm-num-1', status: 'achieved', date_achieved: '2026-08-15', notes: 'Quick numeral recognition.' },
  { id: 'cm-4', child_id: 'child-1', milestone_id: 'm-num-2', status: 'achieved', date_achieved: '2026-08-28', notes: 'Counts 20 counting bears.' },
  { id: 'cm-5', child_id: 'child-1', milestone_id: 'm-prac-1', status: 'achieved', date_achieved: '2026-08-10', notes: 'Excellent pincer grasp.' },
  { id: 'cm-6', child_id: 'child-2', milestone_id: 'm-lit-1', status: 'in_progress', date_achieved: null, notes: 'Recognises s, a, t.' },
  { id: 'cm-7', child_id: 'child-2', milestone_id: 'm-num-1', status: 'in_progress', date_achieved: null, notes: 'Recognises 1 to 5.' },
];

const DEFAULT_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    tutor_id: 'tutor-sarah-id',
    title: 'Montessori Sandpaper Letter Sound Guide (PDF)',
    description: 'Home guide for phoneme articulation and tactile tracing.',
    file_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    file_type: 'pdf',
    subject_area: 'literacy',
    age_range: '3-5',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-2',
    tutor_id: 'tutor-sarah-id',
    title: 'CVC Word Family Reading Sliders',
    description: 'Printable word cards for -at, -an, -op, -ig families.',
    file_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    file_type: 'pdf',
    subject_area: 'literacy',
    age_range: '4-6',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-3',
    tutor_id: 'tutor-sarah-id',
    title: 'Early Numeracy Bead Stair & Counting Cards',
    description: 'Visual quantity recognition and numeral association worksheets.',
    file_url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
    file_type: 'pdf',
    subject_area: 'numeracy',
    age_range: '3-6',
    created_at: new Date().toISOString(),
  },
  {
    id: 'res-4',
    tutor_id: 'tutor-sarah-id',
    title: 'Montessori Practical Life Routines Checklist',
    description: 'Child-led daily habits checklist for independence at home.',
    file_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    file_type: 'pdf',
    subject_area: 'practical_life',
    age_range: '3-7',
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    parent_profile_id: 'parent-demo-id',
    parent_name: 'Mrs Elizabeth Adeleke',
    child_id: 'child-1',
    child_name: 'Leo Adeleke',
    invoice_number: 'INV-2026-001',
    amount: 45000,
    currency: 'NGN',
    description: 'Term 1 Early Years Tutorial Package (4 Online Sessions)',
    status: 'paid',
    payment_method: 'manual',
    due_date: '2026-08-30',
    paid_at: '2026-08-29T14:30:00Z',
    created_at: '2026-08-25T10:00:00Z',
  },
  {
    id: 'inv-2',
    parent_profile_id: 'parent-demo-id',
    parent_name: 'Mrs Elizabeth Adeleke',
    child_id: 'child-1',
    child_name: 'Leo Adeleke',
    invoice_number: 'INV-2026-002',
    amount: 50000,
    currency: 'NGN',
    description: 'September Tutorial Package (4 Home Sessions)',
    status: 'unpaid',
    payment_method: 'manual',
    due_date: '2026-09-15',
    paid_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'inv-3',
    parent_profile_id: 'unclaimed-uche@example.com',
    parent_name: 'Mr Uche Balogun',
    child_id: 'child-3',
    child_name: 'Tobi Balogun',
    invoice_number: 'INV-2026-003',
    amount: 35000,
    currency: 'NGN',
    description: 'Primary 1 Phonics Readiness Tutorial (2 Sessions)',
    status: 'payment_submitted',
    payment_method: 'manual',
    payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    payment_proof_name: 'bank_transfer_receipt_tobi.jpg',
    payment_proof_uploaded_at: new Date().toISOString(),
    due_date: '2026-09-20',
    paid_at: null,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-1',
    name: 'Grace Omotola',
    contact: '08129876543 / grace.o@example.com',
    child_age: '4 years old',
    preferred_mode: 'home',
    message: 'Hello Mrs Sarah, my 4-year-old daughter is struggling with phonics and letter sounds in preschool. We would love home tutorials twice a week.',
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'enq-2',
    name: 'David Nwosu',
    contact: '08035551234',
    child_age: '6 years old (Primary 1)',
    preferred_mode: 'online',
    message: 'Looking for online numeracy and reading support for my son David. Please let me know your available slots.',
    status: 'contacted',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender_profile_id: 'sarah-owner-id',
    recipient_profile_id: 'parent-demo-id',
    sender_name: 'Mrs Sarah',
    body: 'Good day Mrs Adeleke! Leo made wonderful progress today with sound blending. I have uploaded new CVC flashcards in your resources tab.',
    is_read: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'msg-2',
    sender_profile_id: 'parent-demo-id',
    recipient_profile_id: 'sarah-owner-id',
    sender_name: 'Mrs Elizabeth Adeleke',
    body: 'Thank you so much Mrs Sarah! He was so excited to read the three-letter words to his dad yesterday evening.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

// Helper to access LocalStorage safely
class StorageManager {
  private isBrowser = typeof window !== 'undefined';

  get<T>(key: string, defaultVal: T): T {
    if (!this.isBrowser) return defaultVal;
    try {
      const val = localStorage.getItem(`eyt_${key}`);
      return val ? JSON.parse(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(`eyt_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  remove(key: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.removeItem(`eyt_${key}`);
    } catch (e) {
      console.warn('LocalStorage remove error', e);
    }
  }
}

const storage = new StorageManager();

// EYT Service implementation
export const EYTService = {
  // Check if real Supabase backend is configured
  isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes('placeholder') && !url.includes('YOURSUPABASE'));
  },

  // ------------------------------------------------
  // CURRENT USER / AUTH STATE
  // ------------------------------------------------
  isAuthenticated(): boolean {
    return storage.get<boolean>('is_authenticated', false);
  },

  getAuthenticatedUser(): UserProfile | null {
    if (!this.isAuthenticated()) return null;
    return storage.get<UserProfile | null>('current_user', null);
  },

  getCurrentUser(): UserProfile {
    const authUser = this.getAuthenticatedUser();
    if (authUser) return authUser;
    return DEFAULT_PARENT_PROFILE;
  },

  /**
   * Look up a registered user profile by email
   */
  findUserByEmail(email: string): UserProfile | null {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    if (normalized === DEFAULT_PARENT_PROFILE.email.toLowerCase()) {
      return DEFAULT_PARENT_PROFILE;
    }
    if (normalized === DEFAULT_SARAH_PROFILE.email.toLowerCase()) {
      return DEFAULT_SARAH_PROFILE;
    }
    const registeredUsers = storage.get<UserProfile[]>('registered_users', []);
    return registeredUsers.find((u) => u.email.toLowerCase() === normalized) || null;
  },

  saveRegisteredUser(user: UserProfile) {
    const users = storage.get<UserProfile[]>('registered_users', []);
    const idx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    storage.set('registered_users', users);
  },

  setCurrentUser(user: UserProfile) {
    storage.set('current_user', user);
    storage.set('is_authenticated', true);
    this.saveRegisteredUser(user);
    if (typeof document !== 'undefined') {
      document.cookie = 'eyt_auth=true; path=/; max-age=604800; SameSite=Lax';
    }
  },

  logout() {
    storage.remove('current_user');
    storage.set('is_authenticated', false);
    if (typeof document !== 'undefined') {
      document.cookie = 'eyt_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  },

  loginAsOwner(): UserProfile {
    this.setCurrentUser(DEFAULT_SARAH_PROFILE);
    return DEFAULT_SARAH_PROFILE;
  },

  loginAsParent(parentProfile?: UserProfile): UserProfile {
    const profile = parentProfile || DEFAULT_PARENT_PROFILE;
    this.setCurrentUser(profile);
    return profile;
  },

  switchToOwner(): UserProfile {
    return this.loginAsOwner();
  },

  switchToParent(): UserProfile {
    return this.loginAsParent();
  },

  updateProfile(data: {
    full_name?: string;
    email?: string;
    phone?: string | null;
    avatar_url?: string | null;
    parental_consent_given?: boolean;
    parental_consent_at?: string | null;
    parental_consent_version?: string | null;
  }): UserProfile {
    const currentUser = this.getCurrentUser();
    const updated: UserProfile = {
      ...currentUser,
      full_name: data.full_name !== undefined ? data.full_name : currentUser.full_name,
      email: data.email !== undefined ? data.email : currentUser.email,
      phone: data.phone !== undefined ? data.phone : currentUser.phone,
      avatar_url: data.avatar_url !== undefined ? data.avatar_url : currentUser.avatar_url,
      parental_consent_given: data.parental_consent_given !== undefined ? data.parental_consent_given : currentUser.parental_consent_given,
      parental_consent_at: data.parental_consent_at !== undefined ? data.parental_consent_at : currentUser.parental_consent_at,
      parental_consent_version: data.parental_consent_version !== undefined ? data.parental_consent_version : currentUser.parental_consent_version,
    };
    this.setCurrentUser(updated);

    if (this.isSupabaseConfigured()) {
      try {
        const client = createSPAClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (client.from('profiles') as any).update({
          full_name: updated.full_name,
          phone: updated.phone,
          avatar_url: updated.avatar_url,
        }).eq('id', updated.id).then();
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }
    return updated;
  },

  async uploadAvatar(file: File, folder: 'profiles' | 'children', entityId: string): Promise<string> {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image file size must be 5MB or less');
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Supported image formats: JPG, PNG, WebP');
    }

    if (this.isSupabaseConfigured()) {
      try {
        const client = createSPAClient();
        const ext = file.name.split('.').pop() || 'png';
        const filePath = `${folder}/${entityId}_${Date.now()}.${ext}`;
        const { error } = await client.storage.from('avatars').upload(filePath, file, {
          upsert: true,
        });
        if (!error) {
          const { data } = client.storage.from('avatars').getPublicUrl(filePath);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase avatars upload error, falling back to data URL:', err);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // ------------------------------------------------
  // BANK DETAILS & BUSINESS PROFILE (OWNER)
  // ------------------------------------------------
  getBankDetails(): BankDetails {
    return storage.get<BankDetails>('bank_details', DEFAULT_BANK_DETAILS);
  },

  updateBankDetails(details: Partial<BankDetails>): BankDetails {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'owner') {
      throw new Error('[SECURITY VIOLATION] Only Mrs Sarah can modify business bank details.');
    }
    const current = this.getBankDetails();
    const updated: BankDetails = {
      ...current,
      ...details,
    };
    storage.set('bank_details', updated);
    return updated;
  },

  // ------------------------------------------------
  // NOTIFICATION PREFERENCES
  // ------------------------------------------------
  getNotificationPreferences(userId?: string): NotificationPreferences {
    const uid = userId || this.getCurrentUser().id;
    return storage.get<NotificationPreferences>(`notifications_${uid}`, DEFAULT_NOTIFICATION_PREFERENCES);
  },

  updateNotificationPreferences(prefs: Partial<NotificationPreferences>, userId?: string): NotificationPreferences {
    const uid = userId || this.getCurrentUser().id;
    const current = this.getNotificationPreferences(uid);
    const updated = { ...current, ...prefs };
    storage.set(`notifications_${uid}`, updated);
    return updated;
  },

  // ------------------------------------------------
  // CHILDREN
  // ------------------------------------------------
  getChildren(parentProfileId?: string): Child[] {
    const all = storage.get<Child[]>('children', DEFAULT_CHILDREN);
    const currentUser = this.getCurrentUser();

    // Owner role can view all children or filter by specific parent
    if (currentUser.role === 'owner') {
      if (!parentProfileId) return all;
      return all.filter((c) => c.parent_profile_id === parentProfileId);
    }

    // NON-OWNER / PARENT: STRICTLY restrict to own children only!
    const currentEmail = currentUser?.email?.toLowerCase().trim();
    return all.filter((c) => {
      if (c.parent_profile_id === currentUser.id) return true;
      if (currentEmail && c.parent_email?.toLowerCase().trim() === currentEmail) return true;
      return false;
    });
  },

  /**
   * Adds a child profile.
   * If added by Owner (Mrs Sarah), requires parent contact information (name & email).
   * If that parent has not registered yet, child is created with has_portal_account: false
   * and linked automatically when the parent signs up with that email.
   */
  addChild(data: {
    name: string;
    date_of_birth?: string;
    age_years?: number;
    notes?: string;
    learning_goals?: string;
    parent_name?: string;
    parent_email?: string;
    parent_phone?: string;
    parent_profile_id?: string;
    has_portal_account?: boolean;
    avatar_url?: string | null;
  }): Child {
    const children = storage.get<Child[]>('children', DEFAULT_CHILDREN);
    const currentUser = this.getCurrentUser();

    let parentProfileId = data.parent_profile_id;
    let parentName = data.parent_name?.trim();
    let parentEmail = data.parent_email?.trim().toLowerCase();
    let parentPhone = data.parent_phone?.trim();
    let hasPortalAccount = data.has_portal_account;

    if (currentUser.role === 'owner') {
      if (!parentEmail && !parentProfileId) {
        throw new Error('Parent email is required when tutor adds a student profile.');
      }

      const existingUser = parentEmail ? this.findUserByEmail(parentEmail) : null;
      if (existingUser) {
        parentProfileId = existingUser.id;
        hasPortalAccount = true;
        parentName = parentName || existingUser.full_name;
        parentPhone = parentPhone || existingUser.phone || undefined;
      } else {
        parentProfileId = parentProfileId || `unclaimed-${parentEmail}`;
        hasPortalAccount = false;
      }
    } else {
      parentProfileId = currentUser.id;
      parentName = parentName || currentUser.full_name;
      parentEmail = parentEmail || currentUser.email.toLowerCase();
      parentPhone = parentPhone || currentUser.phone || undefined;
      hasPortalAccount = true;
    }

    const newChild: Child = {
      id: `child-${Date.now()}`,
      parent_profile_id: parentProfileId || currentUser.id,
      name: data.name.trim(),
      date_of_birth: data.date_of_birth || null,
      age_years: data.age_years || null,
      notes: data.notes || null,
      learning_goals: data.learning_goals || null,
      parent_name: parentName || null,
      parent_email: parentEmail || null,
      parent_phone: parentPhone || null,
      has_portal_account: Boolean(hasPortalAccount),
      avatar_url: data.avatar_url || null,
      created_at: new Date().toISOString(),
    };

    children.push(newChild);
    storage.set('children', children);
    return newChild;
  },

  /**
   * Links any unclaimed or pre-existing child records matching a parent email
   * to a newly registered parent account upon signup.
   * Prevents duplicate child profiles and avoids manual re-entry.
   */
  claimChildrenByParentEmail(
    parentEmail: string,
    parentProfileId: string,
    parentName?: string,
    parentPhone?: string
  ): Child[] {
    if (!parentEmail) return [];
    const normalizedEmail = parentEmail.trim().toLowerCase();
    const children = storage.get<Child[]>('children', DEFAULT_CHILDREN);
    let updated = false;

    const claimed: Child[] = [];

    const modifiedChildren = children.map((child) => {
      const childEmail = child.parent_email?.trim().toLowerCase();
      const isUnclaimedMatch =
        child.parent_profile_id === `unclaimed-${normalizedEmail}` ||
        childEmail === normalizedEmail;

      if (isUnclaimedMatch) {
        updated = true;
        const linkedChild: Child = {
          ...child,
          parent_profile_id: parentProfileId,
          has_portal_account: true,
          parent_name: child.parent_name || parentName || null,
          parent_email: normalizedEmail,
          parent_phone: child.parent_phone || parentPhone || null,
        };
        claimed.push(linkedChild);
        return linkedChild;
      }
      return child;
    });

    if (updated) {
      storage.set('children', modifiedChildren);
    }

    return claimed;
  },

  updateChild(id: string, data: Partial<Child>): Child | null {
    const children = storage.get<Child[]>('children', DEFAULT_CHILDREN);
    const idx = children.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    children[idx] = { ...children[idx], ...data };
    storage.set('children', children);
    return children[idx];
  },

  deleteChild(id: string) {
    const children = storage.get<Child[]>('children', DEFAULT_CHILDREN).filter((c) => c.id !== id);
    storage.set('children', children);
  },

  // ------------------------------------------------
  // AVAILABILITY SLOTS
  // ------------------------------------------------
  getSlots(): AvailabilitySlot[] {
    return storage.get<AvailabilitySlot[]>('slots', DEFAULT_SLOTS);
  },

  addSlot(slot: Omit<AvailabilitySlot, 'id' | 'is_booked' | 'created_at'>): AvailabilitySlot {
    const slots = this.getSlots();
    const newSlot: AvailabilitySlot = {
      ...slot,
      id: `slot-${Date.now()}`,
      is_booked: false,
      created_at: new Date().toISOString(),
    };
    slots.push(newSlot);
    storage.set('slots', slots);
    return newSlot;
  },

  deleteSlot(id: string) {
    const slots = this.getSlots().filter((s) => s.id !== id);
    storage.set('slots', slots);
  },

  // ------------------------------------------------
  // BOOKINGS & PHASE 2 BOOKING ENGINE
  // ------------------------------------------------
  getBookings(childId?: string): Booking[] {
    const bookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const currentUser = this.getCurrentUser();

    let list = bookings;
    // Non-owner (parent) only sees their own family bookings
    if (currentUser.role !== 'owner') {
      const parentChildren = this.getChildren(currentUser.id).map((c) => c.id);
      const currentEmail = currentUser.email?.toLowerCase().trim();
      list = bookings.filter(
        (b) =>
          parentChildren.includes(b.child_id) ||
          b.parent_profile_id === currentUser.id ||
          (currentEmail && b.parent_email?.toLowerCase().trim() === currentEmail)
      );
    }

    if (childId) {
      return list.filter((b) => b.child_id === childId);
    }
    return list;
  },

  createBooking(data: {
    slotId?: string;
    childId: string;
    mode: LessonMode;
    startTime: string;
    endTime: string;
    homeAddress?: string;
    notes?: string;
    meetingLink?: string;
    isRecurring?: boolean;
    recurringGroupId?: string;
    recurrenceIndex?: number;
    recurrenceTotal?: number;
  }): Booking {
    const allBookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const children = this.getChildren();
    const child = children.find((c) => c.id === data.childId);
    const currentUser = this.getCurrentUser();

    // Mark slot as booked if slotId provided
    if (data.slotId) {
      const slots = this.getSlots();
      const slot = slots.find((s) => s.id === data.slotId);
      if (slot) {
        slot.is_booked = true;
        storage.set('slots', slots);
      }
    }

    const newBooking: Booking = {
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slot_id: data.slotId || null,
      child_id: data.childId,
      tutor_id: 'tutor-sarah-id',
      mode: data.mode,
      meeting_link:
        data.mode === 'online'
          ? (data.meetingLink || 'https://meet.google.com/sarah-eyt-room')
          : null,
      home_address: data.homeAddress || null,
      status: 'confirmed',
      start_time: data.startTime,
      end_time: data.endTime,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      child_name: child?.name || 'Child',
      parent_name: child?.parent_name || currentUser.full_name,
      parent_email: child?.parent_email || currentUser.email,
      parent_profile_id: child?.parent_profile_id || currentUser.id,
      is_recurring: Boolean(data.isRecurring),
      recurring_group_id: data.recurringGroupId || null,
      recurrence_rule: data.isRecurring ? 'weekly' : null,
      recurrence_index: data.recurrenceIndex || null,
      recurrence_total: data.recurrenceTotal || null,
      is_billable: true,
    };

    allBookings.push(newBooking);
    storage.set('bookings', allBookings);
    return newBooking;
  },

  /**
   * Phase 2 Scope: Recurring/Repeat Session Booking.
   * Books an ongoing weekly slot across N weeks.
   * Generates INDIVIDUAL booking records under the hood so each session
   * can still be individually rescheduled, cancelled, or marked attended.
   */
  createRecurringBooking(data: {
    slotId?: string;
    childId: string;
    mode: LessonMode;
    startTime: string; // ISO string for first occurrence
    endTime: string;   // ISO string for first occurrence
    weeksCount: number; // e.g. 4, 8, 12 weeks
    homeAddress?: string;
    notes?: string;
    meetingLink?: string;
  }): Booking[] {
    const weeks = Math.max(1, Math.min(data.weeksCount || 4, 24));
    const recurringGroupId = `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdList: Booking[] = [];
    const allBookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const children = this.getChildren();
    const child = children.find((c) => c.id === data.childId);
    const currentUser = this.getCurrentUser();

    const baseStart = new Date(data.startTime);
    const baseEnd = new Date(data.endTime);
    const durationMs = baseEnd.getTime() - baseStart.getTime();

    // Mark first slot as booked if slotId provided
    if (data.slotId) {
      const slots = this.getSlots();
      const slot = slots.find((s) => s.id === data.slotId);
      if (slot) {
        slot.is_booked = true;
        storage.set('slots', slots);
      }
    }

    for (let i = 0; i < weeks; i++) {
      const sessionStart = new Date(baseStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const sessionEnd = new Date(sessionStart.getTime() + durationMs);

      const bookingItem: Booking = {
        id: `book-${Date.now()}-${i + 1}`,
        slot_id: i === 0 ? (data.slotId || null) : null,
        child_id: data.childId,
        tutor_id: 'tutor-sarah-id',
        mode: data.mode,
        meeting_link:
          data.mode === 'online'
            ? (data.meetingLink || 'https://meet.google.com/sarah-eyt-room')
            : null,
        home_address: data.homeAddress || null,
        status: 'confirmed',
        start_time: sessionStart.toISOString(),
        end_time: sessionEnd.toISOString(),
        notes: data.notes
          ? `${data.notes} (Week ${i + 1} of ${weeks})`
          : `Weekly session (Week ${i + 1} of ${weeks})`,
        created_at: new Date().toISOString(),
        child_name: child?.name || 'Child',
        parent_name: child?.parent_name || currentUser.full_name,
        parent_email: child?.parent_email || currentUser.email,
        parent_profile_id: child?.parent_profile_id || currentUser.id,
        recurring_group_id: recurringGroupId,
        is_recurring: true,
        recurrence_rule: 'weekly',
        recurrence_index: i + 1,
        recurrence_total: weeks,
        is_billable: true,
      };

      allBookings.push(bookingItem);
      createdList.push(bookingItem);
    }

    storage.set('bookings', allBookings);
    return createdList;
  },

  /**
   * Phase 2 Scope: Attendance Tracking.
   * Sarah sets status per session: 'completed', 'no_show', or 'cancelled'.
   * Configurable billable flag: 'no_show' is billable per policy, 'cancelled' is typically not.
   */
  recordAttendance(
    bookingId: string,
    attendance: 'completed' | 'no_show' | 'cancelled',
    options?: {
      attendanceNotes?: string;
      isBillable?: boolean;
    }
  ): Booking | null {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'owner') {
      throw new Error('[SECURITY VIOLATION] Only Mrs Sarah can record session attendance.');
    }

    const bookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const defaultBillable = attendance === 'completed' || attendance === 'no_show';
    const finalBillable = options?.isBillable !== undefined ? options.isBillable : defaultBillable;

    bookings[idx] = {
      ...bookings[idx],
      status: attendance,
      attendance_notes: options?.attendanceNotes || bookings[idx].attendance_notes || null,
      attendance_recorded_at: new Date().toISOString(),
      is_billable: finalBillable,
    };

    storage.set('bookings', bookings);
    return bookings[idx];
  },

  /**
   * Reschedules an INDIVIDUAL booking occurrence.
   * If part of a recurring series, DOES NOT affect any other session in the series.
   */
  rescheduleBooking(
    bookingId: string,
    newStartTime: string,
    newEndTime: string,
    newMeetingLink?: string
  ): Booking | null {
    const bookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    bookings[idx] = {
      ...bookings[idx],
      start_time: newStartTime,
      end_time: newEndTime,
      meeting_link: newMeetingLink !== undefined ? newMeetingLink : bookings[idx].meeting_link,
      status: 'confirmed',
      reminder_sent_at: null, // Reset reminder for the new time
    };

    storage.set('bookings', bookings);
    return bookings[idx];
  },

  /**
   * Cancels an INDIVIDUAL booking occurrence.
   * Does not cancel or modify the rest of the recurring series.
   */
  cancelBooking(bookingId: string, reason?: string): Booking | null {
    const bookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    bookings[idx] = {
      ...bookings[idx],
      status: 'cancelled',
      is_billable: false,
      notes: reason
        ? `${bookings[idx].notes || ''} [Cancellation: ${reason}]`.trim()
        : bookings[idx].notes,
    };

    storage.set('bookings', bookings);
    return bookings[idx];
  },

  updateBookingStatus(id: string, status: BookingStatus, meetingLink?: string): Booking | null {
    const bookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    bookings[idx].status = status;
    if (meetingLink !== undefined) {
      bookings[idx].meeting_link = meetingLink;
    }
    if (status === 'completed' || status === 'no_show') {
      bookings[idx].attendance_recorded_at = new Date().toISOString();
      bookings[idx].is_billable = true;
    } else if (status === 'cancelled') {
      bookings[idx].is_billable = false;
    }
    storage.set('bookings', bookings);
    return bookings[idx];
  },

  /**
   * Phase 2 Scope: Automated Session Reminder Emails.
   * Scans confirmed upcoming sessions within the reminder window (e.g. 24-48 hours ahead).
   * Automatically dispatches reminder emails so Sarah never needs to manually remind.
   */
  checkAndDispatchReminders(hoursAhead: number = 48): SessionReminderNotification[] {
    const bookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    const notifications = storage.get<SessionReminderNotification[]>('session_reminder_notifications', []);
    const now = Date.now();
    const thresholdMs = hoursAhead * 60 * 60 * 1000;
    const dispatched: SessionReminderNotification[] = [];

    const updatedBookings = bookings.map((b) => {
      if (b.status === 'confirmed' && !b.reminder_sent_at) {
        const sessionTime = new Date(b.start_time).getTime();
        const diff = sessionTime - now;

        if (diff > 0 && diff <= thresholdMs) {
          const recipientEmail = b.parent_email || 'elizabeth@example.com';
          const notif: SessionReminderNotification = {
            id: `remind-${Date.now()}-${b.id}`,
            booking_id: b.id,
            recipient_email: recipientEmail,
            recipient_name: b.parent_name || 'Parent',
            child_name: b.child_name || 'Child',
            start_time: b.start_time,
            end_time: b.end_time,
            mode: b.mode,
            meeting_link: b.meeting_link,
            home_address: b.home_address,
            sent_at: new Date().toISOString(),
            status: 'delivered',
          };

          notifications.unshift(notif);
          dispatched.push(notif);

          if (typeof window !== 'undefined') {
            try {
              fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notif),
              }).catch(() => {});
            } catch {}
          }

          return {
            ...b,
            reminder_sent_at: new Date().toISOString(),
          };
        }
      }
      return b;
    });

    if (dispatched.length > 0) {
      storage.set('bookings', updatedBookings);
      storage.set('session_reminder_notifications', notifications);
    }

    return dispatched;
  },

  getReminderNotifications(): SessionReminderNotification[] {
    return storage.get<SessionReminderNotification[]>('session_reminder_notifications', []);
  },

  // ------------------------------------------------
  // MILESTONES & PROGRESS
  // ------------------------------------------------
  getMilestones(subjectArea?: SubjectArea): Milestone[] {
    const list = storage.get<Milestone[]>('milestones', DEFAULT_MILESTONES);
    if (!subjectArea) return list;
    return list.filter((m) => m.subject_area === subjectArea);
  },

  getChildMilestones(childId: string): ChildMilestone[] {
    const records = storage.get<ChildMilestone[]>('child_milestones', DEFAULT_CHILD_MILESTONES);
    const milestones = this.getMilestones();

    const childRecords = records.filter((r) => r.child_id === childId);
    return childRecords.map((r) => ({
      ...r,
      milestone: milestones.find((m) => m.id === r.milestone_id),
    }));
  },

  updateChildMilestone(childId: string, milestoneId: string, status: MilestoneStatus, notes?: string) {
    const records = storage.get<ChildMilestone[]>('child_milestones', DEFAULT_CHILD_MILESTONES);
    const idx = records.findIndex((r) => r.child_id === childId && r.milestone_id === milestoneId);
    if (idx >= 0) {
      records[idx].status = status;
      if (status === 'achieved') {
        records[idx].date_achieved = new Date().toISOString().split('T')[0];
      }
      if (notes) records[idx].notes = notes;
    } else {
      records.push({
        id: `cm-${Date.now()}`,
        child_id: childId,
        milestone_id: milestoneId,
        status: status,
        date_achieved: status === 'achieved' ? new Date().toISOString().split('T')[0] : null,
        notes: notes || null,
      });
    }
    storage.set('child_milestones', records);
  },

  // ------------------------------------------------
  // RESOURCES
  // ------------------------------------------------
  getResources(subjectArea?: string): Resource[] {
    const list = storage.get<Resource[]>('resources', DEFAULT_RESOURCES);
    if (!subjectArea || subjectArea === 'all') return list;
    return list.filter((r) => r.subject_area === subjectArea);
  },

  addResource(data: Omit<Resource, 'id' | 'created_at' | 'tutor_id'>): Resource {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'owner') {
      throw new Error('[SECURITY VIOLATION] Only Mrs Sarah can add learning resources.');
    }
    const list = this.getResources();
    const newRes: Resource = {
      ...data,
      id: `res-${Date.now()}`,
      tutor_id: currentUser.id || 'tutor-sarah-id',
      created_at: new Date().toISOString(),
    };
    list.push(newRes);
    storage.set('resources', list);
    return newRes;
  },

  // ------------------------------------------------
  // INVOICES
  // ------------------------------------------------
  getInvoices(parentProfileId?: string): Invoice[] {
    const list = storage.get<Invoice[]>('invoices', DEFAULT_INVOICES);
    const currentUser = this.getCurrentUser();

    // Owner can view all invoices or filter by parent
    if (currentUser.role === 'owner') {
      if (parentProfileId) {
        return list.filter((i) => i.parent_profile_id === parentProfileId);
      }
      return list;
    }

    // Non-owner (Parent): STRICTLY restrict to own invoices only!
    const parentEmail = currentUser.email?.toLowerCase().trim();
    return list.filter(
      (i) =>
        i.parent_profile_id === currentUser.id ||
        (parentEmail && i.parent_profile_id === `unclaimed-${parentEmail}`)
    );
  },

  /**
   * Upload payment proof for an unpaid invoice.
   * Updates status to 'payment_submitted' ("Payment Submitted – Pending Verification").
   */
  uploadPaymentProof(invoiceId: string, proofUrl: string, proofName?: string): Invoice | null {
    const list = storage.get<Invoice[]>('invoices', DEFAULT_INVOICES);
    const idx = list.findIndex((i) => i.id === invoiceId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: 'payment_submitted',
      payment_proof_url: proofUrl,
      payment_proof_name: proofName || 'receipt_screenshot',
      payment_proof_uploaded_at: new Date().toISOString(),
    };
    storage.set('invoices', list);
    return list[idx];
  },

  /**
   * Owner action: Confirm submitted payment proof and mark invoice as paid.
   */
  confirmInvoicePayment(invoiceId: string): Invoice | null {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'owner') {
      throw new Error('[SECURITY VIOLATION] Only Mrs Sarah can confirm payments.');
    }
    const list = storage.get<Invoice[]>('invoices', DEFAULT_INVOICES);
    const idx = list.findIndex((i) => i.id === invoiceId);
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: 'paid',
      paid_at: new Date().toISOString(),
    };
    storage.set('invoices', list);
    return list[idx];
  },

  markInvoicePaid(id: string): Invoice | null {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'owner') {
      throw new Error('[SECURITY VIOLATION] Only Mrs Sarah can mark invoices as paid.');
    }
    const list = storage.get<Invoice[]>('invoices', DEFAULT_INVOICES);
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    list[idx].status = 'paid';
    list[idx].paid_at = new Date().toISOString();
    storage.set('invoices', list);
    return list[idx];
  },

  createInvoice(data: Omit<Invoice, 'id' | 'created_at' | 'paid_at' | 'invoice_number'>): Invoice {
    const currentUser = this.getCurrentUser();
    if (currentUser.role !== 'owner') {
      throw new Error('[SECURITY VIOLATION] Only Mrs Sarah can issue tuition invoices.');
    }
    const list = storage.get<Invoice[]>('invoices', DEFAULT_INVOICES);
    const count = list.length + 1;
    const invNumber = `INV-2026-${String(count).padStart(3, '0')}`;
    const newInv: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoice_number: invNumber,
      paid_at: data.status === 'paid' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };
    list.unshift(newInv);
    storage.set('invoices', list);
    return newInv;
  },

  // ------------------------------------------------
  // ENQUIRIES (Public Form)
  // ------------------------------------------------
  async submitEnquiry(data: { name: string; contact: string; child_age?: string; preferred_mode?: string; message: string }): Promise<Enquiry> {
    if (this.isSupabaseConfigured()) {
      try {
        const client = createSPAClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (client.from('enquiries') as any).insert({
          name: data.name,
          contact: data.contact,
          child_age: data.child_age || null,
          preferred_mode: data.preferred_mode || null,
          message: data.message,
          status: 'new',
        }).select().single();
        if (!error && inserted) {
          const enq = inserted as Enquiry;
          this.dispatchEnquiryNotification(enq);
          return enq;
        }
      } catch {
        // Fallback to local storage
      }
    }

    const list = storage.get<Enquiry[]>('enquiries', DEFAULT_ENQUIRIES);
    const newEnq: Enquiry = {
      id: `enq-${Date.now()}`,
      name: data.name,
      contact: data.contact,
      child_age: data.child_age || null,
      preferred_mode: data.preferred_mode || null,
      message: data.message,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    list.unshift(newEnq);
    storage.set('enquiries', list);
    this.dispatchEnquiryNotification(newEnq);
    return newEnq;
  },

  dispatchEnquiryNotification(enquiry: Enquiry): EnquiryEmailNotification {
    const bankDetails = this.getBankDetails();
    const recipientEmail = bankDetails.business_email || 'sarahoakhena@gmail.com';
    const notification: EnquiryEmailNotification = {
      id: `notif-${Date.now()}`,
      enquiry_id: enquiry.id,
      recipient_email: recipientEmail,
      subject: `[New Early Years Enquiry] From ${enquiry.name} (${enquiry.child_age ? `Age ${enquiry.child_age}` : 'Early Years'})`,
      sent_at: new Date().toISOString(),
      status: 'delivered',
      details: {
        parent_name: enquiry.name,
        contact: enquiry.contact,
        child_age: enquiry.child_age,
        preferred_mode: enquiry.preferred_mode,
        message: enquiry.message,
      },
    };

    const notifs = storage.get<EnquiryEmailNotification[]>('enquiry_email_notifications', []);
    notifs.unshift(notification);
    storage.set('enquiry_email_notifications', notifs);

    if (typeof window !== 'undefined') {
      try {
        fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enquiry),
        }).catch(() => {});
      } catch {
        // Suppress client network errors
      }
    }

    return notification;
  },

  getEnquiryEmailNotifications(): EnquiryEmailNotification[] {
    return storage.get<EnquiryEmailNotification[]>('enquiry_email_notifications', []);
  },

  getEnquiries(): Enquiry[] {
    const user = this.getCurrentUser();
    // Security check: non-owners cannot retrieve enquiry data
    if (user.role !== 'owner') {
      console.warn('[SECURITY] Unauthorized access attempt to enquiries by role:', user.role);
      return [];
    }
    return storage.get<Enquiry[]>('enquiries', DEFAULT_ENQUIRIES);
  },

  updateEnquiryStatus(id: string, status: EnquiryStatus) {
    const user = this.getCurrentUser();
    if (user.role !== 'owner') {
      throw new Error('[SECURITY VIOLATION] Only Mrs Sarah can modify enquiry statuses.');
    }
    const list = storage.get<Enquiry[]>('enquiries', DEFAULT_ENQUIRIES);
    const idx = list.findIndex((e) => e.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      storage.set('enquiries', list);
    }
  },

  // ------------------------------------------------
  // MESSAGES
  // ------------------------------------------------
  getMessages(): Message[] {
    return storage.get<Message[]>('messages', DEFAULT_MESSAGES);
  },

  sendMessage(body: string, recipientId: string): Message {
    const list = this.getMessages();
    const currentUser = this.getCurrentUser();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_profile_id: currentUser.id,
      recipient_profile_id: recipientId,
      sender_name: currentUser.full_name,
      body,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    list.push(newMsg);
    storage.set('messages', list);
    return newMsg;
  },
};
