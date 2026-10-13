import React, { useState } from 'react';
import {
  Settings,
  HardDrive,
  Mail,
  CheckCircle2,
  RefreshCw,
  Upload,
  Download,
  Lock,
  X,
  IndianRupee,
  ShieldCheck,
  Cloud,
  CloudLightning,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { AcademySettings } from '../types/academy';
import { User } from 'firebase/auth';
import { DriveFileInfo } from '../utils/googleDrive';

interface SettingsModalProps {
  settings: AcademySettings;
  currentPin: string;
  googleUser: User | null;
  googleToken: string | null;
  driveFile: DriveFileInfo | null;
  isSyncing: boolean;
  onSaveSettings: (settings: AcademySettings) => void;
  onUpdatePin: (newPin: string) => void;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onSyncToDrive: () => void;
  onRestoreFromDrive: () => void;
  onExportLocalBackup: () => void;
  onImportLocalBackup: (file: File) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  currentPin,
  googleUser,
  googleToken,
  driveFile,
  isSyncing,
  onSaveSettings,
  onUpdatePin,
  onConnectGoogle,
  onDisconnectGoogle,
  onSyncToDrive,
  onRestoreFromDrive,
  onExportLocalBackup,
  onImportLocalBackup,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'general' | 'pin'>('drive');

  // Form states
  const [academyName, setAcademyName] = useState(settings.academyName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [upiId, setUpiId] = useState(settings.upiId);

  // Preferred Gmail input (can show or prefill)
  const [customGmail, setCustomGmail] = useState(googleUser?.email || 'magicianpradeeprajput@gmail.com');

  // PIN states
  const [pinValue, setPinValue] = useState(currentPin);
  const [pinConfirm, setPinConfirm] = useState(currentPin);
  const [pinError, setPinError] = useState('');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      academyName,
      tagline,
      phone,
      address,
      upiId,
    });
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinValue.length !== 4 || !/^\d{4}$/.test(pinValue)) {
      setPinError('PIN 4-digit numeric hona chahiye');
      return;
    }
    if (pinValue !== pinConfirm) {
      setPinError('Dono PIN match nahi kar rahe hain');
      return;
    }
    setPinError('');
    onUpdatePin(pinValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportLocalBackup(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-amber-950 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Settings & Google Drive Storage</h2>
              <p className="text-xs text-amber-300">
                Data cloud backup, Gmail ID attach & academy settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 transition-colors ${
              activeTab === 'drive'
                ? 'border-amber-500 text-amber-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="h-4 w-4 text-amber-600" />
            <span>Google Drive Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 transition-colors ${
              activeTab === 'general'
                ? 'border-amber-500 text-amber-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <IndianRupee className="h-4 w-4 text-emerald-600" />
            <span>Academy & Fees Details</span>
          </button>
          <button
            onClick={() => setActiveTab('pin')}
            className={`flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 transition-colors ${
              activeTab === 'pin'
                ? 'border-amber-500 text-amber-900 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="h-4 w-4 text-purple-600" />
            <span>PIN Code (1996)</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'drive' && (
            <div className="space-y-4">
              {/* Google Drive Status Banner */}
              <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-xs border border-amber-200">
                      <Cloud className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Google Drive Safe Storage</span>
                        {googleUser && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Connected
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Aapka sara PR ACADEMY data direct aapki Google Drive par safe rahega.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gmail ID Field */}
                <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-2">
                  <label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-amber-600" />
                    <span>Aapki Gmail ID:</span>
                  </label>
                  <input
                    type="email"
                    value={googleUser ? googleUser.email || customGmail : customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    placeholder="e.g. magicianpradeeprajput@gmail.com"
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-800 bg-slate-50 focus:border-amber-500 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Is Gmail ID se Google Drive attach hogi aur data hamesha surakshit rahega.
                  </span>
                </div>

                {/* Google Sign In / Connect Button */}
                {!googleUser ? (
                  <button
                    onClick={onConnectGoogle}
                    type="button"
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-all active:scale-[0.99]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    <span>Google Drive Access Dijiye (Gmail Connect)</span>
                  </button>
                ) : (
                  <div className="space-y-3 pt-1">
                    {/* Active Connection Card */}
                    <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        {googleUser.photoURL ? (
                          <img
                            src={googleUser.photoURL}
                            alt="Google Avatar"
                            className="h-8 w-8 rounded-full border"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                            G
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{googleUser.displayName || 'Google Account'}</div>
                          <div className="text-[11px] text-slate-500">{googleUser.email}</div>
                        </div>
                      </div>

                      <button
                        onClick={onDisconnectGoogle}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Disconnect</span>
                      </button>
                    </div>

                    {/* Drive Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={onSyncToDrive}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 font-bold text-white shadow-sm hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Syncing...' : 'Google Drive Par Save Karein'}</span>
                      </button>

                      <button
                        onClick={onRestoreFromDrive}
                        disabled={isSyncing}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Download className="h-4 w-4 text-amber-400" />
                        <span>Drive Se Data Load Karein</span>
                      </button>
                    </div>

                    {driveFile && (
                      <div className="rounded-xl bg-white p-2.5 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Drive File: <strong>{driveFile.name}</strong></span>
                        <span className="text-slate-400">
                          Last Saved: {new Date(driveFile.modifiedTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Offline File Backup as fallback */}
              <div className="rounded-xl border border-slate-200 p-3.5 space-y-2.5 bg-slate-50/50">
                <span className="font-bold text-slate-800 block">
                  Offline File Backup (Computer/Phone File):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onExportLocalBackup}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Download JSON Backup</span>
                  </button>

                  <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload & Restore File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-3.5">
              <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-200 flex items-center gap-2 text-emerald-900 font-semibold">
                <IndianRupee className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>
                  Indian Rupees (₹) currency symbol active hai. Sabhi payments INR mein record hongi.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Academy Ka Naam
                </label>
                <input
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">UPI ID for Fees</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address / Pata</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-white shadow-md hover:bg-amber-600 transition-all"
                >
                  Academy Details Save Karein
                </button>
              </div>
            </form>
          )}

          {activeTab === 'pin' && (
            <form onSubmit={handleSavePin} className="space-y-4">
              <div className="rounded-xl bg-purple-50 p-3 border border-purple-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-900">
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                  <span>Application Security Access PIN</span>
                </div>
                <p className="text-[11px] text-purple-700">
                  App open karte samay yahi 4-digit code enter karna hoga (Default: 1996).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Naya 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm tracking-widest text-center font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm tracking-widest text-center font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {pinError && (
                <div className="text-rose-600 text-xs font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white shadow-md hover:bg-purple-700 transition-all"
                >
                  Naya PIN Update Karein
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
