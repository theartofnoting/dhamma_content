import { Trash2 } from 'lucide-react';
import { THEME_CLASSES } from '../uiClasses';

interface ConfirmDeleteActionProps {
  isConfirming: boolean;
  onRequestConfirm: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  ariaLabel?: string;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'inline' | 'icon' | 'button';
}

export function ConfirmDeleteAction({
  isConfirming,
  onRequestConfirm,
  onConfirm,
  onCancel,
  ariaLabel = 'Delete item',
  label = 'Delete',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'inline',
}: ConfirmDeleteActionProps) {
  if (isConfirming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-[34px] px-2.5 bg-[var(--accent-primary)] text-[var(--accent-contrast)] font-medium cursor-pointer whitespace-nowrap"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`min-h-[34px] px-2 ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
        >
          {cancelLabel}
        </button>
      </span>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onRequestConfirm}
        aria-label={ariaLabel}
        className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center ${THEME_CLASSES.inkMuted} hover:text-[var(--status-danger)] cursor-pointer`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={onRequestConfirm}
        aria-label={ariaLabel}
        className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkMuted} hover:border-[var(--accent-ink)] hover:text-[var(--status-danger)] cursor-pointer whitespace-nowrap shrink-0`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onRequestConfirm}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 ${THEME_CLASSES.inkMuted} hover:text-[var(--status-danger)] cursor-pointer`}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
