import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  confirmButtonText = 'Haan, Delete Karein',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {itemName && (
            <div className="mt-1 font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg text-xs border border-rose-200/60 inline-block">
              {itemName}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition-all"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
