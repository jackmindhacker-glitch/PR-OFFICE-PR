import React, { useState } from 'react';
import { UserPlus, UserCheck, X, Sparkles, Percent } from 'lucide-react';
import { Student, Course, PaymentMethod, Teacher } from '../types/academy';
import { formatCurrency } from '../utils/calculations';

interface StudentFormModalProps {
  initialStudent: Student | null;
  courses: Course[];
  teachers: Teacher[];
  onSave: (
    student: Student,
    initialPayment?: { amount: number; method: PaymentMethod; remarks?: string }
  ) => void;
  onClose: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  initialStudent,
  courses,
  teachers,
  onSave,
  onClose,
}) => {
  const isEditing = !!initialStudent;

  const defaultCourse = courses[0];
  const [fullName, setFullName] = useState(initialStudent?.fullName || '');
  const [parentName, setParentName] = useState(initialStudent?.parentName || '');
  const [phone, setPhone] = useState(initialStudent?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialStudent?.whatsapp || '');
  const [age, setAge] = useState<number>(initialStudent?.age || 14);
  const [gender, setGender] = useState<Student['gender']>(initialStudent?.gender || 'Male');
  const [courseId, setCourseId] = useState(initialStudent?.courseId || defaultCourse?.id || '');
  const [totalFee, setTotalFee] = useState<number>(
    initialStudent ? initialStudent.totalFee : defaultCourse ? defaultCourse.price : 2500
  );
  const [batchTiming, setBatchTiming] = useState(
    initialStudent?.batchTiming || defaultCourse?.batchSchedule || ''
  );
  const [dueDate, setDueDate] = useState(
    initialStudent?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialStudent?.notes || '');

  // For brand new admission: initial payment input
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number>(
    isEditing ? 0 : defaultCourse ? defaultCourse.price : 2500
  );
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<PaymentMethod>('UPI');
  const [initialPaymentRemarks, setInitialPaymentRemarks] = useState('Admission registration fee');

  const selectedCourse = courses.find((c) => c.id === courseId);
  const assignedTeacher = teachers.find((t) => t.id === selectedCourse?.teacherId);

  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const c = courses.find((item) => item.id === id);
    if (c) {
      setTotalFee(c.price);
      if (!isEditing) {
        setInitialPaymentAmount(c.price);
      }
      setBatchTiming(c.batchSchedule);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    let paidAmount = initialStudent ? initialStudent.paidAmount : initialPaymentAmount;
    let status: Student['status'] = 'Pending';

    if (paidAmount >= totalFee) {
      status = 'Paid';
    } else if (paidAmount > 0) {
      status = 'Partial';
    }

    const studentData: Student = {
      id: initialStudent ? initialStudent.id : `std-${Date.now()}`,
      rollNo: initialStudent ? initialStudent.rollNo : `PRA-${Math.floor(100 + Math.random() * 900)}`,
      fullName: fullName.trim(),
      parentName: parentName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      age: Number(age) || 0,
      gender,
      courseId,
      enrollmentDate: initialStudent ? initialStudent.enrollmentDate : new Date().toISOString().split('T')[0],
      dueDate,
      totalFee: Number(totalFee) || 0,
      paidAmount: Number(paidAmount) || 0,
      status,
      batchTiming,
      notes: notes.trim(),
    };

    if (!isEditing && initialPaymentAmount > 0) {
      onSave(studentData, {
        amount: initialPaymentAmount,
        method: initialPaymentMethod,
        remarks: initialPaymentRemarks,
      });
    } else {
      onSave(studentData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            {isEditing ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            <h2 className="text-base font-bold">
              {isEditing ? 'Student Details Edit Karein' : 'Naya Student Admission / Registration'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Full Name & Age */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Student Ka Pura Naam *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Umar / Age</label>
              <input
                type="number"
                min="3"
                max="90"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Guardian & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Mata/Pita (Guardian) Ka Naam
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Sharma"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Student['gender'])}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Calling Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10 digit phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                WhatsApp Number (for Reminder)
              </label>
              <input
                type="tel"
                placeholder="Same as phone or different"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Course Selection */}
          <div className="rounded-xl bg-amber-50/50 p-3.5 border border-amber-200 space-y-2.5">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Course Ya Package Chunein *
              </label>
              {courses.length === 0 ? (
                <div className="rounded-lg bg-amber-100/90 p-3 text-amber-900 border border-amber-300 text-center">
                  <p className="font-bold">Koi Course Available Nahi Hai</p>
                  <p className="text-[11px] mt-0.5 text-amber-800">
                    Admission lene se pehle 'Courses' tab mein jaakar ek Course add karein.
                  </p>
                </div>
              ) : (
                <select
                  value={courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-semibold focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Course Chunein --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.duration}) — {formatCurrency(c.price)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedCourse && (
              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-amber-200/60">
                <span>Teacher: <strong className="text-slate-800">{assignedTeacher?.name || 'Not assigned'}</strong></span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Percent className="h-3 w-3" /> 50% Teacher Share Auto Added
                </span>
              </div>
            )}
          </div>

          {/* Batch Timing & Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Batch Timing / Schedule
              </label>
              <input
                type="text"
                value={batchTiming}
                onChange={(e) => setBatchTiming(e.target.value)}
                placeholder="e.g. Mon-Wed 5:00 PM"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Total Course Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={totalFee}
                onChange={(e) => setTotalFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* If Brand New Admission, allow instant first payment */}
          {!isEditing && (
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-800 block text-xs">
                First Fee Collection / Abhi Jama Rashi:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 block mb-1">
                    Jama Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalFee}
                    value={initialPaymentAmount}
                    onChange={(e) => setInitialPaymentAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold text-emerald-700 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Pending Due: {formatCurrency(Math.max(0, totalFee - initialPaymentAmount))}
                  </span>
                </div>
                <div>
                  <label className="font-medium text-slate-600 block mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={initialPaymentMethod}
                    onChange={(e) => setInitialPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs text-slate-800 bg-white"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash (Counter)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Card">Card / POS</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Next Due Date & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Next Fee Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Notes / Vishesh Jankari
              </label>
              <input
                type="text"
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-medium text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white shadow-md hover:bg-amber-600 transition-all"
            >
              {isEditing ? 'Save Changes' : 'Confirm Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
