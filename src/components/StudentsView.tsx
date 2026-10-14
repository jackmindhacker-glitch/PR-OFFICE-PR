import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  CreditCard,
  Edit2,
  Trash2,
  FileText,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  IndianRupee,
  User,
  Percent,
} from 'lucide-react';
import { Student, Course, PaymentRecord, Teacher } from '../types/academy';
import { formatCurrency, formatDate } from '../utils/calculations';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface StudentsViewProps {
  students: Student[];
  courses: Course[];
  teachers: Teacher[];
  payments: PaymentRecord[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenWhatsApp: (student: Student) => void;
  onOpenPaymentModal: (student: Student) => void;
  onViewReceipt: (payment: PaymentRecord, student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  courses,
  teachers,
  payments,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenWhatsApp,
  onOpenPaymentModal,
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Due' | 'Paid' | 'Partial'>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [teacherFilter, setTeacherFilter] = useState<string>('All');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const courseMap = new Map<string, Course>();
  courses.forEach((c) => courseMap.set(c.id, c));

  const teacherMap = new Map<string, Teacher>();
  teachers.forEach((t) => teacherMap.set(t.id, t));

  const filteredStudents = students.filter((student) => {
    const course = courseMap.get(student.courseId);
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      (student.parentName && student.parentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.teacherName && student.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.teacherPhone && student.teacherPhone.includes(searchQuery));

    const isDue = student.totalFee > student.paidAmount;
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Due'
        ? isDue
        : statusFilter === 'Paid'
        ? student.status === 'Paid'
        : student.status === 'Partial';

    const matchesCourse = courseFilter === 'All' ? true : student.courseId === courseFilter;

    const matchesTeacher =
      teacherFilter === 'All'
        ? true
        : student.teacherId === teacherFilter ||
          (student.teacherName &&
            teachers.find((t) => t.id === teacherFilter)?.name.toLowerCase() ===
              student.teacherName.toLowerCase());

    return matchesSearch && matchesStatus && matchesCourse && matchesTeacher;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
            <span>Bachcho Ke Admissions & Records</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              {students.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Student details, WhatsApp fee reminders, aur payment records
          </p>
        </div>

        <button
          onClick={onAddStudent}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Naya Student Admission</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('All')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'All'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sabhi ({students.length})
          </button>
          <button
            onClick={() => setStatusFilter('Due')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'Due'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Fees Pending ({students.filter((s) => s.totalFee > s.paidAmount).length})
          </button>
          <button
            onClick={() => setStatusFilter('Paid')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              statusFilter === 'Paid'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Fully Paid ({students.filter((s) => s.status === 'Paid').length})
          </button>
        </div>

        {/* Course Filter & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full sm:w-40 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-amber-500 focus:outline-none"
          >
            <option value="All">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {teachers.length > 0 && (
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full sm:w-40 rounded-xl border border-purple-200 bg-purple-50/50 px-3 py-2 text-xs text-purple-900 font-medium focus:border-purple-500 focus:outline-none"
            >
              <option value="All">All Teachers</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search naam, roll, teacher..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Desktop & iPad Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Roll / Student</th>
                <th className="py-3.5 px-4">Course & Batch</th>
                <th className="py-3.5 px-4 text-purple-900 font-bold">Teacher & Mobile</th>
                <th className="py-3.5 px-4">Total Fee</th>
                <th className="py-3.5 px-4">Paid / Due</th>
                <th className="py-3.5 px-4 text-center text-purple-900 font-bold">Teacher 50% Share</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">WhatsApp Reminder</th>
                <th className="py-3.5 px-4 text-center">Payment Detail</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const course = courseMap.get(student.courseId);
                const teacher =
                  teacherMap.get(student.teacherId || '') ||
                  teachers.find(
                    (t) =>
                      t.name.trim().toLowerCase() === student.teacherName?.trim().toLowerCase()
                  );
                const displayTeacherName = student.teacherName || teacher?.name || 'Academy Direct';
                const displayTeacherPhone = student.teacherPhone || teacher?.phone || '';
                const teacher50Share =
                  student.teacherShareAmount ||
                  Math.round(
                    ((student.paidAmount > 0 ? student.paidAmount : student.totalFee) || 0) * 0.5
                  );
                const dueAmount = Math.max(0, student.totalFee - student.paidAmount);
                const isPaid = dueAmount === 0;

                return (
                  <tr key={student.id} className="hover:bg-amber-50/30 transition-colors">
                    {/* Student Name & Roll */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{student.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {student.rollNo} • Age {student.age}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Course & Timing */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {student.courseTitle || (course ? course.title : 'Course N/A')}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {student.batchTiming || course?.batchSchedule || '-'}
                      </div>
                    </td>

                    {/* Teacher Name & Mobile Number (Required by user) */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-purple-950 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        <span>{displayTeacherName}</span>
                      </div>
                      {displayTeacherPhone ? (
                        <div className="text-[11px] text-purple-700 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-purple-400 shrink-0" />
                          <a href={`tel:${displayTeacherPhone}`} className="hover:underline">
                            {displayTeacherPhone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Mobile n/a</span>
                      )}
                    </td>

                    {/* Total Fee */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatCurrency(student.totalFee)}
                    </td>

                    {/* Paid vs Due */}
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-700 font-bold">
                        {formatCurrency(student.paidAmount)}
                      </div>
                      {dueAmount > 0 ? (
                        <div className="text-rose-600 font-bold text-[11px]">
                          Due: {formatCurrency(dueAmount)}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">Nil Due</div>
                      )}
                    </td>

                    {/* Teacher 50% Auto Share */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center rounded-xl bg-purple-50 px-3 py-1 border border-purple-200">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                          50% Vetan
                        </span>
                        <span className="text-xs font-black text-purple-900">
                          {formatCurrency(teacher50Share)}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.paidAmount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span>{student.status}</span>
                      </span>
                    </td>

                    {/* WhatsApp Reminder Column & Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenWhatsApp(student)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                          dueAmount > 0
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Send WhatsApp Message / Fee Reminder"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{dueAmount > 0 ? 'Reminder' : 'Message'}</span>
                      </button>
                    </td>

                    {/* Payment Detail Button */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenPaymentModal(student)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-all active:scale-95"
                        title="View / Add Payment Detail"
                      >
                        <IndianRupee className="h-3.5 w-3.5 text-amber-400" />
                        <span>Payment Detail</span>
                      </button>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditStudent(student)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600"
                          title="Edit Student Info"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Mobile Card View (Phone Friendly) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredStudents.map((student) => {
          const course = courseMap.get(student.courseId);
          const teacher =
            teacherMap.get(student.teacherId || '') ||
            teachers.find(
              (t) =>
                t.name.trim().toLowerCase() === student.teacherName?.trim().toLowerCase()
            );
          const displayTeacherName = student.teacherName || teacher?.name || 'Academy Direct';
          const displayTeacherPhone = student.teacherPhone || teacher?.phone || '';
          const teacher50Share =
            student.teacherShareAmount ||
            Math.round(
              ((student.paidAmount > 0 ? student.paidAmount : student.totalFee) || 0) * 0.5
            );
          const dueAmount = Math.max(0, student.totalFee - student.paidAmount);

          return (
            <div
              key={student.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {student.fullName}
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                      {student.rollNo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {student.courseTitle || (course ? course.title : 'Course')}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    dueAmount === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {dueAmount === 0 ? 'Paid' : `Due: ${formatCurrency(dueAmount)}`}
                </span>
              </div>

              {/* Teacher & 50% Share Card Box (Requested) */}
              <div className="rounded-xl bg-purple-50/80 p-2.5 text-xs flex justify-between items-center border border-purple-200">
                <div>
                  <span className="text-[10px] text-purple-700 font-bold uppercase block">
                    Teacher & Mobile
                  </span>
                  <span className="font-bold text-purple-950 flex items-center gap-1 mt-0.5">
                    <User className="h-3.5 w-3.5 text-purple-600" />
                    <span>{displayTeacherName}</span>
                  </span>
                  {displayTeacherPhone ? (
                    <span className="text-[11px] text-purple-700 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-purple-500" />
                      <a href={`tel:${displayTeacherPhone}`} className="hover:underline">
                        {displayTeacherPhone}
                      </a>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 block mt-0.5">Mobile not added</span>
                  )}
                </div>

                <div className="text-right bg-white px-2.5 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                  <span className="text-[10px] text-purple-700 font-bold uppercase block">
                    50% Share
                  </span>
                  <span className="text-sm font-black text-purple-900">
                    {formatCurrency(teacher50Share)}
                  </span>
                </div>
              </div>

              {/* Fee Bar */}
              <div className="rounded-xl bg-slate-50 p-2.5 text-xs flex justify-between items-center border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">TOTAL FEE</span>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(student.totalFee)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PAID</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(student.paidAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">PENDING</span>
                  <span className="font-bold text-rose-600">
                    {formatCurrency(dueAmount)}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="text-xs text-slate-600 flex justify-between items-center">
                <span>Phone: {student.phone}</span>
                <span className="text-slate-400 text-[11px]">
                  Due: {formatDate(student.dueDate)}
                </span>
              </div>

              {/* Action Buttons as requested */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => onOpenWhatsApp(student)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-2xs active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Reminder</span>
                </button>
                <button
                  onClick={() => onOpenPaymentModal(student)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white shadow-2xs active:scale-95"
                >
                  <IndianRupee className="h-4 w-4 text-amber-400" />
                  <span>Payment Detail</span>
                </button>
              </div>

              {/* Edit / Delete Footer */}
              <div className="flex justify-end gap-3 pt-1 text-xs">
                <button
                  onClick={() => onEditStudent(student)}
                  className="text-slate-500 hover:text-amber-600 flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => setStudentToDelete(student)}
                  className="text-rose-500 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-white">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-bold text-slate-800">Koi student nahi mila</h3>
          <p className="mt-1 text-xs text-slate-500">
            Naya admission lene ke liye button dabayein.
          </p>
          <button
            onClick={onAddStudent}
            className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
          >
            + Naya Admission
          </button>
        </div>
      )}

      {/* Confirmation Modal for Student Deletion */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="Student Record Delete Karein?"
        message="Kya aap sach mein is student ka admission record delete karna chahte hain? Isse unki fees aur enrollment history remove ho jayegi."
        itemName={studentToDelete ? `${studentToDelete.fullName} (${studentToDelete.rollNo})` : undefined}
        confirmButtonText="Haan, Delete Karein"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />
    </div>
  );
};
