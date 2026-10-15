import React, { useState } from 'react';
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
  Building2,
  Briefcase,
  Calculator,
  HelpCircle,
  BadgePercent,
  Layers,
} from 'lucide-react';
import { Student, Course, PaymentRecord, Teacher, TeacherPayout } from '../types/academy';
import {
  calculateTeacherSalaries,
  calculateBiMonthlySalarySchedule,
  calculateFeeBreakdown,
  formatCurrency,
  formatDate,
} from '../utils/calculations';
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
  const bimonthlySchedule = calculateBiMonthlySalarySchedule(teachers, courses, students, payments, payouts);

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

  // Child-friendly 1-click calculator state
  const [calcInput, setCalcInput] = useState<number>(1000);
  const quickCalc = calculateFeeBreakdown(calcInput);

  return (
    <div className="space-y-6">
      {/* Academy Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/80 p-6 sm:p-8 text-white shadow-xl border border-amber-500/20">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Academy Central Management • Super Easy Hisaab</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              PR ACADEMY PORTAL
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Dance, Meditation, Acting, Guitar aur Sabhi Courses Ka Management — Sabhi Fees Ka
              <span className="text-amber-300 font-bold ml-1">50% Teacher</span>,
              <span className="text-orange-300 font-bold ml-1">10% Management</span>, aur
              <span className="text-blue-300 font-bold ml-1">40% Office</span> hisaab automatic!
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

      {/* KPI Cards Grid - All 6 Key Metrics (Admissions, Total Fees, Teacher 50%, Management 10%, Office 40%, Dues) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 shadow-xs transition-all hover:border-amber-400 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Admissions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-slate-900">{students.length}</div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Kul Bachche</span>
            <span className="text-amber-700 font-semibold group-hover:underline">Dekhein →</span>
          </div>
        </div>

        {/* Total Revenue (100% Fees) */}
        <div
          onClick={() => onNavigate('payments')}
          className="group cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3.5 sm:p-4 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Kul Jama Fees (100%)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-700">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-800">
            <span>Total Collected</span>
            <span className="font-semibold group-hover:underline">Payments →</span>
          </div>
        </div>

        {/* Teacher Share (50%) */}
        <div
          onClick={() => onNavigate('teachers')}
          className="group cursor-pointer rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-3.5 sm:p-4 shadow-xs transition-all hover:border-purple-400 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
              Teacher (50%)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-purple-900">
            {formatCurrency(bimonthlySchedule.academySplit.teacherShareAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-purple-800">
            <span>Baki: {formatCurrency(totalTeacherPendingPayout)}</span>
            <span className="font-bold underline">15/30 Tarikh →</span>
          </div>
        </div>

        {/* Management Share (10%) - AS REQUESTED */}
        <div
          onClick={() => onNavigate('teachers')}
          className="group cursor-pointer rounded-2xl border-2 border-orange-200 bg-orange-50/50 p-3.5 sm:p-4 shadow-xs transition-all hover:border-orange-400 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider">
              Management (10%)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-800">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-orange-900">
            {formatCurrency(bimonthlySchedule.academySplit.managementShareAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-orange-800">
            <span>10% Fixed Hissa</span>
            <span className="font-semibold group-hover:underline">Details →</span>
          </div>
        </div>

        {/* Office Share (40%) - AS REQUESTED */}
        <div
          onClick={() => onNavigate('teachers')}
          className="group cursor-pointer rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-3.5 sm:p-4 shadow-xs transition-all hover:border-blue-400 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
              Office (40%)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-blue-900">
            {formatCurrency(bimonthlySchedule.academySplit.officeShareAmount)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-blue-800">
            <span>40% Academy Fund</span>
            <span className="font-semibold group-hover:underline">Details →</span>
          </div>
        </div>

        {/* Pending Fees with WhatsApp Reminder notice */}
        <div
          onClick={() => onNavigate('students')}
          className="group cursor-pointer rounded-2xl border border-rose-200 bg-rose-50/40 p-3.5 sm:p-4 shadow-xs transition-all hover:border-rose-400 hover:shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Pending Fees
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-rose-600">
            {formatCurrency(totalPendingDues)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-rose-700">
            <span>{studentsWithDues.length} Bachcho Ki Baki</span>
            <span className="font-bold underline">WhatsApp →</span>
          </div>
        </div>
      </div>

      {/* FEES BATWARA BOARD & 15-YEAR-OLD CHILD FRIENDLY VISUAL HISAAB (50% Teacher + 10% Management + 40% Office = 100%) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 mb-1">
              <Layers className="h-3.5 w-3.5 text-amber-600" />
              <span>100% Fees Batwara Formula (Pura Transparent Hisaab)</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Sabhi Fees Ka Batwara: 50% Teacher + 10% Management + 40% Office
            </h2>
            <p className="text-xs text-slate-500">
              Har admission ya fee payment par yeh hisaab automatic nikalta hai taaki koi confusion na rahe.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Kul Jama Fees</span>
            <span className="text-lg font-black text-slate-900">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>

        {/* Visual 3-Way Color Bar */}
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
            <div
              style={{ width: '50%' }}
              className="bg-purple-600 h-full transition-all"
              title="50% Teacher Share"
            />
            <div
              style={{ width: '10%' }}
              className="bg-orange-500 h-full transition-all"
              title="10% Management Share"
            />
            <div
              style={{ width: '40%' }}
              className="bg-blue-600 h-full transition-all"
              title="40% Office Share"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
            {/* Teacher Share */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-purple-600 inline-block" />
                  Teacher Share (50%)
                </span>
                <span className="font-extrabold text-purple-950">
                  {formatCurrency(bimonthlySchedule.academySplit.teacherShareAmount)}
                </span>
              </div>
              <p className="text-[11px] text-purple-800/80 mt-1">
                📅 15 aur 30 tarikh ke bimonthly payout cycle me diya jata hai
              </p>
            </div>

            {/* Management Share */}
            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-900 flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-orange-500 inline-block" />
                  Management (10%)
                </span>
                <span className="font-extrabold text-orange-950">
                  {formatCurrency(bimonthlySchedule.academySplit.managementShareAmount)}
                </span>
              </div>
              <p className="text-[11px] text-orange-800/80 mt-1">
                💼 Management supervision aur operations ke liye alag nikalta hai
              </p>
            </div>

            {/* Office Share */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-blue-600 inline-block" />
                  Office Share (40%)
                </span>
                <span className="font-extrabold text-blue-950">
                  {formatCurrency(bimonthlySchedule.academySplit.officeShareAmount)}
                </span>
              </div>
              <p className="text-[11px] text-blue-800/80 mt-1">
                🏢 Academy rent, bijli, maintenance aur main office fund
              </p>
            </div>
          </div>
        </div>

        {/* 15-Year-Old Child Friendly Quick Simulator (Super Easy Calculator) */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                <Calculator className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Quick Hisaab Calculator (15 Saal Ka Baccha Bhi Samjhe)
                </span>
                <span className="text-[11px] text-slate-500">
                  Koi bhi fees amount daalein ya click karein — hisaab samne aa jayega:
                </span>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[500, 1000, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCalcInput(amt)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    calcInput === amt
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center">
            {/* Input */}
            <div className="sm:col-span-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Fees Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={calcInput || ''}
                  onChange={(e) => setCalcInput(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-xl border border-amber-300 bg-white py-1.5 pl-7 pr-3 text-base font-black text-slate-900 focus:border-amber-500 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {/* Live Split Badges */}
            <div className="sm:col-span-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-2">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">
                  🟣 Teacher (50%)
                </span>
                <span className="text-sm sm:text-base font-black text-purple-950">
                  {formatCurrency(quickCalc.teacherAmount)}
                </span>
                <span className="text-[9px] text-purple-700 block">15/30 Tarikh ko</span>
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50 p-2">
                <span className="text-[10px] font-bold text-orange-800 uppercase block">
                  🟠 Management (10%)
                </span>
                <span className="text-sm sm:text-base font-black text-orange-950">
                  {formatCurrency(quickCalc.managementAmount)}
                </span>
                <span className="text-[9px] text-orange-700 block">10% Kharch</span>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-2">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">
                  🔵 Office (40%)
                </span>
                <span className="text-sm sm:text-base font-black text-blue-950">
                  {formatCurrency(quickCalc.officeAmount)}
                </span>
                <span className="text-[9px] text-blue-700 block">Academy Bachath</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-amber-100 flex items-center justify-between">
            <span>
              💡 <strong>Aasan Niyam:</strong> Agar kisi student se{' '}
              <strong>{formatCurrency(calcInput)}</strong> fees li: Teacher ko{' '}
              <strong className="text-purple-700">{formatCurrency(quickCalc.teacherAmount)}</strong>,
              Management ko{' '}
              <strong className="text-orange-700">{formatCurrency(quickCalc.managementAmount)}</strong>,
              aur Office ke paas{' '}
              <strong className="text-blue-700">{formatCurrency(quickCalc.officeAmount)}</strong> bachenge.
            </span>
          </div>
        </div>
      </div>

      {/* 15 & 30 TARIKH SALARY PAYOUT SCHEDULE ALERT BANNER */}
      <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-white to-amber-50 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Automatic Salary Payout Schedule (15 & 30 Tarikh)
              </span>
              <span className="rounded-full bg-purple-200/80 px-2 py-0.2 text-[10px] font-bold text-purple-900">
                Rule Active
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              1 se 15 tarikh tak aane wali fees ➔ <strong className="text-amber-900">30 tarikh ko</strong>, aur 16 se 31 tarikh tak aane wali fees ➔ <strong className="text-purple-900">agli 15 tarikh ko</strong> teacher ko di jayegi.
              (Saath me 10% Management aur 40% Office hissa safe rahta hai).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 30th due pill */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">
                Agli 30 Tarikh ({bimonthlySchedule.next30thDateLabel})
              </span>
              <span className="text-base font-black text-amber-950">
                {formatCurrency(bimonthlySchedule.next30thTotalDue)}
              </span>
            </div>

            {/* 15th due pill */}
            <div className="rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2">
              <span className="text-[10px] font-bold uppercase text-purple-800 block">
                Agli 15 Tarikh ({bimonthlySchedule.next15thDateLabel})
              </span>
              <span className="text-base font-black text-purple-950">
                {formatCurrency(bimonthlySchedule.next15thTotalDue)}
              </span>
            </div>

            <button
              onClick={() => onNavigate('teachers')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs transition-all active:scale-95"
            >
              <span>Pura Schedule Dekhein</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
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

        {/* Right: Teachers & 15-30 Tarikh Schedule Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Teachers 15 & 30 Tarikh Payout Status
            </h2>
            <button
              onClick={() => onNavigate('teachers')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800"
            >
              Pura Schedule →
            </button>
          </div>

          {summaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <Wallet className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-bold text-slate-700">Koi teacher add nahi hua hai</p>
              <p className="mt-1 text-[11px] text-slate-400">
                Teacher add karein taaki unki 15 aur 30 tarikh ki automatic salary calculate ho sake.
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
              {summaries.map((summary) => {
                const sched = bimonthlySchedule.teacherSchedules.find((s) => s.teacher.id === summary.teacher.id);

                return (
                  <div
                    key={summary.teacher.id}
                    onClick={() => onNavigate('teachers')}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-purple-400 hover:shadow-md transition-all"
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

                    {/* Bi-Monthly 30th & 15th amounts preview */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-amber-50/80 p-2 border border-amber-200">
                        <span className="text-[10px] text-amber-900 uppercase font-bold block">
                          30 Tarikh ko Dena
                        </span>
                        <span className="font-black text-amber-950 text-sm">
                          {formatCurrency(sched?.amountDue30th || 0)}
                        </span>
                      </div>

                      <div className="rounded-xl bg-purple-50/80 p-2 border border-purple-200">
                        <span className="text-[10px] text-purple-900 uppercase font-bold block">
                          Agli 15 Tarikh ko Dena
                        </span>
                        <span className="font-black text-purple-950 text-sm">
                          {formatCurrency(sched?.amountDue15th || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>{summary.studentsCount} Students Enrolled</span>
                      <span className="font-bold text-purple-700 group-hover:underline">
                        Schedule Kholein →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
