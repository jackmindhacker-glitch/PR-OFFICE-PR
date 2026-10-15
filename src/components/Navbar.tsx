import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  IndianRupee,
  Wallet,
  Lock,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  Settings,
  Cloud,
  Globe,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'courses' | 'students' | 'payments' | 'teachers';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLockApp: () => void;
  onQuickAdmission: () => void;
  onAddCourse: () => void;
  onOpenSettings: () => void;
  onSwitchToWebsite?: () => void;
  isGoogleConnected?: boolean;
  pendingDueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onLockApp,
  onQuickAdmission,
  onAddCourse,
  onOpenSettings,
  onSwitchToWebsite,
  isGoogleConnected,
  pendingDueCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      sublabel: 'Overview & Stats',
      icon: LayoutDashboard,
    },
    {
      id: 'courses' as NavTab,
      label: 'Courses & Packages',
      sublabel: 'Dance, Acting, Meditation...',
      icon: GraduationCap,
    },
    {
      id: 'students' as NavTab,
      label: 'Bachcho Ke Admissions',
      sublabel: 'Students & WhatsApp Reminders',
      icon: Users,
      badge: pendingDueCount > 0 ? `${pendingDueCount} Due` : undefined,
    },
    {
      id: 'payments' as NavTab,
      label: 'Payment Details',
      sublabel: 'Puri Payment History',
      icon: IndianRupee,
    },
    {
      id: 'teachers' as NavTab,
      label: 'Teacher Salary (15 & 30 Tarikh)',
      sublabel: 'Auto 15 & 30 Tarikh Payout Schedule',
      icon: Wallet,
      highlight: true,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Academy Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white font-black text-lg shadow-md shadow-amber-500/25">
              PR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  PR ACADEMY
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/60">
                  <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                  Arts & Performance
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Dance • Meditation • Acting • Guitar
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-bold text-white leading-none">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !item.badge && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions & Lock */}
          <div className="flex items-center gap-2">
            {onSwitchToWebsite && (
              <button
                onClick={onSwitchToWebsite}
                title="Public Website Dekhein"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-all shadow-2xs"
              >
                <Globe className="h-4 w-4 text-amber-700" />
                <span className="hidden sm:inline">🌐 Website</span>
              </button>
            )}

            <button
              onClick={onQuickAdmission}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-amber-700 transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Naya Admission</span>
              <span className="sm:hidden">Admission</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Settings & Google Drive Storage"
              className="relative inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
            >
              <Settings className="h-4 w-4 text-slate-600" />
              <span className="hidden md:inline">Settings</span>
              {isGoogleConnected && (
                <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Google Drive Connected" />
              )}
            </button>

            <button
              onClick={onLockApp}
              title="PIN se Lock karein"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
            >
              <Lock className="h-4 w-4 text-slate-500" />
              <span className="hidden md:inline">Lock</span>
            </button>

            {/* Mobile toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu if open */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden space-y-1">
            {onSwitchToWebsite && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchToWebsite();
                }}
                className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-amber-700" />
                  <span>Public Website Dekhein</span>
                </div>
                <span>→</span>
              </button>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="text-left">
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {item.sublabel}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Bottom Navigation for Mobile Devices (Phone / Compact Tablet) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 py-1.5 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </div>
                <span className="mt-0.5 truncate max-w-[62px]">
                  {item.id === 'teachers'
                    ? 'Salary (50%)'
                    : item.id === 'courses'
                    ? 'Courses'
                    : item.id === 'students'
                    ? 'Admissions'
                    : item.id === 'payments'
                    ? 'Payments'
                    : 'Home'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
