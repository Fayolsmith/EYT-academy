export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'owner' | 'tutor' | 'parent';
export type LessonMode = 'online' | 'home';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'achieved';
export type SubjectArea = 'literacy' | 'numeracy' | 'practical_life' | 'cultural' | 'arts';
export type InvoiceStatus = 'unpaid' | 'payment_submitted' | 'paid' | 'cancelled';
export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'closed';
export type AssignmentStatus = 'assigned' | 'submitted' | 'reviewed';
export type TestimonialStatus = 'pending' | 'published' | 'rejected';
export type TestimonialDisplayNameChoice = 'full_name' | 'first_name_last_initial' | 'anonymous';
export type SessionType = 'standard' | 'trial';

export type InvoiceCurrency = 'NGN' | 'GBP' | 'EUR' | 'USD';
export type LearningPillar = 'numeracy' | 'phonics' | 'practical_life' | 'cultural' | 'arts';

export interface ChildModeProgress {
  id: string;
  child_id: string;
  date: string; // YYYY-MM-DD
  pillars_completed: LearningPillar[];
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomePracticeSummary {
  child_id: string;
  practiced_days_last_7: number;
  last_active_date: string | null; // YYYY-MM-DD
  last_active_formatted: string; // "Yesterday", "Sep 10, 2026", or "No activity yet"
  this_week_pillars: string[]; // ["Numeracy", "Phonics & Literacy"]
  days_inactive: number;
  is_disengaged: boolean; // true if days_inactive >= 5
}

export interface PracticeAlert {
  id: string;
  child_id: string;
  child_name: string;
  parent_name: string;
  parent_email: string;
  parent_phone?: string;
  days_inactive: number;
  last_active_date: string | null;
  streak_anchor_date: string; // Boundary anchor for current quiet streak to prevent repeated alerts
  alerted_at: string;
  status: 'active' | 'acknowledged' | 'dismissed';
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          phone: string | null
          email: string | null
          avatar_url: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          phone?: string | null
          email?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string
          phone?: string | null
          email?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutors: {
        Row: {
          id: string
          profile_id: string
          bio: string | null
          credentials: string | null
          headline: string | null
          hourly_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          bio?: string | null
          credentials?: string | null
          headline?: string | null
          hourly_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          bio?: string | null
          credentials?: string | null
          headline?: string | null
          hourly_rate?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      children: {
        Row: {
          id: string
          parent_profile_id: string
          name: string
          date_of_birth: string | null
          age_years: number | null
          notes: string | null
          learning_goals: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_profile_id: string
          name: string
          date_of_birth?: string | null
          age_years?: number | null
          notes?: string | null
          learning_goals?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_profile_id?: string
          name?: string
          date_of_birth?: string | null
          age_years?: number | null
          notes?: string | null
          learning_goals?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      availability_slots: {
        Row: {
          id: string
          tutor_id: string
          start_time: string
          end_time: string
          mode: 'online' | 'home' | 'both'
          is_booked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          start_time: string
          end_time: string
          mode: 'online' | 'home' | 'both'
          is_booked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          start_time?: string
          end_time?: string
          mode?: 'online' | 'home' | 'both'
          is_booked?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          slot_id: string | null
          child_id: string
          tutor_id: string
          mode: LessonMode
          meeting_link: string | null
          home_address: string | null
          status: BookingStatus
          start_time: string
          end_time: string
          notes: string | null
          session_type?: SessionType
          trial_price?: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot_id?: string | null
          child_id: string
          tutor_id: string
          mode: LessonMode
          meeting_link?: string | null
          home_address?: string | null
          status?: BookingStatus
          start_time: string
          end_time: string
          notes?: string | null
          session_type?: SessionType
          trial_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot_id?: string | null
          child_id?: string
          tutor_id?: string
          mode?: LessonMode
          meeting_link?: string | null
          home_address?: string | null
          status?: BookingStatus
          start_time?: string
          end_time?: string
          notes?: string | null
          session_type?: SessionType
          trial_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          }
        ]
      }
      session_notes: {
        Row: {
          id: string
          booking_id: string
          tutor_id: string
          child_id: string
          notes: string
          skills_covered: Json
          homework_assigned: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          tutor_id: string
          child_id: string
          notes: string
          skills_covered?: Json
          homework_assigned?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          tutor_id?: string
          child_id?: string
          notes?: string
          skills_covered?: Json
          homework_assigned?: string | null
          created_at?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          id: string
          name: string
          description: string | null
          subject_area: SubjectArea
          target_age_group: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          subject_area: SubjectArea
          target_age_group?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          subject_area?: SubjectArea
          target_age_group?: string | null
          created_at?: string
        }
        Relationships: []
      }
      child_milestones: {
        Row: {
          id: string
          child_id: string
          milestone_id: string
          status: MilestoneStatus
          date_achieved: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          milestone_id: string
          status?: MilestoneStatus
          date_achieved?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          milestone_id?: string
          status?: MilestoneStatus
          date_achieved?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          id: string
          tutor_id: string
          title: string
          description: string | null
          file_url: string
          file_type: string | null
          subject_area: string | null
          age_range: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          title: string
          description?: string | null
          file_url: string
          file_type?: string | null
          subject_area?: string | null
          age_range?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_type?: string | null
          subject_area?: string | null
          age_range?: string | null
          created_at?: string
        }
        Relationships: []
      }
      resource_assignments: {
        Row: {
          id: string
          resource_id: string
          child_id: string
          assigned_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          child_id: string
          assigned_at?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          child_id?: string
          assigned_at?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_profile_id: string
          recipient_profile_id: string
          body: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_profile_id: string
          recipient_profile_id: string
          body: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_profile_id?: string
          recipient_profile_id?: string
          body?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          parent_profile_id: string
          invoice_number: string | null
          amount: number
          currency: string
          description: string | null
          status: InvoiceStatus
          payment_method: string
          due_date: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_profile_id: string
          invoice_number?: string | null
          amount: number
          currency?: string
          description?: string | null
          status?: InvoiceStatus
          payment_method?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_profile_id?: string
          invoice_number?: string | null
          amount?: number
          currency?: string
          description?: string | null
          status?: InvoiceStatus
          payment_method?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          id: string
          name: string
          contact: string
          child_age: string | null
          preferred_mode: string | null
          message: string
          status: EnquiryStatus
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          child_age?: string | null
          preferred_mode?: string | null
          message: string
          status?: EnquiryStatus
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          child_age?: string | null
          preferred_mode?: string | null
          message?: string
          status?: EnquiryStatus
          created_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          parent_profile_id: string
          child_id: string | null
          rating: number | null
          body_text: string
          display_name_choice: TestimonialDisplayNameChoice
          status: TestimonialStatus
          rejection_reason: string | null
          submitted_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          parent_profile_id: string
          child_id?: string | null
          rating?: number | null
          body_text: string
          display_name_choice?: TestimonialDisplayNameChoice
          status?: TestimonialStatus
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          parent_profile_id?: string
          child_id?: string | null
          rating?: number | null
          body_text?: string
          display_name_choice?: TestimonialDisplayNameChoice
          status?: TestimonialStatus
          rejection_reason?: string | null
          submitted_at?: string
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          }
        ]
      }
      pricing_settings: {
        Row: {
          id: string
          online_session_rate: string | null
          home_session_rate: string | null
          monthly_package_rate: string | null
          currency: string | null
          secondary_currency: string | null
          online_session_secondary_rate: string | null
          home_session_secondary_rate: string | null
          trial_session_enabled: boolean
          trial_session_price: number
          trial_session_description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          online_session_rate?: string | null
          home_session_rate?: string | null
          monthly_package_rate?: string | null
          currency?: string | null
          secondary_currency?: string | null
          online_session_secondary_rate?: string | null
          home_session_secondary_rate?: string | null
          trial_session_enabled?: boolean
          trial_session_price?: number
          trial_session_description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          online_session_rate?: string | null
          home_session_rate?: string | null
          monthly_package_rate?: string | null
          currency?: string | null
          secondary_currency?: string | null
          online_session_secondary_rate?: string | null
          home_session_secondary_rate?: string | null
          trial_session_enabled?: boolean
          trial_session_price?: number
          trial_session_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      child_mode_progress: {
        Row: {
          id: string
          child_id: string
          date: string
          pillars_completed: string[]
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          date: string
          pillars_completed?: string[]
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          date?: string
          pillars_completed?: string[]
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_mode_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_tutor_or_owner: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      lesson_mode: LessonMode
      booking_status: BookingStatus
      milestone_status: MilestoneStatus
      subject_area_type: SubjectArea
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
