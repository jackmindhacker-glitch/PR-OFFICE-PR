import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Receipt,
  Download,
  Filter,
  Calendar,
  Wallet,
  TrendingUp,
  Edit2,
  Trash2,
  ArrowUpRight,
  Percent,
  IndianRupee,
} from 'lucide-react';
import { PaymentRecord, Student, Course, PaymentMethod, Teacher } from '../types/academy';
import { formatCurrency, formatDate } from '../utils/calculations';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  students: Student[];
  courses: Course[];
  teachers: Teacher[];
  onAddPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNo'>) => void;
  onEditPayment: (payment: PaymentRecord) => void;
  onDeletePayment: (id: string) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  students,
  courses,
  teachers,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [formAmount, setFormAmount] = useState<number>(2500);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('UPI');
  const [formRemarks, setFormRemarks] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSharePercent, setFormSharePercent] = useState<number>(50);

  // Aggregate stats
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalTeacherShare = payments.reduce((sum, p) => sum + p.teacherShareAmount, 0);

  // Today's collections
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCollected = payments
    .filter((p) => p.date.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === 'All' ? true : p.paymentMethod === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const handleOpenAdd = () => {
    setEditingPayment(null);
    const firstStudent = students[0];
    const initialStudentId = firstStudent?.id || '';
    setSelectedStudentId(initialStudentId);
    setFormAmount(2500);
    setFormMethod('UPI');
    setFormRemarks('');
    setFormDate(new Date().toISOString().split('T')[0]);
    const tch = teachers.find((t) => t.id === firstStudent?.teacherId);
    setFormSharePercent(firstStudent?.teacherSharePercent ?? tch?.sharePercentage ?? 50);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (payment: PaymentRecord) => {
    setEditingPayment(payment);
    setSelectedStudentId(payment.studentId);
    setFormAmount(payment.amount);
    setFormMethod(payment.paymentMethod);
    setFormRemarks(payment.remarks || '');
    setFormDate(payment.date.split('T')[0]);
    setFormSharePercent(payment.teacherSharePercent || 50);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment && (!selectedStudentId || students.length === 0)) {
      return;
    }
    const st = students.find((s) => s.id === selectedStudentId);
    const crs = courses.find((c) => c.id === st?.courseId);
    const tch = teachers.find((t) => t.id === (st?.teacherId || crs?.teacherId));

    const appliedPercent = Number(formSharePercent) || 50;
    const teacherShareAmount = Math.round((Number(formAmount) * appliedPercent) / 100);

    if (editingPayment) {
      onEditPayment({
        ...editingPayment,
        amount: Number(formAmount),
        paymentMethod: formMethod,
        remarks: formRemarks,
        date: new Date(formDate).toISOString(),
        teacherSharePercent: appliedPercent,
        teacherShareAmount,
      });
    } else {
      onAddPayment({
        studentId: selectedStudentId,
        studentName: st ? st.fullName : 'Student',
        courseTitle: crs ? crs.title : 'Course',
        amount: Number(formAmount),
        paymentMethod: formMethod,
        date: new Date(formDate).toISOString(),
        remarks: formRemarks,
        teacherId: tch ? tch.id : '',
        teacherSharePercent: appliedPercent,
        teacherShareAmount,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
            <span>Payment Details & History</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {payments.length} Transactions
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Puri payment ke baare mein hamari complete detail, receipts aur records
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nayi Payment Add Karein</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Kul Jama (Total Revenue)</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Academy fee collection to-date
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Aaj Ka Collection (Today)</span>
            <Calendar className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {formatCurrency(todayCollected)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} collection
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Teacher 50% Auto Share Credited</span>
            <Percent className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">
            {formatCurrency(totalTeacherShare)}
          </div>
          <span className="text-[11px] text-purple-600/80 mt-1 block">
            Automatic 50% revenue distribution
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
        {/* Method filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'UPI', 'Cash', 'Bank Transfer', 'Card'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                methodFilter === m
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, receipt..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Receipt No.</th>
                <th className="py-3.5 px-4">Student & Course</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-purple-900 font-bold">Teacher Share (% Hisaab)</th>
                <th className="py-3.5 px-4">Remarks</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const teacher = teachers.find((t) => t.id === p.teacherId);

                return (
                  <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                    {/* Receipt No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {p.receiptNo}
                    </td>

                    {/* Student & Course */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <div className="text-[11px] text-slate-500">{p.courseTitle}</div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {formatDate(p.date)}
                    </td>

                    {/* Mode */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 uppercase">
                        {p.paymentMethod}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                      {formatCurrency(p.amount)}
                    </td>

                    {/* Teacher Share */}
                    <td className="py-3.5 px-4 font-bold text-purple-950">
                      <div>{formatCurrency(p.teacherShareAmount)}</div>
                      <div className="text-[10px] text-purple-700 font-bold">
                        ({p.teacherSharePercent || 50}% • {teacher ? teacher.name : 'Teacher'})
                      </div>
                    </td>

                    {/* Remarks */}
                    <td className="py-3.5 px-4 text-slate-500 max-w-[150px] truncate">
                      {p.remarks || '-'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewReceipt(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors"
                          title="View & Print Receipt"
                        >
                          <Receipt className="h-3 w-3" />
                          <span>Receipt</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                          title="Edit Payment"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setPaymentToDelete(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Payment / Receipt"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Payment Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredPayments.map((p) => {
          const teacher = teachers.find((t) => t.id === p.teacherId);
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{p.studentName}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      {p.receiptNo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{p.courseTitle}</div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-slate-900">
                    {formatCurrency(p.amount)}
                  </div>
                  <span className="inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                    {p.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5 text-xs flex justify-between items-center text-slate-600">
                <span>Date: {formatDate(p.date)}</span>
                <span className="text-purple-700 font-bold">
                  Teacher ({p.teacherSharePercent || 50}%): {formatCurrency(p.teacherShareAmount)}
                </span>
              </div>

              {p.remarks && (
                <div className="text-xs text-slate-500 italic">
                  Note: {p.remarks}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => onViewReceipt(p)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Receipt Dekhein</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                    title="Edit Payment"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPaymentToDelete(p)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                    title="Delete Payment / Receipt"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPayments.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-white">
          <IndianRupee className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-bold text-slate-800">Koi payment nahi mili</h3>
          <p className="mt-1 text-xs text-slate-500">
            Nayi payment add karne ke liye upar button dabayein.
          </p>
        </div>
      )}

      {/* Add / Edit Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white">
              <h2 className="text-base font-bold">
                {editingPayment ? 'Edit Payment Details' : 'Nayi Payment Entry Add Karein'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {!editingPayment && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Student Chunein *
                  </label>
                  {students.length === 0 ? (
                    <div className="rounded-lg bg-amber-50 p-2.5 text-amber-800 border border-amber-200">
                      Abhi koi student enrolled nahi hai. Pehle 'Admissions' tab mein student add karein.
                    </div>
                  ) : (
                    <select
                      value={selectedStudentId}
                      onChange={(e) => {
                        setSelectedStudentId(e.target.value);
                        const st = students.find((s) => s.id === e.target.value);
                        if (st) {
                          const due = Math.max(0, st.totalFee - st.paidAmount);
                          if (due > 0) setFormAmount(due);
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Student Select Karein --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.rollNo})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 font-bold focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-purple-700 font-bold block mt-0.5">
                    Teacher Share ({formSharePercent}%): {formatCurrency(Math.round((formAmount * formSharePercent) / 100))}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              {/* Teacher Share % in Payment Modal */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Teacher Share % (Kam / Zyada):
                  </span>
                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-purple-300">
                    <button
                      type="button"
                      onClick={() => setFormSharePercent((p) => Math.max(0, p - 5))}
                      className="text-purple-900 font-bold px-1 hover:text-purple-700"
                    >
                      -5%
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formSharePercent}
                      onChange={(e) => setFormSharePercent(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                      className="w-8 text-center font-bold text-purple-950 focus:outline-none text-xs"
                    />
                    <span className="font-bold text-purple-900 text-xs">%</span>
                    <button
                      type="button"
                      onClick={() => setFormSharePercent((p) => Math.min(100, p + 5))}
                      className="text-purple-900 font-bold px-1 hover:text-purple-700"
                    >
                      +5%
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[30, 40, 50, 60, 70, 80].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setFormSharePercent(pct)}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        formSharePercent === pct ? 'bg-purple-700 text-white' : 'bg-white text-slate-700 border border-purple-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPay transaction ID / remarks"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white shadow-md hover:bg-amber-600 transition-all"
                >
                  {editingPayment ? 'Update' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Payment / Receipt Deletion */}
      <ConfirmDeleteModal
        isOpen={!!paymentToDelete}
        title="Payment Receipt Delete Karein?"
        message="Kya aap sach mein is payment receipt ko delete karna chahte hain? Isse student ke jama amount se yeh rashi ghat jayegi aur teacher ka 50% hisaab recalculate ho jayega."
        itemName={
          paymentToDelete
            ? `${paymentToDelete.receiptNo} • ${paymentToDelete.studentName} (${formatCurrency(paymentToDelete.amount)})`
            : undefined
        }
        confirmButtonText="Haan, Receipt Delete Karein"
        onConfirm={() => {
          if (paymentToDelete) {
            onDeletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
          }
        }}
        onClose={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
