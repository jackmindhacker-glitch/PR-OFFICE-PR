import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  Clock,
  Send,
} from 'lucide-react';
import { Course, Student } from '../../types/academy';
import { formatCurrency } from '../../utils/calculations';

interface OnlineAdmissionModalProps {
  courses: Course[];
  preSelectedCourse?: Course | { title: string; price: number; duration: string } | null;
  academyPhone: string;
  onSaveAdmission: (student: Student) => void;
  onClose: () => void;
}

export const OnlineAdmissionModal: React.FC<OnlineAdmissionModalProps> = ({
  courses,
  preSelectedCourse,
  academyPhone,
  onSaveAdmission,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [age, setAge] = useState<number>(14);
  const [gender, setGender] = useState<Student['gender']>('Male');
  const [courseId, setCourseId] = useState<string>(
    preSelectedCourse && 'id' in preSelectedCourse
      ? (preSelectedCourse as Course).id
      : courses[0]?.id || ''
  );
  const [preferredBatch, setPreferredBatch] = useState('Evening (5:00 PM - 7:00 PM)');
  const [message, setMessage] = useState('');

  const [submittedStudent, setSubmittedStudent] = useState<Student | null>(null);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const coursePrice = selectedCourse ? selectedCourse.price : preSelectedCourse ? preSelectedCourse.price : 2500;
  const courseTitle = selectedCourse ? selectedCourse.title : preSelectedCourse ? preSelectedCourse.title : 'Course';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const rollNo = `PRA-WEB-${Math.floor(100 + Math.random() * 900)}`;
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      rollNo,
      fullName: fullName.trim(),
      parentName: parentName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      age: Number(age) || 0,
      gender,
      courseId: courseId || 'online-inquiry',
      enrollmentDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalFee: coursePrice,
      paidAmount: 0,
      status: 'Pending',
      batchTiming: preferredBatch,
      notes: `Online Website Application · Batch Preference: ${preferredBatch}${message.trim() ? ` · Message: ${message.trim()}` : ''}`,
      source: 'website',
    };

    onSaveAdmission(newStudent);
    setSubmittedStudent(newStudent);
  };

  const cleanAcademyPhone = academyPhone.replace(/[^0-9]/g, '') || '919876543210';

  const whatsappMessage = submittedStudent
    ? encodeURIComponent(
        `Namaste PR ACADEMY!\nMaine online admission form submit kiya hai:\n\n` +
          `• Student Name: ${submittedStudent.fullName}\n` +
          `• Reference No: ${submittedStudent.rollNo}\n` +
          `• Course: ${courseTitle}\n` +
          `• Mobile: ${submittedStudent.phone}\n` +
          `• Preferred Timing: ${submittedStudent.batchTiming}\n\n` +
          `Kripya batch schedule aur seat confirmation provide karein. Dhanyawad!`
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-amber-500/30 text-white shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-6 py-4 text-slate-950">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 font-black" />
            <div>
              <h2 className="text-base font-black tracking-tight">
                PR ACADEMY — Online Admission Form
              </h2>
              <p className="text-[11px] font-semibold text-slate-900/80">
                Naye batch mein apni seat book karein
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-950/80 hover:bg-slate-950/10 hover:text-slate-950 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submittedStudent ? (
          /* Submission Success State */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">
                Admission Application Safalta-Purvak Submit Ho Gayi!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Aapka admission reference number generate ho gaya hai. Academy coordinator aapse jald hi batch timing aur registration formalities ke liye contact karenge.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-left space-y-2 max-w-sm mx-auto text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Reference No:</span>
                <span className="font-mono font-bold text-amber-400">{submittedStudent.rollNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-white">{submittedStudent.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Selected Course:</span>
                <span className="font-semibold text-slate-200">{courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Course Fee:</span>
                <span className="font-black text-emerald-400">{formatCurrency(coursePrice)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/${cleanAcademyPhone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp Par Confirmation Bhejein</span>
              </a>

              <button
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-3 text-xs font-bold text-slate-300"
              >
                Bandh Karein
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Student Name & Age */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="font-semibold text-slate-200 block mb-1">
                  Student Ka Pura Naam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Umar / Age *
                </label>
                <input
                  type="number"
                  min="4"
                  max="80"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Parent Name & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Mata / Pita (Guardian) Ka Naam
                </label>
                <input
                  type="text"
                  placeholder="Parent / Guardian Name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Student['gender'])}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  Mobile / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-200 block mb-1">
                  WhatsApp Number (Reminders)
                </label>
                <input
                  type="tel"
                  placeholder="Same or different"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Course & Preferred Timing */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 space-y-3">
              <div>
                <label className="font-bold text-amber-300 block mb-1">
                  Course Ya Discipline Chunein *
                </label>
                {courses.length > 0 ? (
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-semibold focus:border-amber-400 focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.duration}) — {formatCurrency(c.price)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                    {courseTitle} ({formatCurrency(coursePrice)})
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Preferred Batch Timing
                </label>
                <select
                  value={preferredBatch}
                  onChange={(e) => setPreferredBatch(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Morning (6:30 AM - 8:30 AM)">Morning (6:30 AM - 8:30 AM) — Yoga/Meditation/Dance</option>
                  <option value="Afternoon (4:00 PM - 5:30 PM)">Afternoon (4:00 PM - 5:30 PM) — Guitar & Basics</option>
                  <option value="Evening (5:30 PM - 7:30 PM)">Evening (5:30 PM - 7:30 PM) — Dance & Acting</option>
                  <option value="Weekend Special (Sat & Sun)">Weekend Special (Saturday & Sunday Intensive)</option>
                </select>
              </div>
            </div>

            {/* Prior Experience / Message */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Kissi Purane Experience Ya Sawal Ke Baare Mein Likhein (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Pehle dance kiya hai, guitar seekhna chahta hoon..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none resize-none"
              />
            </div>

            {/* Footer Submit */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Submit Admission Form</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
