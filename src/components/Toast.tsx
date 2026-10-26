'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastNotification } from '@/types/converter';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        const bg = isError
          ? 'bg-rose-500/90 text-white border-rose-400/30'
          : isSuccess
          ? 'bg-emerald-600/90 text-white border-emerald-400/30'
          : 'bg-slate-900/90 text-slate-100 border-slate-700/80';

        const Icon = isError ? AlertCircle : isSuccess ? CheckCircle2 : Info;

        return (
          <div
            key={toast.id}
            className={`${bg} pointer-events-auto px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-medium flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 transition-all`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
