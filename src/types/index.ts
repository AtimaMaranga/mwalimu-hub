/** Teacher profile as stored in Supabase */
export interface Teacher {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
  tagline?: string;
  bio?: string;
  teaching_approach?: string;
  experience_years?: number;
  qualifications?: string;
  certifications?: string[];
  languages_spoken?: LanguageEntry[];
  specializations?: string[];
  hourly_rate?: number;
  timezone?: string;
  availability_description?: string;
  video_intro_url?: string;
  is_native_speaker: boolean;
  is_published: boolean;
  is_online: boolean;
  rating: number;
  total_students: number;
  created_at: string;
  updated_at: string;
}

/** Student review for a teacher */
export interface Review {
  id: string;
  teacher_id: string;
  student_name: string;
  student_email: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  student_id: string;
  teacher_id: string;
  student_name: string;
  student_email: string;
  teacher_name: string;
  last_message?: string;
  last_message_at: string;
  student_unread: number;
  teacher_unread: number;
  created_at: string;
  // Enriched fields
  teacher_is_online?: boolean;
  student_last_seen_at?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'student' | 'teacher';
  sender_name: string;
  content: string;
  created_at: string;
}

export interface LanguageEntry {
  language: string;
  level: string;
}

/** Blog post as stored in Supabase */
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  author: string;
  category?: string;
  tags?: string[];
  read_time?: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

/** Contact form submission */
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  status: "new" | "read" | "responded";
  created_at: string;
}

/** Teacher application */
export interface TeacherApplication {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience?: string;
  qualifications?: string;
  available_hours?: number;
  rate_expectation?: number;
  teaching_philosophy?: string;
  cv_url?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

/** Student inquiry */
export interface StudentInquiry {
  id: string;
  teacher_id: string;
  student_name: string;
  student_email: string;
  message?: string;
  preferred_times?: string;
  experience_level?: "beginner" | "intermediate" | "advanced";
  created_at: string;
}

/** Specialisation options */
export const SPECIALIZATIONS = [
  "Conversational",
  "Business",
  "Exam Prep",
  "Kids & Young Learners",
  "Travel",
  "Academic",
  "Cultural Immersion",
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

/** Contact form subjects */
export const CONTACT_SUBJECTS = [
  "General Inquiry",
  "I want to learn Swahili",
  "Become a Teacher",
  "Technical Support",
  "Partnership Opportunity",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];
