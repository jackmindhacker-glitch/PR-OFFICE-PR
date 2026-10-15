import { Course, PaymentRecord, Student, Teacher, TeacherPayout } from '../types/academy';

export interface TeacherSalarySummary {
  teacher: Teacher;
  coursesCount: number;
  studentsCount: number;
  totalCourseRevenue: number;
  totalCalculatedShare: number; // calculated share based on custom % (default 50%)
  totalPaidOut: number;
  balancePayable: number;
  studentBreakdown: {
    studentId: string;
    studentName: string;
    courseTitle: string;
    coursePrice: number;
    paidAmount: number;
    teacherSharePercent: number; // e.g. 50, 40, 60
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

      // Customizable share %: prefer student-specific percentage, fallback to course percentage, fallback to teacher's percentage, fallback to 50%
      const effectivePercent = student.teacherSharePercent ?? course?.teacherSharePercent ?? teacher.sharePercentage ?? 50;
      const sharePct = effectivePercent / 100;
      const shareEarned = Math.round(effectiveAmount * sharePct);
      totalCalculatedShare += shareEarned;

      studentBreakdown.push({
        studentId: student.id,
        studentName: student.fullName,
        courseTitle: student.courseTitle || (course ? course.title : 'Course'),
        coursePrice,
        paidAmount: student.paidAmount,
        teacherSharePercent: effectivePercent,
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

export interface PayoutCycleTransaction {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNo?: string;
  courseTitle: string;
  feeAmount: number;
  transactionDate: string;
  teacherId: string;
  teacherName: string;
  teacherSharePercent: number;
  teacherShareAmount: number;
  collectionCycle: '1-15' | '16-end';
  collectionCycleLabel: string; // "1 se 15 [Month] ki Fees" or "16 se 31 [Month] ki Fees"
  targetPayoutDate: string; // YYYY-MM-DD
  targetPayoutDateLabel: string; // e.g. "30 Oct 2026" or "15 Nov 2026"
  targetPayoutDay: 15 | 30;
  cycleKey: string; // e.g. "2026-10-30" or "2026-11-15"
  cycleName: string;
  isPayoutSettled?: boolean;
}

export interface TeacherCycleSchedule {
  teacher: Teacher;
  amountDue15th: number; // Scheduled for 15th
  amountDue30th: number; // Scheduled for 30th
  totalPaidOut: number;
  totalEarned: number;
  balancePayable: number;
  cycle15Transactions: PayoutCycleTransaction[];
  cycle30Transactions: PayoutCycleTransaction[];
}

export interface BiMonthlySalarySchedule {
  next15thTotalDue: number;
  next30thTotalDue: number;
  next15thDateLabel: string;
  next30thDateLabel: string;
  activeCycleStatus: {
    currentDateLabel: string;
    currentCycle: '1-15' | '16-end';
    cycleHeading: string;
    targetPayoutDateLabel: string;
    daysRemaining: number;
    explanation: string;
  };
  teacherSchedules: TeacherCycleSchedule[];
  allTransactions: PayoutCycleTransaction[];
  availableCycles: { key: string; label: string; payoutDate: string; count: number; totalAmount: number }[];
}

/**
 * Given a transaction/admission date, returns which payout cycle it belongs to:
 * - 1st to 15th fees -> Paid on 30th of CURRENT month (or 28/29 Feb)
 * - 16th to 31st fees -> Paid on 15th of NEXT month
 */
export function getPayoutCycleForDate(dateStr: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const validD = isNaN(d.getTime()) ? new Date() : d;
  const year = validD.getFullYear();
  const month = validD.getMonth(); // 0 to 11
  const day = validD.getDate();

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (day <= 15) {
    // 1st to 15th -> Paid on 30th of this month
    const isFeb = month === 1;
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const payoutDay = isFeb ? (isLeap ? 29 : 28) : 30;
    const payoutDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(payoutDay).padStart(2, '0')}`;
    const cycleKey = `${year}-${String(month + 1).padStart(2, '0')}-30`;

    return {
      collectionCycle: '1-15' as const,
      collectionCycleLabel: `1 se 15 ${shortMonths[month]} ki Fees`,
      targetPayoutDate: payoutDate,
      targetPayoutDateLabel: `${payoutDay} ${shortMonths[month]} ${year}`,
      targetPayoutDay: 30 as const,
      cycleKey,
      cycleName: `30 Tarikh Payout (1-15 ${shortMonths[month]})`,
      monthName: fullMonths[month],
      monthShort: shortMonths[month],
      year,
    };
  } else {
    // 16th to 31st -> Paid on 15th of NEXT month
    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    const payoutDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-15`;
    const cycleKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-15`;

    return {
      collectionCycle: '16-end' as const,
      collectionCycleLabel: `16 se 31 ${shortMonths[month]} ki Fees`,
      targetPayoutDate: payoutDate,
      targetPayoutDateLabel: `15 ${shortMonths[nextMonth]} ${nextYear}`,
      targetPayoutDay: 15 as const,
      cycleKey,
      cycleName: `Agli 15 Tarikh Payout (16-31 ${shortMonths[month]})`,
      monthName: fullMonths[month],
      monthShort: shortMonths[month],
      year,
    };
  }
}

/**
 * Calculates complete bi-monthly salary schedules for all teachers:
 * - Automatically computes how much payment is due on the 15th
 * - Automatically computes how much payment is due on the 30th
 * - Groups admissions/fees into 1-15 (due 30th) and 16-31 (due next 15th)
 */
export function calculateBiMonthlySalarySchedule(
  teachers: Teacher[],
  courses: Course[],
  students: Student[],
  payments: PaymentRecord[],
  payouts: TeacherPayout[]
): BiMonthlySalarySchedule {
  const courseMap = new Map<string, Course>();
  courses.forEach((c) => courseMap.set(c.id, c));

  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => teacherMap.set(t.id, t));

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  // Determine current active cycle based on today's date
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate upcoming 15th and 30th dates
  let next15thDate: Date;
  let next30thDate: Date;

  if (currentDay < 15) {
    next15thDate = new Date(currentYear, currentMonth, 15);
    next30thDate = new Date(currentYear, currentMonth, 30);
  } else if (currentDay < 30) {
    next30thDate = new Date(currentYear, currentMonth, 30);
    // next 15th is next month
    next15thDate = new Date(currentYear, currentMonth + 1, 15);
  } else {
    // End of month, next is 15th next month, then 30th next month
    next15thDate = new Date(currentYear, currentMonth + 1, 15);
    next30thDate = new Date(currentYear, currentMonth + 1, 30);
  }

  const next15thDateLabel = `${next15thDate.getDate()} ${shortMonths[next15thDate.getMonth()]} ${next15thDate.getFullYear()}`;
  const next30thDateLabel = `${next30thDate.getDate()} ${shortMonths[next30thDate.getMonth()]} ${next30thDate.getFullYear()}`;

  const isCurrentFirstHalf = currentDay <= 15;
  const activeTargetPayout = isCurrentFirstHalf
    ? `30 ${shortMonths[currentMonth]} ${currentYear}`
    : `15 ${shortMonths[(currentMonth + 1) % 12]} ${currentMonth === 11 ? currentYear + 1 : currentYear}`;

  const targetDateForRemaining = isCurrentFirstHalf ? next30thDate : next15thDate;
  const diffTime = targetDateForRemaining.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const activeCycleStatus = {
    currentDateLabel: formatDate(now.toISOString()),
    currentCycle: (isCurrentFirstHalf ? '1-15' : '16-end') as '1-15' | '16-end',
    cycleHeading: isCurrentFirstHalf
      ? `Active Window: 1 se 15 ${shortMonths[currentMonth]} Fees Collection`
      : `Active Window: 16 se 31 ${shortMonths[currentMonth]} Fees Collection`,
    targetPayoutDateLabel: activeTargetPayout,
    daysRemaining,
    explanation: isCurrentFirstHalf
      ? `Abhi 1 se 15 ${shortMonths[currentMonth]} ke beech fees collection ho rahi hai. Is dauran aane wali sabhi fees ka teacher share 30 ${shortMonths[currentMonth]} ko diya jayega.`
      : `Abhi 16 se 31 ${shortMonths[currentMonth]} ke beech fees collection ho rahi hai. Is dauran aane wali sabhi fees ka teacher share agli 15 ${shortMonths[(currentMonth + 1) % 12]} ko diya jayega.`,
  };

  // Build all payout cycle transactions
  const allTransactions: PayoutCycleTransaction[] = [];
  const processedPaymentIds = new Set<string>();

  // 1. Process payment records
  payments.forEach((p) => {
    processedPaymentIds.add(p.id);
    const student = studentMap.get(p.studentId);
    let teacher = teacherMap.get(p.teacherId);

    if (!teacher && student?.teacherId) {
      teacher = teacherMap.get(student.teacherId);
    }
    if (!teacher && student?.teacherName) {
      teacher = teachers.find(
        (t) => t.name.trim().toLowerCase() === student.teacherName?.trim().toLowerCase()
      );
    }
    if (!teacher) {
      // Find teacher via course
      const course = courses.find((c) => c.title === p.courseTitle);
      if (course?.teacherId) {
        teacher = teacherMap.get(course.teacherId);
      }
    }

    const effectivePercent =
      p.teacherSharePercent ??
      student?.teacherSharePercent ??
      teacher?.sharePercentage ??
      50;

    const teacherShareAmount =
      p.teacherShareAmount > 0
        ? p.teacherShareAmount
        : Math.round(p.amount * (effectivePercent / 100));

    const cycleInfo = getPayoutCycleForDate(p.date);

    allTransactions.push({
      id: p.id,
      studentId: p.studentId,
      studentName: p.studentName || student?.fullName || 'Student',
      studentRollNo: student?.rollNo,
      courseTitle: p.courseTitle || student?.courseTitle || 'Course',
      feeAmount: p.amount,
      transactionDate: p.date,
      teacherId: teacher?.id || p.teacherId || '',
      teacherName: teacher?.name || student?.teacherName || 'Instructor',
      teacherSharePercent: effectivePercent,
      teacherShareAmount,
      collectionCycle: cycleInfo.collectionCycle,
      collectionCycleLabel: cycleInfo.collectionCycleLabel,
      targetPayoutDate: cycleInfo.targetPayoutDate,
      targetPayoutDateLabel: cycleInfo.targetPayoutDateLabel,
      targetPayoutDay: cycleInfo.targetPayoutDay,
      cycleKey: cycleInfo.cycleKey,
      cycleName: cycleInfo.cycleName,
    });
  });

  // 2. If any student has paidAmount > 0 (or admission) but no corresponding payment record,
  // include their enrollment fee
  students.forEach((student) => {
    const hasExistingPayment = payments.some((p) => p.studentId === student.id);
    if (!hasExistingPayment && (student.paidAmount > 0 || student.totalFee > 0)) {
      const course = courseMap.get(student.courseId);
      let teacher = student.teacherId ? teacherMap.get(student.teacherId) : undefined;
      if (!teacher && student.teacherName) {
        teacher = teachers.find(
          (t) => t.name.trim().toLowerCase() === student.teacherName?.trim().toLowerCase()
        );
      }
      if (!teacher && course?.teacherId) {
        teacher = teacherMap.get(course.teacherId);
      }

      const effectiveFee = student.paidAmount > 0 ? student.paidAmount : student.totalFee;
      const effectivePercent =
        student.teacherSharePercent ??
        course?.teacherSharePercent ??
        teacher?.sharePercentage ??
        50;
      const shareEarned = Math.round(effectiveFee * (effectivePercent / 100));
      const cycleInfo = getPayoutCycleForDate(student.enrollmentDate);

      allTransactions.push({
        id: `adm-${student.id}`,
        studentId: student.id,
        studentName: student.fullName,
        studentRollNo: student.rollNo,
        courseTitle: student.courseTitle || course?.title || 'Course',
        feeAmount: effectiveFee,
        transactionDate: student.enrollmentDate,
        teacherId: teacher?.id || student.teacherId || '',
        teacherName: teacher?.name || student.teacherName || 'Instructor',
        teacherSharePercent: effectivePercent,
        teacherShareAmount: shareEarned,
        collectionCycle: cycleInfo.collectionCycle,
        collectionCycleLabel: cycleInfo.collectionCycleLabel,
        targetPayoutDate: cycleInfo.targetPayoutDate,
        targetPayoutDateLabel: cycleInfo.targetPayoutDateLabel,
        targetPayoutDay: cycleInfo.targetPayoutDay,
        cycleKey: cycleInfo.cycleKey,
        cycleName: cycleInfo.cycleName,
      });
    }
  });

  // Build teacher schedules
  let next15thTotalDue = 0;
  let next30thTotalDue = 0;

  const teacherSchedules: TeacherCycleSchedule[] = teachers.map((teacher) => {
    // Filter transactions for this teacher
    const teacherTxns = allTransactions.filter(
      (tx) =>
        tx.teacherId === teacher.id ||
        (tx.teacherName && tx.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase())
    );

    const cycle15Transactions = teacherTxns.filter((tx) => tx.targetPayoutDay === 15);
    const cycle30Transactions = teacherTxns.filter((tx) => tx.targetPayoutDay === 30);

    const earned15th = cycle15Transactions.reduce((sum, tx) => sum + tx.teacherShareAmount, 0);
    const earned30th = cycle30Transactions.reduce((sum, tx) => sum + tx.teacherShareAmount, 0);

    const teacherPayouts = payouts.filter((p) => p.teacherId === teacher.id);
    const totalPaidOut = teacherPayouts.reduce((sum, p) => sum + p.amount, 0);

    // Approximate breakdown of payouts between 15th and 30th cycles if specified
    const paidFor15th = teacherPayouts
      .filter((p) => p.payoutCycle === '15th')
      .reduce((sum, p) => sum + p.amount, 0);
    const paidFor30th = teacherPayouts
      .filter((p) => p.payoutCycle === '30th')
      .reduce((sum, p) => sum + p.amount, 0);
    const paidUnspecified = teacherPayouts
      .filter((p) => !p.payoutCycle || p.payoutCycle === 'custom')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalEarned = earned15th + earned30th;
    const balancePayable = Math.max(0, totalEarned - totalPaidOut);

    // Calculate remaining due for 15th and 30th
    const amountDue15th = Math.max(0, earned15th - paidFor15th);
    const amountDue30th = Math.max(0, earned30th - paidFor30th);

    next15thTotalDue += amountDue15th;
    next30thTotalDue += amountDue30th;

    return {
      teacher,
      amountDue15th,
      amountDue30th,
      totalPaidOut,
      totalEarned,
      balancePayable,
      cycle15Transactions,
      cycle30Transactions,
    };
  });

  // Extract unique available cycles for filtering
  const cycleMap = new Map<string, { key: string; label: string; payoutDate: string; count: number; totalAmount: number }>();
  allTransactions.forEach((tx) => {
    const existing = cycleMap.get(tx.cycleKey);
    if (existing) {
      existing.count += 1;
      existing.totalAmount += tx.teacherShareAmount;
    } else {
      cycleMap.set(tx.cycleKey, {
        key: tx.cycleKey,
        label: tx.cycleName,
        payoutDate: tx.targetPayoutDateLabel,
        count: 1,
        totalAmount: tx.teacherShareAmount,
      });
    }
  });

  const availableCycles = Array.from(cycleMap.values()).sort((a, b) => b.key.localeCompare(a.key));

  return {
    next15thTotalDue,
    next30thTotalDue,
    next15thDateLabel,
    next30thDateLabel,
    activeCycleStatus,
    teacherSchedules,
    allTransactions,
    availableCycles,
  };
}
