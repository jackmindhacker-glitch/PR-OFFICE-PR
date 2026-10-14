import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Student, Course, PaymentRecord, PaymentMethod, Teacher } from '../types/academy';
import { formatCurrency, formatDate } from '../utils/calculations';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface StudentPaymentModalProps {
  student: Student;
  course?: Course;
  teacher?: Teacher;
  payments: PaymentRecord[];
  onAddPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNo'>) => void;
  onViewReceipt: (payment: PaymentRecord) => void;
  onDeletePayment?: (id: string) => void;
  onClose: () => void;
}

export const StudentPaymentModal: React.FC<StudentPaymentModalProps> = ({
  student,
  course,
  teacher,
  payments,
  onAddPayment,
  onViewReceipt,
  onDeletePayment,
  onClose,
}) => {
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);
  const studentPayments = payments.filter((p) => p.studentId === student.id);
  const dueAmount = Math.max(0, student.totalFee - student.paidAmount);

  const [showAddForm, setShowAddForm] = useState(dueAmount > 0);
  const [amount, setAmount] = useState<number>(dueAmount);
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [remarks, setRemarks] = useState('');

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const teacherShareAmount = Math.round(amount * 0.5); // 50% auto share

    onAddPayment({
      studentId: student.id,
      studentName: student.fullName,
      courseTitle: student.courseTitle || (course ? course.title : 'Course'),
      amount,
      paymentMethod: method,
      date: new Date().toISOString(),
      remarks: remarks.trim() || 'Installment payment',
      teacherId: student.teacherId || teacher?.id || course?.teacherId || '',
      teacherShareAmount,
    });

    setAmount(0);
    setRemarks('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
              ₹
            </div>
            <div>
              <h2 className="text-base font-bold">Payment Detail & History</h2>
              <p className="text-xs text-amber-300">
                {student.fullName} ({student.rollNo})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Total Course Fee
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                {formatCurrency(student.totalFee)}
              </span>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-bold block">
                Total Jama (Paid)
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-800 mt-0.5 block">
                {formatCurrency(student.paidAmount)}
              </span>
            </div>
            <div
              className={`rounded-xl p-3 border ${
                dueAmount > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block">
                {dueAmount > 0 ? 'Remaining Due' : 'Status'}
              </span>
              <span className="text-sm sm:text-base font-black mt-0.5 block">
                {dueAmount > 0 ? formatCurrency(dueAmount) : 'Fully Paid'}
              </span>
            </div>
          </div>

          {/* Teacher Share notification */}
          <div className="rounded-xl bg-purple-50 p-3 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-purple-900">
            <div>
              <span className="font-bold">Assigned Teacher: </span>
              <span className="font-semibold text-slate-900">
                {student.teacherName || teacher?.name || 'Academy Teacher'}
              </span>
              {(student.teacherPhone || teacher?.phone) && (
                <span className="font-mono text-purple-700 ml-1.5">
                  ({student.teacherPhone || teacher?.phone})
                </span>
              )}
            </div>
            <span className="font-bold text-emerald-700">
              50% Auto Share: {formatCurrency(Math.round((student.paidAmount > 0 ? student.paidAmount : student.totalFee) * 0.5))}
            </span>
          </div>

          {/* Record New Payment Form (collapsible or if dues exist) */}
          {dueAmount > 0 && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-amber-600" /> Nayi Fee / Installment Jama Karein:
                </span>
                <span className="text-[11px] text-rose-600 font-semibold">
                  Max Due: {formatCurrency(dueAmount)}
                </span>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 font-medium block mb-0.5">
                      Jama Rashi (₹) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={dueAmount}
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium block mb-0.5">
                      Payment Mode *
                    </label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                      <option value="Cash">Cash (Counter)</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Card">Card / POS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-medium block mb-0.5">
                    Narration / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd installment paid via GPay"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all"
                  >
                    <span>Payment Jama Karein (+50% Teacher Share)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Past Payment Records List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 text-xs">
                Pichli Sabhi Payment Entries ({studentPayments.length}):
              </span>
            </div>

            {studentPayments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400">
                Abhi tak koi payment record nahi hai.
              </div>
            ) : (
              <div className="space-y-2">
                {studentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {formatCurrency(p.amount)}
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                          {p.paymentMethod}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.receiptNo}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatDate(p.date)} {p.remarks && `• ${p.remarks}`}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">
                        Teacher 50% Auto Share: {formatCurrency(p.teacherShareAmount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>Receipt</span>
                      </button>

                      {onDeletePayment && (
                        <button
                          onClick={() => setPaymentToDelete(p)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Receipt / Payment"
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

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!paymentToDelete}
        title="Payment Record Delete Karein?"
        message="Kya aap is payment receipt ko delete karna chahte hain? Isse student ke jama rashi se yeh amount cut ho jayega."
        itemName={paymentToDelete ? `${paymentToDelete.receiptNo} (${formatCurrency(paymentToDelete.amount)})` : undefined}
        confirmButtonText="Haan, Delete Karein"
        onConfirm={() => {
          if (paymentToDelete && onDeletePayment) {
            onDeletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
          }
        }}
        onClose={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
