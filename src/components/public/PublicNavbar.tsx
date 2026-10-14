import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Phone,
  MessageSquare,
  Lock,
  Menu,
  X,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AcademySettings } from '../../types/academy';

interface PublicNavbarProps {
  settings: AcademySettings;
  onOpenPortal: () => void;
  onOpenAdmissionModal: () => void;
  isUnlocked: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  settings,
  onOpenPortal,
  onOpenAdmissionModal,
  isUnlocked,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Courses & Fees', href: '#courses' },
    { label: 'About Founder', href: '#about' },
    { label: 'Why PR Academy', href: '#features' },
    { label: 'Contact Us', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappPhone = settings.phone.replace(/[^0-9]/g, '') || '919876543210';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40 py-2.5'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo Branding */}
        <a
          href="#home"
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-black text-lg shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
            PR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {settings.academyName || 'PR ACADEMY'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-amber-400/90 tracking-wide">
              Dance · Meditation · Acting · Guitar
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Namaste PR Academy! Mujhe courses aur admission ke bare mein janna hai.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-500/60 transition-all shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={onOpenAdmissionModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Online Admission</span>
          </button>

          <button
            onClick={onOpenPortal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-slate-800 hover:border-amber-500/40 transition-all active:scale-95 shadow-xs"
            title="Academy Management & Admin Portal"
          >
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>Admin Portal</span>
            {isUnlocked && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" title="Unlocked" />
            )}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenPortal}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-slate-800"
          >
            <Lock className="h-3 w-3 text-amber-400" />
            <span>Portal</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-amber-500/20 px-5 py-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left py-2 text-sm font-semibold text-slate-200 hover:text-amber-400 border-b border-slate-800/60"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 space-y-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmissionModal();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 shadow-md"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Online Admission Form</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Namaste PR Academy! Mujhe courses aur admission ke bare mein janna hai.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/50 py-2 text-xs font-semibold text-emerald-300"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPortal();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-bold text-amber-300"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
