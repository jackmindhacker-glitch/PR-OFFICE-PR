import React, { useState } from 'react';
import {
  Wallet,
  Users,
  Percent,
  Plus,
  ArrowRight,
  CheckCircle2,
  Receipt,
  TrendingUp,
  AlertCircle,
  Phone,
  Sparkles,
  Trash2,
  Calendar,
  Clock,
  Filter,
  Check,
  Copy,
  Search,
  ChevronRight,
  ArrowUpRight,
  HelpCircle,
} from 'lucide-react';
import {
  Teacher,
  Course,
  Student,
  PaymentRecord,
  TeacherPayout,
  PaymentMethod,
} from '../types/academy';
import {
  calculateTeacherSalaries,
  calculateBiMonthlySalarySchedule,
  formatCurrency,
  formatDate,
  TeacherSalarySummary,
  PayoutCycleTransaction,
} from '../utils/calculations';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface TeachersSalaryViewProps {
  teachers: Teacher[];
  courses: Course[];
  students: Student[];
  payments: PaymentRecord[];
  payouts: TeacherPayout[];
  onAddTeacher: (teacher: Teacher) => void;
  onEditTeacher: (teacher: Teacher) => void;
  onRecordPayout: (payout: Omit<TeacherPayout, 'id'>) => void;
  onViewPayoutVoucher: (payout: TeacherPayout, teacher: Teacher) => void;
  onDeletePayout?: (payoutId: string) => void;
  onDeleteTeacher?: (teacherId: string) => void;
  onUpdateStudentShare?: (studentId: string, newPercent: number) => void;
}

export type SalaryDesktopTab = 'schedule' | 'teachers' | 'history';

export const TeachersSalaryView: React.FC<TeachersSalaryViewProps> = ({
  teachers,
  courses,
  students,
  payments,
  payouts,
  onAddTeacher,
  onEditTeacher,
  onRecordPayout,
  onViewPayoutVoucher,
  onDeletePayout,
  onDeleteTeacher,
  onUpdateStudentShare,
}) => {
  // Bi-Monthly Salary Calculations (Automatic 15th & 30th Payout Schedule)
  const schedule = calculateBiMonthlySalarySchedule(teachers, courses, students, payments, payouts);
  const summaries = calculateTeacherSalaries(teachers, courses, students, payments, payouts);

  // Desktop active tab
  const [activeTab, setActiveTab] = useState<SalaryDesktopTab>('schedule');

  // Filters for Tab 1 (Schedule)
  const [cycleFilter, setCycleFilter] = useState<'all' | '15th' | '30th'>('all');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const [searchTxn, setSearchTxn] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  // Selected teacher in Master-Detail view (Tab 2)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id || ''
  );

  // Modals state
  const [payoutToDelete, setPayoutToDelete] = useState<TeacherPayout | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Quick student share adjustment modal
  const [studentToAdjust, setStudentToAdjust] = useState<{
    studentId: string;
    studentName: string;
    courseTitle: string;
    currentPercent: number;
  } | null>(null);
  const [adjustPercentVal, setAdjustPercentVal] = useState<number>(50);

  // Teacher Add/Edit Modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [tName, setTName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tSpecialty, setTSpecialty] = useState('Dance');
  const [tUpi, setTUpi] = useState('');
  const [tShare, setTShare] = useState<number>(50);

  // Payout Modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutTeacher, setPayoutTeacher] = useState<Teacher | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('UPI');
  const [payoutRemarks, setPayoutRemarks] = useState('');
  const [payoutCycleChoice, setPayoutCycleChoice] = useState<'15th' | '30th' | 'custom'>('custom');
  const [payoutCyclePeriod, setPayoutCyclePeriod] = useState<string>('');
  const [payoutTargetDate, setPayoutTargetDate] = useState<string>('');

  // Overall totals
  const totalSalariesEarned = summaries.reduce((sum, s) => sum + s.totalCalculatedShare, 0);
  const totalDisbursed = summaries.reduce((sum, s) => sum + s.totalPaidOut, 0);
  const totalPendingPayout = summaries.reduce((sum, s) => sum + s.balancePayable, 0);

  const currentSummary = summaries.find((s) => s.teacher.id === selectedTeacherId) || summaries[0];

  const handleCopyUpi = (upi: string) => {
    if (!upi) return;
    try {
      navigator.clipboard.writeText(upi);
      setCopiedUpi(upi);
      setTimeout(() => setCopiedUpi(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setTName('');
    setTPhone('');
    setTSpecialty('Dance (Bollywood & Freestyle)');
    setTUpi('');
    setTShare(50);
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTName(teacher.name);
    setTPhone(teacher.phone);
    setTSpecialty(teacher.specialty);
    setTUpi(teacher.upiOrBank);
    setTShare(teacher.sharePercentage || 50);
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName.trim()) return;

    if (editingTeacher) {
      onEditTeacher({
        ...editingTeacher,
        name: tName.trim(),
        phone: tPhone.trim(),
        specialty: tSpecialty.trim(),
        upiOrBank: tUpi.trim(),
        sharePercentage: Number(tShare) || 50,
      });
    } else {
      const colors = [
        'from-amber-500 to-orange-600',
        'from-emerald-500 to-teal-600',
        'from-purple-500 to-indigo-600',
        'from-blue-500 to-cyan-600',
        'from-rose-500 to-pink-600',
      ];
      onAddTeacher({
        id: `tch-${Date.now()}`,
        name: tName.trim(),
        phone: tPhone.trim(),
        specialty: tSpecialty.trim(),
        upiOrBank: tUpi.trim(),
        sharePercentage: Number(tShare) || 50,
        joinDate: new Date().toISOString().split('T')[0],
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setIsTeacherModalOpen(false);
  };

  // Open payout modal specifically for 15th, 30th, or custom
  const handleOpenPayoutModal = (
    teacher: Teacher,
    cycle: '15th' | '30th' | 'custom' = 'custom',
    suggestedAmount?: number,
    periodLabel?: string,
    targetDate?: string
  ) => {
    setPayoutTeacher(teacher);
    setPayoutCycleChoice(cycle);
    setPayoutCyclePeriod(periodLabel || '');
    setPayoutTargetDate(targetDate || '');
    setPayoutMethod('UPI');

    if (suggestedAmount !== undefined && suggestedAmount > 0) {
      setPayoutAmount(suggestedAmount);
    } else {
      const sum = summaries.find((s) => s.teacher.id === teacher.id);
      setPayoutAmount(sum && sum.balancePayable > 0 ? sum.balancePayable : 1000);
    }

    if (cycle === '30th') {
      setPayoutRemarks(`30 Tarikh Salary Payout (1 se 15 Fees Collection) - ${teacher.name}`);
    } else if (cycle === '15th') {
      setPayoutRemarks(`15 Tarikh Salary Payout (16 se 31 Fees Collection) - ${teacher.name}`);
    } else {
      setPayoutRemarks(`Salary disbursement for ${teacher.name}`);
    }

    setIsPayoutModalOpen(true);
  };

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutTeacher || payoutAmount <= 0) return;

    onRecordPayout({
      teacherId: payoutTeacher.id,
      amount: Number(payoutAmount),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: payoutMethod,
      referenceNo: `SAL-${Date.now().toString().slice(-6)}`,
      remarks: payoutRemarks,
      payoutCycle: payoutCycleChoice,
      cyclePeriod: payoutCyclePeriod,
      targetPayoutDate: payoutTargetDate,
    });

    setIsPayoutModalOpen(false);
  };

  // Filtered transactions for the ledger
  const filteredTransactions = schedule.allTransactions.filter((tx) => {
    if (cycleFilter === '15th' && tx.targetPayoutDay !== 15) return false;
    if (cycleFilter === '30th' && tx.targetPayoutDay !== 30) return false;
    if (teacherFilter !== 'all' && tx.teacherId !== teacherFilter) return false;
    if (searchTxn.trim()) {
      const q = searchTxn.toLowerCase();
      const matchName = tx.studentName.toLowerCase().includes(q);
      const matchCourse = tx.courseTitle.toLowerCase().includes(q);
      const matchTeacher = tx.teacherName.toLowerCase().includes(q);
      if (!matchName && !matchCourse && !matchTeacher) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 p-6 sm:p-7 text-white shadow-xl border border-purple-500/20">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/30">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Bi-Monthly Automatic Salary System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex flex-wrap items-center gap-2.5">
              <span>Teacher Salary & 15-30 Tarikh Payout Schedule</span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                15th & 30th Auto Rule Active
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Admission hone ke baad teacher ka percent automatic calculate hota hai:
              <strong className="text-amber-300 font-semibold ml-1">
                1 se 15 tarikh tak aane wali fees ➔ 30 tarikh ko
              </strong>, aur
              <strong className="text-purple-300 font-semibold ml-1">
                16 se 31 tarikh tak aane wali fees ➔ agli 15 tarikh ko
              </strong> teacher ko di jayegi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddTeacher}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>+ Naya Teacher Add Karein</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* AUTOMATIC 15 & 30 TARIKH STAT CARDS (USER REQUESTED: HAMEN AUTOMATIC PATA HO KI 15 TARIKH KO KITNE DENI HAI AUR 30 KO KITNI DENI HAI) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Agli 15 Tarikh ko Kitna Dena Hai */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-purple-50/50 p-5 shadow-xs transition-all hover:border-purple-400 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Agli 15 Tarikh ko Dena Hai
              </span>
            </div>
            <span className="rounded-full bg-purple-200/80 px-2.5 py-0.5 text-[11px] font-bold text-purple-900">
              {schedule.next15thDateLabel}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-black text-purple-950">
              {formatCurrency(schedule.next15thTotalDue)}
            </div>
            <p className="mt-1 text-xs text-purple-800/90 font-medium">
              16 se 31 tarikh ke beech aane wali fees ka teacher share
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              {schedule.teacherSchedules.filter((t) => t.amountDue15th > 0).length} Teachers ko payment scheduled
            </span>
            <button
              onClick={() => {
                setActiveTab('schedule');
                setCycleFilter('15th');
              }}
              className="inline-flex items-center gap-1 font-bold text-purple-700 hover:text-purple-900 underline"
            >
              <span>Details Dekhein</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Agli 30 Tarikh ko Kitna Dena Hai */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 p-5 shadow-xs transition-all hover:border-amber-400 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Agli 30 Tarikh ko Dena Hai
              </span>
            </div>
            <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
              {schedule.next30thDateLabel}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-black text-amber-950">
              {formatCurrency(schedule.next30thTotalDue)}
            </div>
            <p className="mt-1 text-xs text-amber-800/90 font-medium">
              1 se 15 tarikh ke beech aane wali fees ka teacher share
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              {schedule.teacherSchedules.filter((t) => t.amountDue30th > 0).length} Teachers ko payment scheduled
            </span>
            <button
              onClick={() => {
                setActiveTab('schedule');
                setCycleFilter('30th');
              }}
              className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 underline"
            >
              <span>Details Dekhein</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Active Collection Cycle Status & Rule */}
        <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Current Collection Status
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
              {schedule.activeCycleStatus.daysRemaining} Din Baki
            </span>
          </div>

          <div className="mt-3">
            <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>{schedule.activeCycleStatus.cycleHeading}</span>
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-snug">
              {schedule.activeCycleStatus.explanation}
            </p>
          </div>

          <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>Target Payout Date: {schedule.activeCycleStatus.targetPayoutDateLabel}</span>
          </div>
        </div>
      </div>

      {/* Secondary Aggregate Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Kul Teacher Share</span>
            <span className="text-lg font-black text-slate-900">{formatCurrency(totalSalariesEarned)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Diya Gaya Vetan (Paid)</span>
            <span className="text-lg font-black text-blue-700">{formatCurrency(totalDisbursed)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Wallet className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Baki Kul Balance</span>
            <span className="text-lg font-black text-amber-700">{formatCurrency(totalPendingPayout)}</span>
          </div>
        </div>
      </div>

      {/* Main Desktop Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>📅 15 & 30 Tarikh Salary Schedule (Automatic Hisaab)</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
            {schedule.teacherSchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'teachers'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>👤 Teacher Profiles & Share % Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>📜 Diya Gaya Vetan (Payout History & Vouchers)</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 font-mono">
            {payouts.length}
          </span>
        </button>
      </div>

      {/* TAB 1: 15 & 30 TARIKH SALARY SCHEDULE (THE HERO AUTOMATED DESKTOP VIEW) */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Quick Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Cycle Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter Cycle:</span>
              </span>
              <button
                onClick={() => setCycleFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  cycleFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Dono Cycles (Sabhi)
              </button>
              <button
                onClick={() => setCycleFilter('30th')}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  cycleFilter === '30th'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>🗓️ 30 Tarikh Payout (1-15 Fees)</span>
                <span className="rounded-full bg-white/30 px-1.5 py-0.2 text-[10px]">
                  {formatCurrency(schedule.next30thTotalDue)}
                </span>
              </button>
              <button
                onClick={() => setCycleFilter('15th')}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  cycleFilter === '15th'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <span>🗓️ 15 Tarikh Payout (16-31 Fees)</span>
                <span className="rounded-full bg-white/30 px-1.5 py-0.2 text-[10px]">
                  {formatCurrency(schedule.next15thTotalDue)}
                </span>
              </button>
            </div>

            {/* Teacher selector filter */}
            <div className="flex items-center gap-2">
              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Sabhi Teachers ({teachers.length})</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Payout Schedule Cards */}
          {schedule.teacherSchedules.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">Abhi koi Teacher add nahi hua hai</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Teacher add karein taaki unki 15 aur 30 tarikh ki automatic salary schedule ban sake.
              </p>
              <button
                onClick={handleOpenAddTeacher}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>+ Naya Teacher Add Karein</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span>Teacher-wise 15 & 30 Tarikh Payout Calculation</span>
                  <span className="text-xs text-purple-700 normal-case font-medium">
                    (Her admission ke baad hisaab auto-update hota hai)
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedule.teacherSchedules
                  .filter((ts) => teacherFilter === 'all' || ts.teacher.id === teacherFilter)
                  .map((ts) => {
                    const t = ts.teacher;
                    const defaultPct = t.sharePercentage || 50;

                    return (
                      <div
                        key={t.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Top Info */}
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${t.avatarColor} text-white font-black text-base shadow-sm`}
                              >
                                {t.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                                  <span>{t.name}</span>
                                  <span className="rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-[11px] font-bold border border-purple-200">
                                    {defaultPct}% Share
                                  </span>
                                </h3>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>{t.specialty}</span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-700">{t.phone || 'No phone'}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleOpenEditTeacher(t)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Teacher Edit Karein"
                            >
                              ✎
                            </button>
                          </div>

                          {/* UPI Copy Box */}
                          {t.upiOrBank && (
                            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-600 border border-slate-100">
                              <span className="font-mono text-[11px]">UPI: {t.upiOrBank}</span>
                              <button
                                onClick={() => handleCopyUpi(t.upiOrBank)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 hover:text-purple-900"
                              >
                                {copiedUpi === t.upiOrBank ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    <span className="text-emerald-700">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy UPI</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Bi-Monthly Cycles Split Box (15th vs 30th) */}
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            {/* 30th Payout Due */}
                            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                                  30 Tarikh ko Dena
                                </span>
                                <span className="text-[10px] font-semibold text-amber-800">
                                  1-15 Fees
                                </span>
                              </div>
                              <div className="text-xl font-black text-amber-950">
                                {formatCurrency(ts.amountDue30th)}
                              </div>
                              <div className="text-[10px] text-amber-800">
                                {ts.cycle30Transactions.length} Fees Transactions
                              </div>
                              <button
                                onClick={() =>
                                  handleOpenPayoutModal(
                                    t,
                                    '30th',
                                    ts.amountDue30th > 0 ? ts.amountDue30th : undefined,
                                    '1-15 Fees (Due 30th)',
                                    schedule.next30thDateLabel
                                  )
                                }
                                disabled={ts.amountDue30th <= 0}
                                className={`mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                  ts.amountDue30th > 0
                                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-xs cursor-pointer'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <Wallet className="h-3 w-3" />
                                <span>Pay 30 Tarikh Salary</span>
                              </button>
                            </div>

                            {/* 15th Payout Due */}
                            <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                                  Agli 15 Tarikh ko Dena
                                </span>
                                <span className="text-[10px] font-semibold text-purple-800">
                                  16-31 Fees
                                </span>
                              </div>
                              <div className="text-xl font-black text-purple-950">
                                {formatCurrency(ts.amountDue15th)}
                              </div>
                              <div className="text-[10px] text-purple-800">
                                {ts.cycle15Transactions.length} Fees Transactions
                              </div>
                              <button
                                onClick={() =>
                                  handleOpenPayoutModal(
                                    t,
                                    '15th',
                                    ts.amountDue15th > 0 ? ts.amountDue15th : undefined,
                                    '16-31 Fees (Due 15th)',
                                    schedule.next15thDateLabel
                                  )
                                }
                                disabled={ts.amountDue15th <= 0}
                                className={`mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                  ts.amountDue15th > 0
                                    ? 'bg-purple-700 text-white hover:bg-purple-800 active:scale-95 shadow-xs cursor-pointer'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <Wallet className="h-3 w-3" />
                                <span>Pay 15 Tarikh Salary</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Overall Teacher Balance Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="text-slate-500">
                            <span>Kul Earned: </span>
                            <span className="font-bold text-slate-800">{formatCurrency(ts.totalEarned)}</span>
                            <span className="mx-1">•</span>
                            <span>Paid: </span>
                            <span className="font-bold text-blue-700">{formatCurrency(ts.totalPaidOut)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">
                              Total Balance
                            </span>
                            <span className="font-black text-slate-900">
                              {formatCurrency(ts.balancePayable)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* DETAILED STUDENT FEES & ADMISSION SCHEDULE LEDGER (AUTOMATIC MAPPING) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Student Admission Fees & Assigned Payout Dates</span>
                  <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-bold">
                    {filteredTransactions.length} Transactions
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Har admission ki date ke anusaar system automatic tay karta hai ki teacher ko payment 15 tarikh ko jayegi ya 30 tarikh ko.
                </p>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Student ya Course se dhoondhein..."
                  value={searchTxn}
                  onChange={(e) => setSearchTxn(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:outline-none w-56"
                />
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                {schedule.allTransactions.length === 0
                  ? 'Abhi tak koi student admission ya fee payment record nahi hui hai.'
                  : 'Chune hue filter ke mutabiq koi transactions nahi mili.'}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                    <tr>
                      <th className="py-3 px-3">Student / Roll No</th>
                      <th className="py-3 px-3">Course</th>
                      <th className="py-3 px-3">Fee Paid & Date</th>
                      <th className="py-3 px-3">Collection Period</th>
                      <th className="py-3 px-3 text-center">🎯 Assigned Payout Date</th>
                      <th className="py-3 px-3">Teacher</th>
                      <th className="py-3 px-3 text-right bg-purple-50/60 font-bold text-purple-950">
                        Teacher Share (% Hisaab)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{tx.studentName}</div>
                          {tx.studentRollNo && (
                            <div className="text-[10px] font-mono text-slate-400">
                              Roll: {tx.studentRollNo}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{tx.courseTitle}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{formatCurrency(tx.feeAmount)}</div>
                          <div className="text-[11px] text-slate-500">{formatDate(tx.transactionDate)}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              tx.collectionCycle === '1-15'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-purple-100 text-purple-900'
                            }`}
                          >
                            {tx.collectionCycleLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-black shadow-2xs border ${
                              tx.targetPayoutDay === 30
                                ? 'bg-amber-100/80 text-amber-950 border-amber-300'
                                : 'bg-purple-100/80 text-purple-950 border-purple-300'
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>{tx.targetPayoutDateLabel}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {tx.targetPayoutDay === 30 ? '30 Tarikh ko De' : 'Agli 15 Tarikh ko De'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{tx.teacherName}</div>
                        </td>
                        <td className="py-3 px-3 text-right bg-purple-50/30">
                          <div className="text-sm font-black text-emerald-700">
                            {formatCurrency(tx.teacherShareAmount)}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setStudentToAdjust({
                                studentId: tx.studentId,
                                studentName: tx.studentName,
                                courseTitle: tx.courseTitle,
                                currentPercent: tx.teacherSharePercent,
                              });
                              setAdjustPercentVal(tx.teacherSharePercent);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold bg-white px-1.5 py-0.5 rounded border border-purple-200 hover:bg-purple-100 active:scale-95 transition-all cursor-pointer mt-0.5"
                            title="Is student ka % hisaab kam ya zyada karein"
                          >
                            <span>{tx.teacherSharePercent}%</span>
                            <span className="text-purple-600">✎ Badlein</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                    <tr>
                      <td colSpan={2} className="py-3 px-3 text-slate-600">
                        Total ({filteredTransactions.length} items)
                      </td>
                      <td className="py-3 px-3 text-slate-900">
                        {formatCurrency(filteredTransactions.reduce((sum, tx) => sum + tx.feeAmount, 0))}
                      </td>
                      <td colSpan={3} />
                      <td className="py-3 px-3 text-right text-emerald-800 bg-purple-100/50 font-black text-sm">
                        {formatCurrency(
                          filteredTransactions.reduce((sum, tx) => sum + tx.teacherShareAmount, 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TEACHER PROFILES & 50% SHARE SETTINGS (MASTER-DETAIL VIEW) */}
      {activeTab === 'teachers' && (
        <div>
          {teachers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">Abhi koi Teacher add nahi hua hai</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Teacher add karein taaki unke courses assign ho sakein aur student fees ka salary hisaab track ho sake.
              </p>
              <button
                onClick={handleOpenAddTeacher}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>+ Naya Teacher Add Karein</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Side: Teacher Cards List (5 Cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academy Teachers ({teachers.length})
                  </span>
                  <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Customizable % Formula
                  </span>
                </div>

                <div className="space-y-2.5">
                  {summaries.map((summary) => {
                    const isSelected = summary.teacher.id === currentSummary?.teacher.id;

                    return (
                      <div
                        key={summary.teacher.id}
                        onClick={() => setSelectedTeacherId(summary.teacher.id)}
                        className={`group relative rounded-2xl border p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-400/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${summary.teacher.avatarColor} text-white font-black text-sm shadow-sm`}
                            >
                              {summary.teacher.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{summary.teacher.name}</span>
                                <span className="rounded-md bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-800">
                                  {summary.teacher.sharePercentage || 50}% Default
                                </span>
                              </h3>
                              <p className="text-xs text-purple-700 font-mono font-medium flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3 text-purple-500" />
                                <span>{summary.teacher.phone || 'Phone not set'}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditTeacher(summary.teacher);
                            }}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            title="Edit Teacher"
                          >
                            ✎
                          </button>
                        </div>

                        {/* Financial Stats Grid */}
                        <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50/90 p-2.5 text-center text-xs border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-medium block">
                              Students
                            </span>
                            <span className="font-bold text-slate-800">{summary.studentsCount}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-medium block">
                              Kul Vetan
                            </span>
                            <span className="font-bold text-emerald-700">
                              {formatCurrency(summary.totalCalculatedShare)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-medium block">
                              Pending
                            </span>
                            <span className="font-black text-amber-700">
                              {formatCurrency(summary.balancePayable)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Action */}
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
                          <span className="text-slate-400 text-[11px] truncate max-w-[180px]">
                            UPI: {summary.teacher.upiOrBank || 'Not added'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPayoutModal(summary.teacher, 'custom', summary.balancePayable);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900"
                          >
                            <span>Pay Salary</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Detailed Teacher Breakdown & Audit (7 Cols) */}
              {currentSummary && (
                <div className="lg:col-span-7 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
                    {/* Teacher Top Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${currentSummary.teacher.avatarColor} text-white font-black text-lg`}
                        >
                          {currentSummary.teacher.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>{currentSummary.teacher.name}</span>
                            <span className="rounded-md bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-bold border border-purple-200">
                              {currentSummary.teacher.sharePercentage || 50}% Default Share
                            </span>
                          </h2>
                          <p className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                            <span className="font-mono flex items-center gap-1 text-purple-700 font-bold">
                              <Phone className="h-3.5 w-3.5" />
                              <a href={`tel:${currentSummary.teacher.phone}`} className="hover:underline">
                                {currentSummary.teacher.phone || 'Mobile not set'}
                              </a>
                            </span>
                            <span>• {currentSummary.teacher.specialty}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleOpenPayoutModal(
                            currentSummary.teacher,
                            'custom',
                            currentSummary.balancePayable
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all"
                      >
                        <Wallet className="h-4 w-4" />
                        <span>Teacher Ko Pay Karein ({formatCurrency(currentSummary.balancePayable)})</span>
                      </button>
                    </div>

                    {/* Dynamic Share Rule Highlights Banner */}
                    <div className="rounded-xl bg-purple-50/70 border border-purple-200 p-3.5 flex items-center justify-between text-xs text-purple-950">
                      <div className="space-y-0.5">
                        <span className="font-bold flex items-center gap-1.5 text-slate-900">
                          <Percent className="h-3.5 w-3.5 text-purple-700" />
                          Teacher Revenue Auto Share ({currentSummary.teacher.sharePercentage || 50}% Default):
                        </span>
                        <span className="text-[11px] text-purple-800">
                          Admission ke hisaab se percent kam (30%, 40%) ya zyada (60%, 70%) set kiya ja sakta hai.
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Kul Teacher Vetan
                        </span>
                        <span className="text-base font-black text-emerald-800">
                          {formatCurrency(currentSummary.totalCalculatedShare)}
                        </span>
                      </div>
                    </div>

                    {/* Student-wise Breakdown Table */}
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Enrolled Students & Teacher Share Breakdown ({currentSummary.studentBreakdown.length})</span>
                        <span className="text-[11px] font-semibold text-purple-700 normal-case bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                          Custom Share % Supported
                        </span>
                      </h3>

                      {currentSummary.studentBreakdown.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 text-xs">
                          Is teacher ke kisi bhi course mein abhi tak koi student enrolled nahi hai.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Student</th>
                                <th className="py-2.5 px-3">Course</th>
                                <th className="py-2.5 px-3">Student Fee Paid</th>
                                <th className="py-2.5 px-3 text-right bg-purple-50/60 font-bold text-purple-950">
                                  Teacher Salary Share
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {currentSummary.studentBreakdown.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                                    {row.studentName}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600">{row.courseTitle}</td>
                                  <td className="py-2.5 px-3 font-medium text-slate-700">
                                    {formatCurrency(row.paidAmount)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right bg-purple-50/30">
                                    <div className="font-black text-emerald-700">
                                      {formatCurrency(row.teacherShareEarned)}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setStudentToAdjust({
                                          studentId: row.studentId,
                                          studentName: row.studentName,
                                          courseTitle: row.courseTitle,
                                          currentPercent: row.teacherSharePercent || currentSummary.teacher.sharePercentage || 50,
                                        });
                                        setAdjustPercentVal(row.teacherSharePercent || currentSummary.teacher.sharePercentage || 50);
                                      }}
                                      className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold bg-white px-1.5 py-0.5 rounded border border-purple-200 hover:bg-purple-100 active:scale-95 transition-all cursor-pointer mt-0.5"
                                      title="Is student ka % hisaab kam ya zyada karein"
                                    >
                                      <span>{row.teacherSharePercent || currentSummary.teacher.sharePercentage || 50}%</span>
                                      <span className="text-purple-600">✎ Badlein</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                              <tr>
                                <td colSpan={2} className="py-2.5 px-3 text-slate-600">
                                  Total Course Revenue
                                </td>
                                <td className="py-2.5 px-3 text-slate-900">
                                  {formatCurrency(currentSummary.totalCourseRevenue)}
                                </td>
                                <td className="py-2.5 px-3 text-right text-emerald-800 bg-purple-100/50 font-black">
                                  {formatCurrency(currentSummary.totalCalculatedShare)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIYA GAYA VETAN (PAYOUT HISTORY & VOUCHERS) */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Diya Gaya Vetan (Salary Payout History)</span>
                <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold">
                  {payouts.length} Payouts
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Past recorded salary disbursements, reference numbers, and printable payment vouchers.
              </p>
            </div>
          </div>

          {payouts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-slate-400 text-xs">
              Abhi tak koi salary payout voucher record nahi kiya gaya hai.
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...payouts].reverse().map((p) => {
                const teacher = teachers.find((t) => t.id === p.teacherId);

                return (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs hover:bg-slate-50 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-sm">
                          {formatCurrency(p.amount)}
                        </span>
                        <span className="rounded-md bg-purple-100 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-900">
                          {teacher?.name || 'Instructor'}
                        </span>
                        <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                          {p.paymentMethod}
                        </span>
                        {p.payoutCycle && (
                          <span className="rounded-md bg-amber-100 text-amber-900 px-1.5 py-0.5 text-[10px] font-bold border border-amber-200">
                            {p.payoutCycle === '30th'
                              ? '30 Tarikh Cycle (1-15 Fees)'
                              : p.payoutCycle === '15th'
                              ? '15 Tarikh Cycle (16-31 Fees)'
                              : 'Custom Payout'}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">
                          Ref: {p.referenceNo || p.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Disbursed on: <strong className="text-slate-700">{formatDate(p.date)}</strong>
                        {p.remarks && ` • ${p.remarks}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          if (teacher) {
                            onViewPayoutVoucher(p, teacher);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                      >
                        <Receipt className="h-3.5 w-3.5 text-purple-600" />
                        <span>Print Voucher</span>
                      </button>
                      {onDeletePayout && (
                        <button
                          onClick={() => setPayoutToDelete(p)}
                          className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Payout Entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RECORD SALARY PAYOUT MODAL (SUPPORTS 15TH & 30TH CYCLE PRE-FILL) */}
      {isPayoutModalOpen && payoutTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <h2 className="text-base font-bold">Salary Payout Record Karein</h2>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayout} className="p-5 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">{payoutTeacher.name}</div>
                  <span className="text-xs text-purple-800 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {payoutTeacher.specialty}
                  </span>
                </div>
                {payoutTeacher.upiOrBank && (
                  <div className="text-[11px] font-mono text-emerald-800 mt-1 flex items-center justify-between">
                    <span>UPI / Bank: {payoutTeacher.upiOrBank}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi(payoutTeacher.upiOrBank)}
                      className="text-purple-700 underline font-sans text-[10px] font-bold"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>

              {/* Cycle Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Payout Cycle / Hisaab Window *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutCycleChoice('30th');
                      const sch = schedule.teacherSchedules.find((s) => s.teacher.id === payoutTeacher.id);
                      if (sch && sch.amountDue30th > 0) {
                        setPayoutAmount(sch.amountDue30th);
                      }
                      setPayoutRemarks(`30 Tarikh Salary Payout (1 se 15 Fees Collection) - ${payoutTeacher.name}`);
                    }}
                    className={`rounded-xl p-2 text-center text-[11px] font-bold border transition-all ${
                      payoutCycleChoice === '30th'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>🗓️ 30 Tarikh</div>
                    <div className="text-[10px] text-slate-500 font-normal">1-15 ki fees</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayoutCycleChoice('15th');
                      const sch = schedule.teacherSchedules.find((s) => s.teacher.id === payoutTeacher.id);
                      if (sch && sch.amountDue15th > 0) {
                        setPayoutAmount(sch.amountDue15th);
                      }
                      setPayoutRemarks(`15 Tarikh Salary Payout (16 se 31 Fees Collection) - ${payoutTeacher.name}`);
                    }}
                    className={`rounded-xl p-2 text-center text-[11px] font-bold border transition-all ${
                      payoutCycleChoice === '15th'
                        ? 'border-purple-500 bg-purple-50 text-purple-950 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>🗓️ 15 Tarikh</div>
                    <div className="text-[10px] text-slate-500 font-normal">16-31 ki fees</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPayoutCycleChoice('custom');
                      const sum = summaries.find((s) => s.teacher.id === payoutTeacher.id);
                      if (sum && sum.balancePayable > 0) {
                        setPayoutAmount(sum.balancePayable);
                      }
                      setPayoutRemarks(`Salary disbursement for ${payoutTeacher.name}`);
                    }}
                    className={`rounded-xl p-2 text-center text-[11px] font-bold border transition-all ${
                      payoutCycleChoice === 'custom'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>Custom / Full</div>
                    <div className="text-[10px] text-slate-500 font-normal">Kul balance</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Payout Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Narration / Remarks
                </label>
                <input
                  type="text"
                  value={payoutRemarks}
                  onChange={(e) => setPayoutRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md hover:bg-emerald-700 transition-all active:scale-95"
                >
                  Salary Payout Confirm Karein ({formatCurrency(payoutAmount)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STUDENT SHARE % ADJUSTMENT MODAL */}
      {studentToAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500 text-white font-black text-sm">
                  %
                </div>
                <div>
                  <h3 className="font-bold text-sm">Teacher Share % Badlein</h3>
                  <p className="text-[11px] text-purple-200">
                    {studentToAdjust.studentName} ({studentToAdjust.courseTitle})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentToAdjust(null)}
                className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="rounded-xl bg-purple-50/80 border-2 border-purple-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-800 text-xs">
                      Teacher Percentage Share:
                    </label>
                    <p className="text-[10px] text-purple-700">Apne hisaab se kam ya zyada karein</p>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-300 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setAdjustPercentVal((p) => Math.max(0, p - 5))}
                      className="h-7 w-7 rounded-lg bg-purple-100 text-purple-900 font-bold hover:bg-purple-200 active:scale-95 text-xs flex items-center justify-center"
                      title="5% Kam"
                    >
                      -5%
                    </button>
                    <div className="flex items-center px-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={adjustPercentVal}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                          setAdjustPercentVal(val);
                        }}
                        className="w-10 text-center font-black text-sm text-purple-950 focus:outline-none"
                      />
                      <span className="font-bold text-purple-900 text-xs">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdjustPercentVal((p) => Math.min(100, p + 5))}
                      className="h-7 w-7 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 active:scale-95 text-xs flex items-center justify-center"
                      title="5% Zyada"
                    >
                      +5%
                    </button>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[20, 30, 40, 50, 60, 70, 80, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAdjustPercentVal(pct)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                        adjustPercentVal === pct
                          ? 'bg-purple-700 text-white shadow-xs scale-105 ring-2 ring-purple-300'
                          : 'bg-white text-slate-700 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      {pct}% {pct === 50 ? '(Standard)' : ''}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={adjustPercentVal}
                    onChange={(e) => setAdjustPercentVal(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-2 bg-purple-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium px-0.5 mt-0.5">
                    <span>0% (Academy)</span>
                    <span className="text-purple-700 font-bold">50% (Standard)</span>
                    <span>100% (Teacher)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStudentToAdjust(null)}
                  className="rounded-xl px-4 py-2 font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (studentToAdjust && onUpdateStudentShare) {
                      onUpdateStudentShare(studentToAdjust.studentId, adjustPercentVal);
                    }
                    setStudentToAdjust(null);
                  }}
                  className="rounded-xl bg-purple-700 px-5 py-2 font-bold text-white shadow-md hover:bg-purple-800 active:scale-95 transition-all"
                >
                  Save Karein ({adjustPercentVal}%)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TEACHER MODAL */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white">
              <h2 className="text-base font-bold">
                {editingTeacher ? 'Teacher Edit Karein' : 'Naya Teacher Add Karein'}
              </h2>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Teacher Ka Naam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Rahul Verma, Neha Sen..."
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Specialty / Taught Courses (Dance, Meditation, Acting, Guitar) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dance (Bollywood, Contemporary)"
                  value={tSpecialty}
                  onChange={(e) => setTSpecialty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="10 digit phone"
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">
                      Teacher Share % (Kam/Zyada) *
                    </label>
                    <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[11px] border border-purple-200">
                      {tShare}% Active
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTShare((prev) => Math.max(1, prev - 5))}
                      className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 active:scale-95 text-xs flex items-center justify-center"
                      title="5% Kam"
                    >
                      -5%
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={tShare}
                      onChange={(e) => setTShare(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                      className="w-full text-center p-1 text-xs text-slate-900 focus:outline-none font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setTShare((prev) => Math.min(100, prev + 5))}
                      className="h-7 w-7 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 active:scale-95 text-xs flex items-center justify-center"
                      title="5% Zyada"
                    >
                      +5%
                    </button>
                  </div>

                  {/* Quick percentage buttons */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {[20, 30, 40, 50, 60, 70, 80].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setTShare(pct)}
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                          tShare === pct
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  UPI ID ya Bank Account Detail
                </label>
                <input
                  type="text"
                  placeholder="e.g. rahul@upi ya Account/IFSC"
                  value={tUpi}
                  onChange={(e) => setTUpi(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  {editingTeacher && onDeleteTeacher && (
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherToDelete(editingTeacher);
                        setIsTeacherModalOpen(false);
                      }}
                      className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Teacher</span>
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTeacherModalOpen(false)}
                    className="rounded-xl px-4 py-2 font-medium text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-all active:scale-95"
                  >
                    {editingTeacher ? 'Save Changes' : 'Teacher Add Karein'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODALS */}
      <ConfirmDeleteModal
        isOpen={!!payoutToDelete}
        title="Salary Payout Entry Delete Karein?"
        message="Kya aap is salary payout voucher ko delete karna chahte hain? Isse teacher ke account mein yeh balance wapas add ho jayega."
        itemName={payoutToDelete ? `${payoutToDelete.referenceNo || 'Payout'} (${formatCurrency(payoutToDelete.amount)})` : undefined}
        confirmButtonText="Haan, Delete Karein"
        onConfirm={() => {
          if (payoutToDelete && onDeletePayout) {
            onDeletePayout(payoutToDelete.id);
            setPayoutToDelete(null);
          }
        }}
        onClose={() => setPayoutToDelete(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!teacherToDelete}
        title="Teacher Record Delete Karein?"
        message="Kya aap is teacher ko delete karna chahte hain? Inke courses ka hisaab prabhavit ho sakta hai."
        itemName={teacherToDelete ? `${teacherToDelete.name} (${teacherToDelete.specialty})` : undefined}
        confirmButtonText="Haan, Delete Karein"
        onConfirm={() => {
          if (teacherToDelete && onDeleteTeacher) {
            onDeleteTeacher(teacherToDelete.id);
            setTeacherToDelete(null);
          }
        }}
        onClose={() => setTeacherToDelete(null)}
      />
    </div>
  );
};
