import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { THEME_CLASSES } from '../uiClasses';

interface EditorModalProps {
  isOpen: boolean;
  headingId: string;
  kicker: string;
  title: string;
  maxWidthClassName?: string;
  error?: string | null;
  onClose: () => void;
  children: ReactNode;
}

export function EditorModal({
  isOpen,
  headingId,
  kicker,
  title,
  maxWidthClassName = 'max-w-2xl',
  error,
  onClose,
  children,
}: EditorModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
    >
      <div
        className={`relative w-full ${maxWidthClassName} max-h-[92vh] overflow-y-auto bg-[var(--surface-canvas)] border border-[var(--border-strong)] p-6 sm:p-8 shadow-xl`}
      >
        <div className={`flex items-start justify-between gap-4 pb-4 border-b ${THEME_CLASSES.borderHairline}`}>
          <div className="space-y-1">
            <p className={`font-mono-code text-xs ${THEME_CLASSES.accentInk}`}>{kicker}</p>
            <h3
              id={headingId}
              className={`font-display text-2xl sm:text-3xl font-semibold ${THEME_CLASSES.inkPrimary}`}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="pt-5 space-y-4">
          {error && (
            <div role="alert" className={THEME_CLASSES.alertError}>
              {error}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
