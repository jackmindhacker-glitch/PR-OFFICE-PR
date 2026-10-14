import React from 'react';
import { Printer, X, CheckCircle2, Building, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { PaymentRecord, Student, Course, AcademySettings, TeacherPayout, Teacher } from '../types/academy';
import { formatCurrency, formatDate } from '../utils/calculations';

interface FeeReceiptProps {
  type: 'fee';
  payment: PaymentRecord;
  student?: Student;
  course?: Course;
  settings: AcademySettings;
  onClose: () => void;
  onDeleteReceipt?: (receiptId: string) => void;
}

interface TeacherVoucherProps {
  type: 'payout';
  payout: TeacherPayout;
  teacher?: Teacher;
  settings: AcademySettings;
  onClose: () => void;
  onDeletePayout?: (payoutId: string) => void;
}

export type ReceiptModalProps = FeeReceiptProps | TeacherVoucherProps;

export const ReceiptModal: React.FC<ReceiptModalProps> = (props) => {
  const { settings, onClose } = props;

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.warn('Print not supported in current environment', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Actions Bar (hidden in print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {props.type === 'fee' ? 'Student Fee Receipt' : 'Teacher Payout Voucher'}
          </span>
          <div className="flex items-center gap-2">
            {props.type === 'fee' && props.onDeleteReceipt && (
              <button
                onClick={() => props.onDeleteReceipt!(props.payment.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                title="Is receipt ko delete karein"
              >
                <span>Delete Receipt</span>
              </button>
            )}
            {props.type === 'payout' && props.onDeletePayout && (
              <button
                onClick={() => props.onDeletePayout!(props.payout.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                title="Is payout voucher ko delete karein"
              >
                <span>Delete Voucher</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white text-slate-800">
          {/* Header */}
          <div className="border-b-2 border-amber-500 pb-4 text-center">
            <div className="flex justify-center mb-1">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg">
                PR
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {settings.academyName}
            </h1>
            <p className="text-xs text-amber-700 font-semibold">{settings.tagline}</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {settings.address} • Phone: {settings.phone}
            </p>
          </div>

          {props.type === 'fee' ? (
            <>
              {/* Receipt Meta */}
              <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">RECEIPT NO.</span>
                  <span className="font-mono font-bold text-slate-800">
                    {props.payment.receiptNo}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">DATE & TIME</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(props.payment.date)}
                  </span>
                </div>
              </div>

              {/* Student & Course Details */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">STUDENT NAME</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {props.payment.studentName}
                    </span>
                    {props.student?.rollNo && (
                      <span className="text-slate-500 block text-[11px]">
                        Roll: {props.student.rollNo}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">GUARDIAN / PHONE</span>
                    <span className="font-medium text-slate-700">
                      {props.student?.parentName || '-'}
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      {props.student?.phone}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Course / Package:</span>
                    <span className="font-bold text-slate-900">{props.payment.courseTitle}</span>
                  </div>
                  {props.student?.teacherName && (
                    <div className="flex justify-between items-center text-[11px] text-purple-900 bg-purple-50/70 p-1.5 rounded-lg border border-purple-100">
                      <span className="font-semibold">Teacher (Instructor):</span>
                      <span className="font-bold">
                        {props.student.teacherName} {props.student.teacherPhone ? `(${props.student.teacherPhone})` : ''}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Payment Mode:</span>
                    <span className="font-semibold text-slate-700 uppercase">
                      {props.payment.paymentMethod}
                    </span>
                  </div>
                  {props.payment.remarks && (
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Remarks / Note:</span>
                      <span className="italic">{props.payment.remarks}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Box */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide block">
                  Amount Received / Jama Rashi
                </span>
                <span className="text-3xl font-extrabold text-amber-900">
                  {formatCurrency(props.payment.amount)}
                </span>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Payment Successfully Recorded</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Teacher Payout Voucher */}
              <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">VOUCHER REF</span>
                  <span className="font-mono font-bold text-slate-800">
                    {props.payout.referenceNo || `VOUCH-${props.payout.id}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">DISBURSEMENT DATE</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(props.payout.date)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TEACHER NAME</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {props.teacher?.name || 'Academy Instructor'}
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      Specialty: {props.teacher?.specialty}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">PAYMENT METHOD / UPI</span>
                    <span className="font-semibold text-slate-800 uppercase">
                      {props.payout.paymentMethod}
                    </span>
                    <span className="text-slate-500 block text-[11px] font-mono">
                      {props.teacher?.upiOrBank || '-'}
                    </span>
                  </div>
                </div>

                {props.payout.remarks && (
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-600 text-[11px]">
                    <span className="font-semibold">Narration:</span> {props.payout.remarks}
                  </div>
                )}
              </div>

              {/* Amount Box */}
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide block">
                  Salary / Share Amount Disbursed
                </span>
                <span className="text-3xl font-extrabold text-emerald-900">
                  {formatCurrency(props.payout.amount)}
                </span>
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                  50% Course Revenue Share Settlement
                </p>
              </div>
            </>
          )}

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300" />
              <span className="text-slate-500 block mt-1">Student / Receiver Signature</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 font-serif italic">PR ACADEMY</span>
              </div>
              <span className="text-slate-500 block mt-1">Authorized Signatory</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            This is a computer generated document issued by PR ACADEMY.
          </div>
        </div>
      </div>
    </div>
  );
};
