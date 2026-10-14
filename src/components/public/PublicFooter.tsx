import React from 'react';
import {
  Sparkles,
  Lock,
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  Heart,
} from 'lucide-react';
import { AcademySettings } from '../../types/academy';

interface PublicFooterProps {
  settings: AcademySettings;
  onOpenPortal: () => void;
  onOpenAdmissionModal: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  settings,
  onOpenPortal,
  onOpenAdmissionModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* Top CTA Row */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-base font-black text-white">
              Ready to Start Your Performing Arts Journey?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Limited seats in each batch for personalized guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmissionModal}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all"
            >
              Online Admission Apply
            </button>
            <button
              onClick={onOpenPortal}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-amber-300 transition-all flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-base shadow-md">
                PR
              </div>
              <span className="text-base font-extrabold text-white">
                {settings.academyName || 'PR ACADEMY'}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Excellence in Dance, Meditation, Camera Acting & Acoustic Guitar under the guidance of Magician Pradeep Rajput.
            </p>
            <div className="text-[11px] text-amber-400 font-semibold">
              Founder: Magician Pradeep Rajput
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Navigation</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a href="#home" className="hover:text-amber-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#courses" className="hover:text-amber-400 transition-colors">Courses & Fee Structure</a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-400 transition-colors">About Magician Pradeep Rajput</a>
              </li>
              <li>
                <a href="#features" className="hover:text-amber-400 transition-colors">Why PR Academy</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-400 transition-colors">Contact & Location</a>
              </li>
            </ul>
          </div>

          {/* Disciplines */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Core Disciplines</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>💃 Bollywood & Freestyle Dance</li>
              <li>🧘 Meditation & Breathwork Pranayama</li>
              <li>🎭 Camera Acting & Theater Drama</li>
              <li>🎸 Acoustic & Electric Guitar</li>
              <li>🎁 Performer Combo Packages</li>
            </ul>
          </div>

          {/* Contact Details & Staff Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Connect With Us</h4>
            <div className="space-y-1.5 text-slate-400 text-xs">
              <div>Phone: <strong className="text-white font-mono">{settings.phone}</strong></div>
              <div>Email: <strong className="text-white">{settings.email}</strong></div>
              <div>Address: {settings.address}</div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenPortal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-slate-800"
              >
                <Lock className="h-3 w-3 text-amber-400" />
                <span>Staff & Management Portal Access</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {settings.academyName || 'PR ACADEMY'}. All rights reserved. Directed by Magician Pradeep Rajput.
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 hover:text-amber-400 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
};
