import React from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Receipt,
} from 'lucide-react';
import { Student, Course, PaymentRecord, Teacher, TeacherPayout } from '../types/academy';
import { calculateTeacherSalaries, formatCurrency, formatDate } from '../utils/calculations';
import { NavTab } from './Navbar';

interface DashboardViewProps {
  students: Student[];
  courses: Course[];
  teachers: Teacher[];
  payments: PaymentRecord[];
  payouts: TeacherPayout[];
  onNavigate: (tab: NavTab) => void;
  onQuickAdmission: () => void;
  onAddCourse: () => void;
  onOpenWhatsApp: (student: Student) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  courses,
  teachers,
  payments,
  payouts,
  onNavigate,
  onQuickAdmission,
  onAddCourse,
  onOpenWhatsApp,
  onViewReceipt,
}) => {
  const summaries = calculateTeacherSalaries(teachers, courses, students, payments, payouts);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPendingDues = students.reduce(
    (sum, s) => sum + Math.max(0, s.totalFee - s.paidAmount),
    0
  );
  const totalTeacherSalaryEarned = summaries.reduce(
    (sum, s) => sum + s.totalCalculatedShare,
    0
  );
  const totalTeacherPendingPayout = summaries.reduce(
    (sum, s) => sum + s.balancePayable,
    0
  );

  const studentsWithDues = students.filter((s) => s.totalFee > s.paidAmount);
  const recentPayments = [...payments].slice(-5).reverse();
  const recentStudents = [...students].slice(-4).reverse();

  return (
    <div className="space-y-6">
      {/* Academy Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/80 p-6 sm:p-8 text-white shadow-xl border border-amber-500/20">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Academy Central Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              PR ACADEMY PORTAL
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Dance, Meditation, Acting, Guitar aur Sabhi Courses Ka Complete Management,
              WhatsApp Reminders, aur Customizable Teacher Salary Share (% Apne Hisaab Se Kam / Zyada).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onQuickAdmission}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Naya Admission</span>
            </button>
            <button
              onClick={onAddCourse}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 border border-white/10 transition-all"
            >
              <GraduationCap className="h-4 w-4 text-amber-400" />
              <span>+ Add Course</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-amber-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bachcho Ke Admissions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{students.length}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Enrolled Students</span>
            <span className="text-amber-700 font-semibold group-hover:underline">
              View All →
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div
          onClick={() => onNavigate('payments')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kul Jama Fees
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Collected Revenue</span>
            <span className="text-emerald-700 font-semibold group-hover:underline">
              Payments →
            </span>
          </div>
        </div>

        {/* Pending Fees with WhatsApp Reminder notice */}
        <div
          onClick={() => onNavigate('students')}
          className="group cursor-pointer rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs transition-all hover:border-rose-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Pending Fees (Due)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600">
            {formatCurrency(totalPendingDues)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-rose-700">
            <span>{studentsWithDues.length} Bachcho Ki Baki</span>
            <span className="font-bold underline">WhatsApp Reminder →</span>
          </div>
        </div>

        {/* Teacher Salary 50% Auto Share */}
        <div
          onClick={() => onNavigate('teachers')}
          className="group cursor-pointer rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs transition-all hover:border-purple-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Teacher Salary Share (% Hisaab)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-900">
            {formatCurrency(totalTeacherSalaryEarned)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-purple-800">
            <span>Baki: {formatCurrency(totalTeacherPendingPayout)}</span>
            <span className="font-bold underline">Hisaab Dekhein →</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Pending Dues (WhatsApp quick action) & Teacher 50% Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Pending Fees & WhatsApp Reminders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Fee Dues & WhatsApp Reminder Alert ({studentsWithDues.length})
              </h2>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Sabhi Admissions Dekhein →
            </button>
          </div>

          {students.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-bold text-slate-700">Koi student admission nahi hai</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Naye bache ka admission lene ke liye '+ Naya Admission' button dabayein.
              </p>
              <button
                onClick={onQuickAdmission}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Naya Admission</span>
              </button>
            </div>
          ) : studentsWithDues.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-2 text-xs font-bold text-emerald-800">
                Sabhi students ki fees poori jama hai! Koi pending fees nahi hai.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {studentsWithDues.slice(0, 4).map((student) => {
                const due = Math.max(0, student.totalFee - student.paidAmount);
                const course = courses.find((c) => c.id === student.courseId);

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 hover:shadow-xs transition-shadow"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {student.fullName}
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                          {student.rollNo}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {course?.title || 'Course'} • Due Date: {formatDate(student.dueDate)}
                      </div>
                      <div className="text-xs font-black text-rose-600 mt-1">
                        Pending Fee: {formatCurrency(due)}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenWhatsApp(student)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp Reminder</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Payment Receipts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Haal Hi Mein Jama Ki Gayi Fees (Recent Receipts)
              </span>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                Pura Payment Ledger →
              </button>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Abhi tak koi fees payment jama nahi hui hai.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.courseTitle} • {formatDate(p.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-black text-slate-900">{formatCurrency(p.amount)}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {p.paymentMethod}
                        </div>
                      </div>
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="View Receipt"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Teachers & 50% Share Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Teachers 50% Auto Share Status
            </h2>
            <button
              onClick={() => onNavigate('teachers')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700"
            >
              Vetan Hisaab →
            </button>
          </div>

          {summaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <Wallet className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-bold text-slate-700">Koi teacher add nahi hua hai</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Teacher add karein taaki unka 50% salary share auto-calculate ho sake.
              </p>
              <button
                onClick={() => onNavigate('teachers')}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Teacher</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {summaries.map((summary) => (
                <div
                  key={summary.teacher.id}
                  onClick={() => onNavigate('teachers')}
                  className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-amber-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${summary.teacher.avatarColor} text-white font-bold text-xs`}
                      >
                        {summary.teacher.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {summary.teacher.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span>{summary.teacher.specialty}</span>
                          {summary.teacher.phone && (
                            <span className="font-mono text-purple-700 font-medium">
                              • {summary.teacher.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                      {summary.teacher.sharePercentage || 50}% Share
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        Students
                      </span>
                      <span className="font-bold text-slate-800">{summary.studentsCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        Teacher Share
                      </span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(summary.totalCalculatedShare)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        Payable
                      </span>
                      <span className="font-black text-amber-700">
                        {formatCurrency(summary.balancePayable)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
