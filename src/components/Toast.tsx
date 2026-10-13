import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl border backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-slate-900/95 text-white border-emerald-500/40'
            : toast.type === 'error'
            ? 'bg-rose-900/95 text-white border-rose-500/40'
            : 'bg-slate-900/95 text-white border-amber-500/40'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
        {toast.type === 'info' && <Info className="h-5 w-5 text-amber-400" />}

        <span className="text-xs font-semibold">{toast.message}</span>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
