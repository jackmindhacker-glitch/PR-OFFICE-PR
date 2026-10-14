import React from 'react';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Award,
  Users,
  Compass,
  Star,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AcademySettings } from '../../types/academy';

interface HeroSectionProps {
  settings: AcademySettings;
  onOpenAdmissionModal: () => void;
  onBrowseCourses: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onOpenAdmissionModal,
  onBrowseCourses,
}) => {
  const whatsappPhone = settings.phone.replace(/[^0-9]/g, '') || '919876543210';

  return (
    <section id="home" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
      {/* Background Glows & Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Admission Open Kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Admissions Open for New Batches · 2026-2027</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Where Passion Meets{' '}
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
                Stage Performance
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Welcome to <strong>{settings.academyName || 'PR ACADEMY'}</strong>, founded by{' '}
              <span className="text-amber-300 font-semibold">Magician Pradeep Rajput</span>.
              Transform your stage presence, rhythm, and artistic confidence through professional
              training in <strong>Dance</strong>, <strong>Meditation & Breathwork</strong>,{' '}
              <strong>Camera Acting</strong>, and <strong>Acoustic Guitar</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onOpenAdmissionModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 active:scale-95 transition-all"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Online Admission Apply Karein</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onBrowseCourses}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all active:scale-95"
              >
                <span>Courses & Fees Dekhein</span>
              </button>

              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Namaste PR Academy! Mujhe new batch admission ke bare mein inquiry karni hai.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3.5 text-sm font-bold text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500/70 transition-all active:scale-95"
              >
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp Query</span>
              </a>
            </div>

            {/* Trust Highlights Checklist */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Practical Stage Training</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Flexible Morning & Evening Batches</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>50% Teacher Share Quality Faculty</span>
              </div>
            </div>
          </div>

          {/* Right Visual Card Showcase (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl space-y-6">
              {/* Badge row */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Core Disciplines
                  </span>
                </div>
                <span className="text-xs text-slate-400">All Ages (Kids & Adults)</span>
              </div>

              {/* 4 Feature Boxes */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-3.5 hover:border-rose-500/40 transition-all">
                  <div className="text-xl mb-1">💃</div>
                  <h2 className="text-sm font-bold text-white">Dance Studio</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bollywood, Hip-Hop, Freestyle & Classical</p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 hover:border-emerald-500/40 transition-all">
                  <div className="text-xl mb-1">🧘</div>
                  <h2 className="text-sm font-bold text-white">Meditation & Yoga</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pranayama, Breathwork, Peace & Focus</p>
                </div>

                <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3.5 hover:border-purple-500/40 transition-all">
                  <div className="text-xl mb-1">🎭</div>
                  <h2 className="text-sm font-bold text-white">Acting Academy</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Camera Drama, Voice Modulation & Audition Prep</p>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-3.5 hover:border-blue-500/40 transition-all">
                  <div className="text-xl mb-1">🎸</div>
                  <h2 className="text-sm font-bold text-white">Guitar & Music</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Chords, Strumming, Tabs & Song Compositions</p>
                </div>
              </div>

              {/* Quick Academy Card Footer */}
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    Need Help Choosing a Course?
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Free demo & trial sessions available
                  </div>
                </div>
                <button
                  onClick={onOpenAdmissionModal}
                  className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all"
                >
                  Book Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
