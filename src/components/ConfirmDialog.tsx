import { useState, ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  icon?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colorMap = {
    danger:  { ring: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { ring: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', btn: 'bg-amber-600 hover:bg-amber-700' },
    default: { ring: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  }[variant];

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-[300px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${colorMap.ring}`}>
            {icon ?? <AlertTriangle className="w-6 h-6" />}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base leading-tight">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-2 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] ${colorMap.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
