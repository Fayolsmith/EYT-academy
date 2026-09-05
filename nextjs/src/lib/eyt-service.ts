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
  invoice_number: string;
  amount: number;
  currency: string;
  description: string | null;
  status: InvoiceStatus;
  payment_method: string;
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
}

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

  switchToOwner(): UserProfile {
    this.setCurrentUser(DEFAULT_SARAH_PROFILE);
    return DEFAULT_SARAH_PROFILE;
  },

  switchToParent(): UserProfile {
    this.setCurrentUser(DEFAULT_PARENT_PROFILE);
    return DEFAULT_PARENT_PROFILE;
  },

  // ------------------------------------------------
  // CHILDREN
  // ------------------------------------------------
  getChildren(parentProfileId?: string): Child[] {
    const all = storage.get<Child[]>('children', DEFAULT_CHILDREN);
    if (!parentProfileId) return all;

    const currentUser = this.getCurrentUser();
    const currentEmail = currentUser?.email?.toLowerCase().trim();

    return all.filter((c) => {
      if (c.parent_profile_id === parentProfileId) return true;
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
  }): Child {
    const children = this.getChildren();
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
    const children = this.getChildren();
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
    const children = this.getChildren();
    const idx = children.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    children[idx] = { ...children[idx], ...data };
    storage.set('children', children);
    return children[idx];
  },

  deleteChild(id: string) {
    const children = this.getChildren().filter((c) => c.id !== id);
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
  // BOOKINGS
  // ------------------------------------------------
  getBookings(childId?: string): Booking[] {
    const bookings = storage.get<Booking[]>('bookings', DEFAULT_BOOKINGS);
    if (childId) {
      return bookings.filter((b) => b.child_id === childId);
    }
    return bookings;
  },

  createBooking(data: {
    slotId?: string;
    childId: string;
    mode: LessonMode;
    startTime: string;
    endTime: string;
    homeAddress?: string;
    notes?: string;
  }): Booking {
    const bookings = this.getBookings();
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
      id: `book-${Date.now()}`,
      slot_id: data.slotId || null,
      child_id: data.childId,
      tutor_id: 'tutor-sarah-id',
      mode: data.mode,
      meeting_link: data.mode === 'online' ? 'https://meet.google.com/sarah-eyt-room' : null,
      home_address: data.homeAddress || null,
      status: 'confirmed',
      start_time: data.startTime,
      end_time: data.endTime,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      child_name: child?.name || 'Child',
      parent_name: currentUser.full_name,
    };

    bookings.push(newBooking);
    storage.set('bookings', bookings);
    return newBooking;
  },

  updateBookingStatus(id: string, status: BookingStatus, meetingLink?: string): Booking | null {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    bookings[idx].status = status;
    if (meetingLink !== undefined) {
      bookings[idx].meeting_link = meetingLink;
    }
    storage.set('bookings', bookings);
    return bookings[idx];
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
    const list = this.getResources();
    const newRes: Resource = {
      ...data,
      id: `res-${Date.now()}`,
      tutor_id: 'tutor-sarah-id',
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
    if (parentProfileId) {
      return list.filter((i) => i.parent_profile_id === parentProfileId);
    }
    return list;
  },

  markInvoicePaid(id: string): Invoice | null {
    const list = this.getInvoices();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    list[idx].status = 'paid';
    list[idx].paid_at = new Date().toISOString();
    storage.set('invoices', list);
    return list[idx];
  },

  createInvoice(data: Omit<Invoice, 'id' | 'created_at' | 'paid_at' | 'invoice_number'>): Invoice {
    const list = this.getInvoices();
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
    // If Supabase is configured, try Supabase insert first
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
          return inserted as Enquiry;
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
    return newEnq;
  },

  getEnquiries(): Enquiry[] {
    return storage.get<Enquiry[]>('enquiries', DEFAULT_ENQUIRIES);
  },

  updateEnquiryStatus(id: string, status: EnquiryStatus) {
    const list = this.getEnquiries();
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
