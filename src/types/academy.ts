export interface Teacher {
  id: string;
  name: string;
  phone: string;
  specialty: string; // e.g., 'Dance', 'Meditation', 'Acting', 'Guitar'
  upiOrBank: string;
  sharePercentage: number; // Defaults to 50%
  joinDate: string;
  avatarColor: string;
}

export interface Course {
  id: string;
  title: string;
  category: 'Dance' | 'Meditation' | 'Acting' | 'Guitar' | 'Singing' | 'Yoga' | 'Other';
  duration: string; // e.g. '1 Month', '3 Months', '6 Months'
  price: number; // Fee in ₹
  teacherId: string;
  description: string;
  batchSchedule: string; // e.g., 'Mon-Wed-Fri (5:00 PM - 6:30 PM)'
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  isPackage?: boolean;
  includedCourseIds?: string[];
  activeStudentsCount?: number;
  teacherSharePercent?: number; // Customizable default share % for this course (default 50)
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';

export interface Student {
  id: string;
  rollNo: string;
  fullName: string;
  parentName: string;
  phone: string;
  whatsapp: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  courseId: string;
  courseTitle?: string;
  teacherId?: string;
  teacherName?: string;
  teacherPhone?: string;
  teacherSharePercent?: number; // Customizable percentage, e.g. 50, 40, 60, etc.
  teacherShareAmount?: number; // Calculated share amount
  enrollmentDate: string;
  dueDate: string;
  totalFee: number;
  paidAmount: number;
  status: PaymentStatus;
  notes?: string;
  batchTiming?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string; // ISO date string
  receiptNo: string;
  remarks?: string;
  teacherId: string;
  teacherSharePercent?: number; // Customizable percentage
  teacherShareAmount: number; // Credited share amount
}

export interface TeacherPayout {
  id: string;
  teacherId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  remarks?: string;
}

export interface AcademySettings {
  academyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  upiId: string;
  defaultPin: string;
  currencySymbol: string;
}
