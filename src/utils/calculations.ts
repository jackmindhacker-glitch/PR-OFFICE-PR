import { Course, PaymentRecord, Student, Teacher, TeacherPayout } from '../types/academy';

export interface TeacherSalarySummary {
  teacher: Teacher;
  coursesCount: number;
  studentsCount: number;
  totalCourseRevenue: number;
  totalCalculatedShare: number; // 50% automatic share
  totalPaidOut: number;
  balancePayable: number;
  studentBreakdown: {
    studentId: string;
    studentName: string;
    courseTitle: string;
    coursePrice: number;
    paidAmount: number;
    teacherShareEarned: number;
    enrollmentDate: string;
  }[];
}

export function formatCurrency(amount: number): string {
  return '₹' + (amount || 0).toLocaleString('en-IN');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates the 50% automatic teacher share for each teacher.
 * As required:
 * "ek new column jisme Likha Ho teacher salary Usman Sabhi course Jaise dance meditation guitar
 * Sabhi Ke Alag Alag Teacher Hai her course purchase karne Ke baad 50% automatic teacher K Kollam
 * mein Ad Hojai Jise ki pata chal Sake K teacher key payment kitni Ban Gayi Hai"
 */
export function calculateTeacherSalaries(
  teachers: Teacher[],
  courses: Course[],
  students: Student[],
  payments: PaymentRecord[],
  payouts: TeacherPayout[]
): TeacherSalarySummary[] {
  const courseMap = new Map<string, Course>();
  courses.forEach((c) => courseMap.set(c.id, c));

  return teachers.map((teacher) => {
    // Find courses taught by this teacher
    const teacherCourses = courses.filter((c) => c.teacherId === teacher.id);
    const teacherCourseIds = new Set(teacherCourses.map((c) => c.id));

    // Find all students directly assigned to this teacher OR enrolled in teacher's course
    const teacherStudents = students.filter(
      (s) =>
        s.teacherId === teacher.id ||
        (s.teacherName && s.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase()) ||
        teacherCourseIds.has(s.courseId)
    );

    let totalCourseRevenue = 0;
    let totalCalculatedShare = 0;

    const studentBreakdown: TeacherSalarySummary['studentBreakdown'] = [];

    teacherStudents.forEach((student) => {
      const course = courseMap.get(student.courseId);
      const coursePrice = student.totalFee || (course ? course.price : 0);
      
      // If student has paid amount, calculate on collected fees; if 0 paid, calculate on enrolled admission fee
      const effectiveAmount = student.paidAmount > 0 ? student.paidAmount : student.totalFee;
      totalCourseRevenue += student.paidAmount > 0 ? student.paidAmount : student.totalFee;

      // 50% share on course purchase / student admission
      const sharePct = (teacher.sharePercentage || 50) / 100;
      const shareEarned = Math.round(effectiveAmount * sharePct);
      totalCalculatedShare += shareEarned;

      studentBreakdown.push({
        studentId: student.id,
        studentName: student.fullName,
        courseTitle: student.courseTitle || (course ? course.title : 'Course'),
        coursePrice,
        paidAmount: student.paidAmount,
        teacherShareEarned: shareEarned,
        enrollmentDate: student.enrollmentDate,
      });
    });

    // Payouts made to this teacher
    const teacherPayouts = payouts.filter((p) => p.teacherId === teacher.id);
    const totalPaidOut = teacherPayouts.reduce((sum, p) => sum + p.amount, 0);

    const balancePayable = Math.max(0, totalCalculatedShare - totalPaidOut);

    return {
      teacher,
      coursesCount: teacherCourses.length,
      studentsCount: teacherStudents.length,
      totalCourseRevenue,
      totalCalculatedShare,
      totalPaidOut,
      balancePayable,
      studentBreakdown,
    };
  });
}
