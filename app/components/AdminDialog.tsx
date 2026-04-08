'use client';

import { useEffect, type ReactNode } from 'react';

export type AdminDialogVariant = 'primary' | 'danger';

export interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void | Promise<void>;
  primaryVariant?: AdminDialogVariant;
  secondaryLabel?: string;
  isBusy?: boolean;
  primaryDisabled?: boolean;
}

export default function AdminDialog({
  open,
  onClose,
  title,
  description,
  children,
  primaryLabel,
  onPrimary,
  primaryVariant = 'primary',
  secondaryLabel = 'Cancel',
  isBusy = false,
  primaryDisabled = false,
}: AdminDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, isBusy]);

  if (!open) return null;

  const primaryClasses =
    primaryVariant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        disabled={isBusy}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity disabled:pointer-events-none"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5"
      >
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 px-6 py-4">
          <h2 id="admin-dialog-title" className="text-lg font-semibold tracking-tight text-white">
            {title}
          </h2>
        </div>
        <div className="px-6 py-5 text-sm text-slate-700 space-y-4">
          {description && <div className="leading-relaxed">{description}</div>}
          {children}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/90 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            onClick={() => void onPrimary()}
            disabled={isBusy || primaryDisabled}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${primaryClasses}`}
          >
            {isBusy ? 'Please wait…' : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
