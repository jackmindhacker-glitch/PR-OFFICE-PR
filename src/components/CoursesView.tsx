import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Package,
  Calendar,
  Clock,
  Sparkles,
  Users,
  Search,
  Check,
  Percent,
} from 'lucide-react';
import { Course, Teacher, Student } from '../types/academy';
import { formatCurrency } from '../utils/calculations';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { STARTER_COURSE_TEMPLATES } from '../data/initialData';

interface CoursesViewProps {
  courses: Course[];
  teachers: Teacher[];
  students: Student[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (id: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  teachers,
  students,
  onSaveCourse,
  onDeleteCourse,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<Course['category']>('Dance');
  const [formDuration, setFormDuration] = useState('1 Month');
  const [formPrice, setFormPrice] = useState(2500);
  const [formTeacherId, setFormTeacherId] = useState(teachers[0]?.id || '');
  const [formSchedule, setFormSchedule] = useState('Mon, Wed, Fri (5:00 PM - 6:30 PM)');
  const [formLevel, setFormLevel] = useState<Course['level']>('Beginner');
  const [formDescription, setFormDescription] = useState('');
  const [formIsPackage, setFormIsPackage] = useState(false);
  const [formIncludedCourseIds, setFormIncludedCourseIds] = useState<string[]>([]);

  const categories = ['All', 'Dance', 'Meditation', 'Acting', 'Guitar', 'Packages'];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Packages'
        ? c.isPackage
        : c.category === selectedCategory;

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = (isPackageMode = false) => {
    setEditingCourse(null);
    setFormTitle('');
    setFormCategory(isPackageMode ? 'Other' : 'Dance');
    setFormDuration(isPackageMode ? '3 Months' : '1 Month');
    setFormPrice(isPackageMode ? 10000 : 2500);
    setFormTeacherId(teachers[0]?.id || '');
    setFormSchedule('Mon, Wed, Fri (5:00 PM - 6:30 PM)');
    setFormLevel('All Levels');
    setFormDescription('');
    setFormIsPackage(isPackageMode);
    setFormIncludedCourseIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormCategory(course.category);
    setFormDuration(course.duration);
    setFormPrice(course.price);
    setFormTeacherId(course.teacherId);
    setFormSchedule(course.batchSchedule);
    setFormLevel(course.level);
    setFormDescription(course.description);
    setFormIsPackage(!!course.isPackage);
    setFormIncludedCourseIds(course.includedCourseIds || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newOrUpdatedCourse: Course = {
      id: editingCourse ? editingCourse.id : `crs-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      duration: formDuration,
      price: Number(formPrice) || 0,
      teacherId: formTeacherId,
      description: formDescription.trim(),
      batchSchedule: formSchedule.trim(),
      level: formLevel,
      isPackage: formIsPackage,
      includedCourseIds: formIsPackage ? formIncludedCourseIds : undefined,
    };

    onSaveCourse(newOrUpdatedCourse);
    setIsModalOpen(false);
  };

  const toggleIncludeCourse = (courseId: string) => {
    setFormIncludedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
            <span>Academy Courses & Packages</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              {courses.length} Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dance, Meditation, Acting, Guitar aur Custom Packages manage karein
          </p>
        </div>

        {/* Action Buttons as requested: "course add karne Ke liye button edit package Banane Ke liye ek button" */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenAdd(false)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Naya Course Add Karein</span>
          </button>
          <button
            onClick={() => handleOpenAdd(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-95"
          >
            <Package className="h-4 w-4 text-amber-400" />
            <span>+ Combo Package Banayein</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'Packages' ? '🎁 Packages' : cat}
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
            placeholder="Search course or dance..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const teacher = teachers.find((t) => t.id === course.teacherId);
          const enrolledStudents = students.filter((s) => s.courseId === course.id);
          const isPkg = course.isPackage;

          return (
            <div
              key={course.id}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all hover:shadow-lg ${
                isPkg
                  ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                {/* Badge row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        course.category === 'Dance'
                          ? 'bg-rose-100 text-rose-700'
                          : course.category === 'Meditation'
                          ? 'bg-emerald-100 text-emerald-700'
                          : course.category === 'Acting'
                          ? 'bg-purple-100 text-purple-700'
                          : course.category === 'Guitar'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {course.category}
                    </span>
                    {isPkg && (
                      <span className="rounded-lg bg-amber-500 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Combo Pack
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {course.duration}
                  </span>
                </div>

                {/* Course Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {course.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {course.description}
                </p>

                {/* Schedule and Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{course.batchSchedule}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Instructor / Teacher:</span>
                    <span className="font-bold text-slate-800">
                      {teacher ? teacher.name : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3" /> Teacher 50% Auto Share:
                    </span>
                    <span className="font-bold">
                      {formatCurrency(Math.round(course.price * 0.5))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer: Price & Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Course Fee
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(course.price)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      / {course.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors border border-transparent hover:border-amber-200"
                    title="Edit Course / Package"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCourseToDelete(course)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center bg-white space-y-4">
          <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Abhi tak koi Course add nahi hua hai</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Naya course banayein ya PR Academy ke standard course categories (Dance, Meditation, Acting, Guitar) ko 1 click mein add karein.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleOpenAdd(false)}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition-all active:scale-95"
            >
              + Naya Custom Course Banayein
            </button>
            <button
              onClick={() => {
                STARTER_COURSE_TEMPLATES.forEach((tpl, idx) => {
                  onSaveCourse({
                    ...tpl,
                    id: `crs-${Date.now()}-${idx}`,
                    teacherId: teachers[0]?.id || '',
                  });
                });
              }}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-slate-800 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>⚡ Standard Courses Add Karein (Dance, Meditation, Acting, Guitar)</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Course / Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <h2 className="text-base font-bold">
                  {editingCourse
                    ? formIsPackage
                      ? 'Edit Package'
                      : 'Edit Course'
                    : formIsPackage
                    ? 'Naya Combo Package Banayein'
                    : 'Naya Course Add Karein'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Package Toggle */}
              <div className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3 border border-amber-200">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Is this a Combo Package?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bundle multiple courses (e.g. Dance + Acting)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPackage}
                    onChange={(e) => setFormIsPackage(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Course / Package Ka Naam *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bollywood & Freestyle Dance, Acting Masterclass..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Course['category'])}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Dance">Dance</option>
                    <option value="Meditation">Meditation</option>
                    <option value="Acting">Acting</option>
                    <option value="Guitar">Guitar</option>
                    <option value="Singing">Singing</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Other">Other / Combo</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Duration / Avadhi
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 1 Month, 3 Months, 6 Months"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fee & Assigned Teacher */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Total Fees (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-emerald-600 block mt-0.5">
                    Teacher Auto Share (50%): {formatCurrency(Math.round(formPrice * 0.5))}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Assigned Teacher *
                  </label>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">Academy Direct / Self (PR ACADEMY)</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch Schedule */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Batch Schedule / Timing
                </label>
                <input
                  type="text"
                  value={formSchedule}
                  onChange={(e) => setFormSchedule(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri (5:00 PM - 6:30 PM)"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Course Description / Jankari
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Course ke baare mein kuch likhein..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Included courses if package */}
              {formIsPackage && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">
                    Select Courses Included in this Combo:
                  </label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50">
                    {courses
                      .filter((c) => !c.isPackage && c.id !== editingCourse?.id)
                      .map((c) => {
                        const isIncluded = formIncludedCourseIds.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => toggleIncludeCourse(c.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                              isIncluded
                                ? 'bg-amber-100 text-amber-900 font-semibold'
                                : 'hover:bg-slate-200/60 text-slate-700'
                            }`}
                          >
                            <span>{c.title}</span>
                            {isIncluded && <Check className="h-4 w-4 text-amber-600" />}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white shadow-md hover:bg-amber-600 transition-all"
                >
                  {editingCourse ? 'Save Changes' : 'Course Add Karein'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Course Deletion */}
      <ConfirmDeleteModal
        isOpen={!!courseToDelete}
        title="Course Delete Karein?"
        message="Kya aap sach mein is course ko delete karna chahte hain? Isse juda sara data hata diya jayega."
        itemName={courseToDelete ? `${courseToDelete.title} (${formatCurrency(courseToDelete.price)})` : undefined}
        confirmButtonText="Haan, Delete Karein"
        onConfirm={() => {
          if (courseToDelete) {
            onDeleteCourse(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        onClose={() => setCourseToDelete(null)}
      />
    </div>
  );
};
