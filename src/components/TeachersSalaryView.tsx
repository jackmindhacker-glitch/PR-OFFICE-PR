import React, { useState } from 'react';
import {
  Wallet,
  Users,
  Percent,
  Plus,
  ArrowRight,
  CheckCircle2,
  Receipt,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Building,
  CreditCard,
  Phone,
  Sparkles,
  Trash2,
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
  formatCurrency,
  formatDate,
  TeacherSalarySummary,
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
}

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
}) => {
  const summaries = calculateTeacherSalaries(teachers, courses, students, payments, payouts);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id || ''
  );
  const [payoutToDelete, setPayoutToDelete] = useState<TeacherPayout | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Modals
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutTeacher, setPayoutTeacher] = useState<Teacher | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('UPI');
  const [payoutRemarks, setPayoutRemarks] = useState('');

  // Form states for adding/editing teacher
  const [tName, setTName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tSpecialty, setTSpecialty] = useState('Dance');
  const [tUpi, setTUpi] = useState('');
  const [tShare, setTShare] = useState<number>(50); // Default 50%

  // Aggregate totals
  const totalSalariesEarned = summaries.reduce((sum, s) => sum + s.totalCalculatedShare, 0);
  const totalDisbursed = summaries.reduce((sum, s) => sum + s.totalPaidOut, 0);
  const totalPendingPayout = summaries.reduce((sum, s) => sum + s.balancePayable, 0);

  const currentSummary = summaries.find((s) => s.teacher.id === selectedTeacherId) || summaries[0];

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

  const handleOpenPayout = (summary: TeacherSalarySummary) => {
    setPayoutTeacher(summary.teacher);
    setPayoutAmount(summary.balancePayable > 0 ? summary.balancePayable : 1000);
    setPayoutMethod('UPI');
    setPayoutRemarks(`Salary settlement for ${summary.teacher.name}`);
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
    });

    setIsPayoutModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
            <span>Teacher Salary & 50% Auto Share</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Auto 50% Rule Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Her course purchase par 50% automatically teacher ke hisaab mein add hota hai
          </p>
        </div>

        <button
          onClick={handleOpenAddTeacher}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Naya Teacher Add Karein</span>
        </button>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kul Teacher Share (50% Auto Earned)</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatCurrency(totalSalariesEarned)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            50% share on student admissions
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Teacher Ko Diya Gaya (Paid Out)</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">
            {formatCurrency(totalDisbursed)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total salary payouts given
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dena Baki (Pending Salary Payable)</span>
            <Wallet className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {formatCurrency(totalPendingPayout)}
          </div>
          <span className="text-[11px] text-amber-700/80 mt-1 block">
            Current balance across all instructors
          </span>
        </div>
      </div>

      {/* Main Master-Detail Layout */}
      {teachers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">Abhi koi Teacher add nahi hua hai</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Teacher add karein taaki unke courses assign ho sakein aur student fees ka 50% salary distribution hisaab track ho sake.
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
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              50% Share Formula
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
                      ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400/20'
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
                            50% Share
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
                      <span className="font-bold text-slate-800">
                        {summary.studentsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-medium block">
                        50% Share
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
                    <span className="text-slate-400 text-[11px]">
                      UPI: {summary.teacher.upiOrBank || 'Not added'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPayout(summary);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
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
                      <span className="rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-xs font-bold">
                        50% Auto Share
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
                  onClick={() => handleOpenPayout(currentSummary)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Teacher Ko Pay Karein ({formatCurrency(currentSummary.balancePayable)})</span>
                </button>
              </div>

              {/* 50% Rule Highlights Banner */}
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 flex items-center justify-between text-xs text-amber-900">
                <div className="space-y-0.5">
                  <span className="font-bold block">
                    Automatic 50% Revenue Share Formula:
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Students dwara jama kiye gaye fees ka 50% automatically yahan add hota hai.
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Share
                  </span>
                  <span className="text-base font-black text-emerald-800">
                    {formatCurrency(currentSummary.totalCalculatedShare)}
                  </span>
                </div>
              </div>

              {/* Student-wise Breakdown Table */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Enrolled Students & 50% Calculation Breakdown ({currentSummary.studentBreakdown.length})
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
                          {/* As requested: "ek new column jisme Likha Ho teacher salary ... 50% automatic teacher K Kollam mein Ad Hojai" */}
                          <th className="py-2.5 px-3 text-right bg-amber-50/60 font-bold text-amber-900">
                            Teacher Salary (50%)
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
                            <td className="py-2.5 px-3 text-right font-black text-emerald-700 bg-amber-50/30">
                              {formatCurrency(row.teacherShareEarned)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                        <tr>
                          <td colSpan={2} className="py-2.5 px-3 text-slate-600">
                            Total Kursi/Course Revenue
                          </td>
                          <td className="py-2.5 px-3 text-slate-900">
                            {formatCurrency(currentSummary.totalCourseRevenue)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-800 bg-amber-100/50">
                            {formatCurrency(currentSummary.totalCalculatedShare)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Past Payouts History for this teacher */}
              <div>
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Salary Payout History (Diya Gaya Vetan)
                </h3>

                {payouts.filter((p) => p.teacherId === currentSummary.teacher.id).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs">
                    Abhi tak koi payout record nahi kiya gaya hai.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payouts
                      .filter((p) => p.teacherId === currentSummary.teacher.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {formatCurrency(p.amount)}
                              </span>
                              <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                                {p.paymentMethod}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {p.referenceNo}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {formatDate(p.date)} {p.remarks && `• ${p.remarks}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onViewPayoutVoucher(p, currentSummary.teacher)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                              <span>Voucher</span>
                            </button>
                            {onDeletePayout && (
                              <button
                                onClick={() => setPayoutToDelete(p)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Delete Payout Entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Add / Edit Teacher Modal */}
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
                  <label className="font-semibold text-slate-700 block mb-1">
                    Revenue Share % *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={tShare}
                    onChange={(e) => setTShare(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Default 50% automatic
                  </span>
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
                    className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white shadow-md hover:bg-amber-600 transition-all"
                  >
                    {editingTeacher ? 'Save Changes' : 'Teacher Add Karein'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Salary Payout Modal */}
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
                <div className="font-bold text-slate-800">{payoutTeacher.name}</div>
                <div className="text-[11px] text-slate-500">{payoutTeacher.specialty}</div>
                <div className="text-[11px] font-mono text-emerald-700 mt-1">
                  UPI: {payoutTeacher.upiOrBank || 'Direct Cash'}
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
                    <option value="UPI">UPI (GPay / PhonePe)</option>
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
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-md hover:bg-emerald-700 transition-all"
                >
                  Salary Payout Confirm Karein
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Payout Deletion */}
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

      {/* Confirmation Modal for Teacher Deletion */}
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
