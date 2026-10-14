import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Sparkles,
  Check,
  ArrowRight,
  Filter,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { Course, Teacher } from '../../types/academy';
import { formatCurrency } from '../../utils/calculations';
import { STARTER_COURSE_TEMPLATES } from '../../data/initialData';

interface PublicCoursesProps {
  courses: Course[];
  teachers: Teacher[];
  onSelectCourseForAdmission: (course: Course | { title: string; price: number; duration: string }) => void;
}

export const PublicCourses: React.FC<PublicCoursesProps> = ({
  courses,
  teachers,
  onSelectCourseForAdmission,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Fallback to starter templates if academy has not added any custom courses yet
  const displayCourses: Array<{
    id: string;
    title: string;
    category: string;
    duration: string;
    price: number;
    description: string;
    batchSchedule: string;
    level: string;
    isPackage?: boolean;
    teacherName?: string;
  }> =
    courses.length > 0
      ? courses.map((c) => {
          const tch = teachers.find((t) => t.id === c.teacherId);
          return {
            ...c,
            teacherName: tch ? tch.name : undefined,
          };
        })
      : STARTER_COURSE_TEMPLATES.map((tpl, idx) => ({
          ...tpl,
          id: `preview-crs-${idx}`,
          teacherName: 'Senior PR Academy Mentor',
        }));

  const categories = ['All', 'Dance', 'Meditation', 'Acting', 'Guitar', 'Packages'];

  const filtered = displayCourses.filter((c) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Packages') return c.isPackage;
    return c.category === selectedCategory;
  });

  return (
    <section id="courses" className="py-20 bg-slate-900/60 border-t border-b border-slate-800/80 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
            <span>Comprehensive Curriculum & Batches</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Courses, Packages & Fee Structure
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Har age group aur skill level ke liye structured courses. Beginners se lekar stage performers tak,
            har student ko milti hai personalized guidance aur regular practice sessions.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat === 'Packages' ? '🎁 Combo Packs' : cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const isPkg = course.isPackage;

            return (
              <div
                key={course.id}
                className={`relative flex flex-col justify-between rounded-3xl border bg-slate-950/80 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl ${
                  isPkg
                    ? 'border-amber-400/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Category & Duration header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                          course.category === 'Dance'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : course.category === 'Meditation'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : course.category === 'Acting'
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                            : course.category === 'Guitar'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {course.category}
                      </span>
                      {isPkg && (
                        <span className="rounded-lg bg-amber-500 text-slate-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Combo
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      {course.duration}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Batch Details */}
                  <div className="mt-5 space-y-2 rounded-2xl bg-slate-900/90 p-3.5 border border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{course.batchSchedule}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                      <span>Level: <strong className="text-slate-200">{course.level || 'All Levels'}</strong></span>
                      <span>Faculty: <strong className="text-amber-300">{course.teacherName || 'PR Academy Expert'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Fee and Action */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Total Course Fee
                    </div>
                    <div className="text-xl font-black text-white">
                      {formatCurrency(course.price)}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectCourseForAdmission(course as any)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all active:scale-95"
                  >
                    <span>Apply Online</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">
              Kissi Custom Schedule Ya Combo Package Ki Talash Hai?
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Dance + Acting ya Guitar + Meditation ke combo packages par special fee discounts uplabdh hain.
            </p>
          </div>
          <button
            onClick={() => onSelectCourseForAdmission({ title: 'Custom Combo Pack', price: 5000, duration: '2 Months' })}
            className="shrink-0 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-3 text-xs font-bold text-amber-300 shadow-md"
          >
            Enquire For Custom Combo
          </button>
        </div>
      </div>
    </section>
  );
};
