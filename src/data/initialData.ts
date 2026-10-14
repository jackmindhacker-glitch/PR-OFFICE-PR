import { Teacher, Course, Student, PaymentRecord, TeacherPayout, AcademySettings } from '../types/academy';

// All sample demo data removed as requested by user.
// Starting with completely clean empty records.
export const INITIAL_TEACHERS: Teacher[] = [];

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export const INITIAL_PAYOUTS: TeacherPayout[] = [];

export const INITIAL_SETTINGS: AcademySettings = {
  academyName: 'PR ACADEMY',
  tagline: 'Dance, Meditation, Acting & Performing Arts',
  phone: '+91 98765 43210',
  email: 'magicianpradeeprajput@gmail.com',
  address: 'PR ACADEMY Complex',
  upiId: 'pracademy@upi',
  defaultPin: '1996',
  currencySymbol: '₹',
};

// Optional starter templates if user wants to quickly add standard courses with 1 click
export const STARTER_COURSE_TEMPLATES: Omit<Course, 'id' | 'teacherId'>[] = [
  {
    title: 'Bollywood & Freestyle Dance',
    category: 'Dance',
    duration: '1 Month',
    price: 2500,
    description: 'Dynamic choreography, rhythm, body posture, and stage presence.',
    batchSchedule: 'Mon, Wed, Fri (5:00 PM - 6:30 PM)',
    level: 'Beginner',
    teacherSharePercent: 50,
  },
  {
    title: 'Mindfulness & Meditation Yoga',
    category: 'Meditation',
    duration: '1 Month',
    price: 2000,
    description: 'Pranayama, stress relief meditation, sound bowl therapy, and mental clarity.',
    batchSchedule: 'Mon to Fri (6:30 AM - 7:30 AM)',
    level: 'All Levels',
    teacherSharePercent: 50,
  },
  {
    title: 'Acting & Method Acting Intensive',
    category: 'Acting',
    duration: '3 Months',
    price: 8000,
    description: 'Voice modulation, dialogue delivery, camera acting, and audition prep.',
    batchSchedule: 'Saturday & Sunday (10:00 AM - 1:00 PM)',
    level: 'All Levels',
    teacherSharePercent: 50,
  },
  {
    title: 'Acoustic Guitar Foundation',
    category: 'Guitar',
    duration: '2 Months',
    price: 4500,
    description: 'Chords, strumming patterns, Bollywood song tabs, and fingerstyle.',
    batchSchedule: 'Tue, Thu, Sat (4:00 PM - 5:30 PM)',
    level: 'Beginner',
    teacherSharePercent: 50,
  },
];
