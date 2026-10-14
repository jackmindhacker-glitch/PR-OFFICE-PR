import React from 'react';
import {
  Sparkles,
  Award,
  Heart,
  Target,
  Compass,
  CheckCircle2,
  Users,
  Shield,
  Zap,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 relative overflow-hidden bg-slate-950">
      {/* Decorative Blur */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Founder Showcase Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl text-center space-y-5">
              {/* Crest Badge */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/30">
                PR
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  Magician Pradeep Rajput
                </h3>
                <p className="text-xs font-bold text-amber-400 mt-1">
                  Founder & Artistic Director · PR ACADEMY
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 text-[10px] font-semibold text-amber-300">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Illusionist, Stage Performer & Mentor</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed text-left border-t border-b border-slate-800/80 py-4">
                "Performing arts sirf step sikhne ka naam nahi hai — yeh khud ke andar ke darr ko khatam karke stage par confidence ke sath khade hone ki kala hai. PR ACADEMY har bachche aur yuva ko stage ke liye taiyaar karti hai."
              </p>

              {/* Founder Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-slate-900 p-2.5 border border-slate-800">
                  <div className="font-black text-amber-400 text-base">100%</div>
                  <div className="text-[10px] text-slate-400">Practical Art</div>
                </div>
                <div className="rounded-2xl bg-slate-900 p-2.5 border border-slate-800">
                  <div className="font-black text-amber-400 text-base">4+</div>
                  <div className="text-[10px] text-slate-400">Disciplines</div>
                </div>
                <div className="rounded-2xl bg-slate-900 p-2.5 border border-slate-800">
                  <div className="font-black text-amber-400 text-base">Stage</div>
                  <div className="text-[10px] text-slate-400">Exposure</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Academy Story & Values (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>About Our Academy Vision</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              A Holistic Academy For Body, Mind & Artistic Soul
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              PR ACADEMY ki sthapna ek vishesh uddeshya ke sath ki gayi thi — ek aisi jagah jahan Dance ki energy, Meditation ki shanti, Acting ka passion aur Guitar ka sur ek hi chhat ke neeche milein.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Zap className="h-4 w-4" />
                  <span>Stage Confidence & Expression</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Har student ko camera acting aur stage presence sikhayi jaati hai taaki wo bina jhijhak ke public ke saamne perform kar sakein.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Heart className="h-4 w-4" />
                  <span>Mental Wellness & Meditation</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pranayama aur sound healing techniques ke zariye modern stress ko door karke focus aur mental calmness develop karna.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Users className="h-4 w-4" />
                  <span>50% Teacher Share Culture</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Humare instructors sirf karmachari nahi balki academy ke 50% partners hain — jisse har teacher apna 100% samarpit hokar sikhata hai.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <Shield className="h-4 w-4" />
                  <span>Personal Attention & Care</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Bade crowded batches ke bajay chhote, controlled batches taaki har student par vyaktigat dhyan diya ja sake.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
