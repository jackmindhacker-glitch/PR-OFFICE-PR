import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, X, Sparkles, Percent, Phone, User, GraduationCap, Calendar, Clock, CreditCard } from 'lucide-react';
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

  // Find preselected course & teacher if editing
  const defaultCourse = courses.find((c) => c.id === initialStudent?.courseId) || courses[0];
  const defaultTeacher = teachers.find(
    (t) =>
      t.id === initialStudent?.teacherId ||
      t.name.trim().toLowerCase() === initialStudent?.teacherName?.trim().toLowerCase() ||
      t.id === defaultCourse?.teacherId
  ) || teachers[0];

  // Student Basic Info
  const [fullName, setFullName] = useState(initialStudent?.fullName || '');
  const [parentName, setParentName] = useState(initialStudent?.parentName || '');
  const [phone, setPhone] = useState(initialStudent?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialStudent?.whatsapp || '');
  const [age, setAge] = useState<number>(initialStudent?.age || 14);
  const [gender, setGender] = useState<Student['gender']>(initialStudent?.gender || 'Male');

  // Course Info
  const [courseId, setCourseId] = useState(initialStudent?.courseId || defaultCourse?.id || '');
  const [customCourseTitle, setCustomCourseTitle] = useState(
    initialStudent?.courseTitle || defaultCourse?.title || ''
  );
  const [totalFee, setTotalFee] = useState<number>(
    initialStudent ? initialStudent.totalFee : defaultCourse ? defaultCourse.price : 2500
  );
  const [batchTiming, setBatchTiming] = useState(
    initialStudent?.batchTiming || defaultCourse?.batchSchedule || 'Mon, Wed, Fri (5:00 PM - 6:30 PM)'
  );
  const [dueDate, setDueDate] = useState(
    initialStudent?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialStudent?.notes || '');

  // Teacher Name & Mobile Number (Required by user)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    initialStudent?.teacherId || defaultTeacher?.id || ''
  );
  const [teacherName, setTeacherName] = useState<string>(
    initialStudent?.teacherName || defaultTeacher?.name || ''
  );
  const [teacherPhone, setTeacherPhone] = useState<string>(
    initialStudent?.teacherPhone || defaultTeacher?.phone || ''
  );

  // For brand new admission: initial payment input
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number>(
    isEditing ? 0 : defaultCourse ? defaultCourse.price : 2500
  );
  const [initialPaymentMethod, setInitialPaymentMethod] = useState<PaymentMethod>('UPI');
  const [initialPaymentRemarks, setInitialPaymentRemarks] = useState('Admission registration fee');

  // When course changes, update price and batch timing
  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const c = courses.find((item) => item.id === id);
    if (c) {
      setCustomCourseTitle(c.title);
      setTotalFee(c.price);
      if (!isEditing) {
        setInitialPaymentAmount(c.price);
      }
      setBatchTiming(c.batchSchedule);

      // If course has a designated teacher, auto-suggest them if teacher not already typed
      if (c.teacherId) {
        const t = teachers.find((tch) => tch.id === c.teacherId);
        if (t && !teacherName) {
          setSelectedTeacherId(t.id);
          setTeacherName(t.name);
          setTeacherPhone(t.phone);
        }
      }
    }
  };

  // When teacher dropdown changes
  const handleTeacherSelect = (tchId: string) => {
    setSelectedTeacherId(tchId);
    if (tchId === 'new') {
      setTeacherName('');
      setTeacherPhone('');
    } else {
      const t = teachers.find((item) => item.id === tchId);
      if (t) {
        setTeacherName(t.name);
        setTeacherPhone(t.phone);
      }
    }
  };

  // Calculate 50% teacher share preview
  const calculated50Share = Math.round((Number(totalFee) || 0) * 0.5);

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

    const effectiveCourseTitle =
      courses.find((c) => c.id === courseId)?.title ||
      customCourseTitle.trim() ||
      'General Course';

    const studentData: Student = {
      id: initialStudent ? initialStudent.id : `std-${Date.now()}`,
      rollNo: initialStudent ? initialStudent.rollNo : `PRA-${Math.floor(100 + Math.random() * 900)}`,
      fullName: fullName.trim(),
      parentName: parentName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      age: Number(age) || 0,
      gender,
      courseId: courseId || `crs-manual-${Date.now()}`,
      courseTitle: effectiveCourseTitle,
      teacherId: selectedTeacherId !== 'new' ? selectedTeacherId : '',
      teacherName: teacherName.trim(),
      teacherPhone: teacherPhone.trim(),
      teacherShareAmount: calculated50Share,
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
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Simple & Clean */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-white shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white font-bold">
              {isEditing ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                {isEditing ? 'Student Details Edit Karein' : 'Naya Admission (Student Enrollment)'}
              </h2>
              <p className="text-[11px] text-amber-100">
                Student details aur Teacher ka 50% automatic hisaab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* SECTION 1: STUDENT BASIC DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider pb-1 border-b border-slate-200">
              <User className="h-4 w-4 text-amber-600" />
              <span>1. Student Ki Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Student Ka Naam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Umar / Age
                </label>
                <input
                  type="number"
                  min="3"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10 digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-mono font-medium focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  WhatsApp Number (Reminders ke liye)
                </label>
                <input
                  type="tel"
                  placeholder="WhatsApp number (optional)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mata / Pita (Guardian) Ka Naam
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Student['gender'])}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Male">Male (Ladka)</option>
                  <option value="Female">Female (Ladki)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: COURSE & FEES */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider pb-1 border-b border-slate-200">
              <GraduationCap className="h-4 w-4 text-amber-600" />
              <span>2. Course & Fees</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Course Chunein ya Likhein *
                </label>
                {courses.length > 0 ? (
                  <select
                    value={courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — {formatCurrency(c.price)}
                      </option>
                    ))}
                    <option value="custom">+ Dusra / Custom Course</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dance, Meditation, Acting, Guitar"
                    value={customCourseTitle}
                    onChange={(e) => setCustomCourseTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-medium focus:border-amber-500 focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Total Course Fee (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={totalFee}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setTotalFee(val);
                    if (!isEditing && initialPaymentAmount > val) {
                      setInitialPaymentAmount(val);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Batch Timing / Schedule
                </label>
                <input
                  type="text"
                  value={batchTiming}
                  onChange={(e) => setBatchTiming(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri (5:00 PM - 6:30 PM)"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Next Due Date (Fee Baki Date)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: TEACHER NAME & MOBILE NUMBER (CRITICAL USER REQUIREMENT) */}
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/80 via-white to-amber-50/60 p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-purple-200">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs">
                  50%
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xs sm:text-sm">
                    Teacher Details & 50% Auto Share
                  </h3>
                  <p className="text-[11px] text-purple-700 font-medium">
                    Admission hote hi 50% automatic is teacher ke column mein add ho jayega
                  </p>
                </div>
              </div>

              <span className="rounded-lg bg-purple-100 text-purple-900 px-2.5 py-1 text-[11px] font-black border border-purple-300">
                50% Share Formula
              </span>
            </div>

            {/* Quick dropdown if teachers already exist */}
            {teachers.length > 0 && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Existing Teacher Chunein (Ya Naya Name Likhein)
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => handleTeacherSelect(e.target.value)}
                  className="w-full rounded-xl border border-purple-300 bg-white p-2.5 text-xs text-slate-800 font-semibold focus:border-purple-500 focus:outline-none"
                >
                  <option value="">-- Teacher List Se Chunein --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Phone: {t.phone || 'N/A'}) • {t.specialty}
                    </option>
                  ))}
                  <option value="new">+ Naya Teacher Enter Karein</option>
                </select>
              </div>
            )}

            {/* Teacher Name & Mobile Number Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  <span>Teacher Ka Naam (Teacher Name) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma / Vikram Sir"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full rounded-xl border-2 border-purple-200 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-purple-600 focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-purple-600" />
                  <span>Teacher Ka Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10 digit teacher mobile number"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full rounded-xl border-2 border-purple-200 bg-white p-2.5 text-xs text-slate-900 font-mono font-bold focus:border-purple-600 focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 50% Live Share Summary Box */}
            <div className="rounded-xl bg-white p-3 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Total Fees Ka 50% Teacher Share:
                  </div>
                  <div className="font-bold text-slate-800 text-xs">
                    {teacherName ? `${teacherName}` : 'Teacher'} ko milne wala hisaab
                  </div>
                </div>
              </div>

              <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Automatic 50% Share
                </span>
                <span className="text-base font-black text-emerald-700">
                  {formatCurrency(calculated50Share)}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: FIRST FEE COLLECTION (OPTIONAL/INSTANT) */}
          {!isEditing && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                  <span>Admission Ke Samay Fees Jama (First Payment)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Abhi jama ya baad mein
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Abhi Jama Ki Gayi Fees (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalFee}
                    value={initialPaymentAmount}
                    onChange={(e) => setInitialPaymentAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-emerald-700 bg-white focus:border-amber-500 focus:outline-none"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Dena Baki: {formatCurrency(Math.max(0, totalFee - initialPaymentAmount))}</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={initialPaymentMethod}
                    onChange={(e) => setInitialPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 bg-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="UPI">UPI (GPay, PhonePe, Paytm, QR)</option>
                    <option value="Cash">Cash (Counter Par Diya)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                    <option value="Card">Card / Debit / Credit</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isEditing ? 'Save Changes' : 'Admission Confirm Karein & 50% Add Karein'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
