import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Video,
  Clock,
  Music,
  Users,
  Compass,
  CheckCircle,
} from 'lucide-react';

interface FeaturesSectionProps {
  onOpenAdmissionModal: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onOpenAdmissionModal,
}) => {
  const perks = [
    {
      icon: Video,
      title: 'Camera & Stage Audition Training',
      description: 'Camera facing, mic handling, and audition preparation for reality shows and theater productions.',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    },
    {
      icon: Music,
      title: 'Acoustic Sound Rehearsal Space',
      description: 'Dedicated sound-treated room for guitar strumming, vocal practice, and dialogue projection.',
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30',
    },
    {
      icon: Award,
      title: 'Course Completion Certificates',
      description: 'Recognized academy certification for completed levels in Dance, Meditation, Acting, and Guitar.',
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
    },
    {
      icon: Clock,
      title: 'Flexible Morning, Evening & Weekend Batches',
      description: 'Convenient timings for school kids, college students, and working professionals.',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Users,
      title: '50% Teacher Faculty Model',
      description: 'Senior mentors receive a direct 50% revenue share, ensuring passionate, personal dedication to each learner.',
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
    },
    {
      icon: ShieldCheck,
      title: 'WhatsApp Progress & Fee Transparency',
      description: 'Instant automated receipts, schedule notifications, and gentle fee reminders via official WhatsApp.',
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-900/40 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Academy Advantages</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Kyun Chunein PR ACADEMY?
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Hum sirf sikhate nahi, balki ek supportive community banate hain jahan har student bina kisi hesitation ke grow kar sake.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 hover:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br border ${perk.color} mb-4`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {perk.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {perk.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Strip */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenAdmissionModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-8 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-amber-300 transition-all active:scale-95"
          >
            <span>Apna Free Demo Class Book Karein</span>
          </button>
        </div>
      </div>
    </section>
  );
};
