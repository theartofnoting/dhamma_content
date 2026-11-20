export const THEME_CLASSES = {
  // Surfaces
  canvas: 'bg-[var(--surface-canvas)] text-[var(--ink-primary)]',
  band: 'border-t border-[var(--border-hairline)] bg-[var(--surface-band)]',
  sectionContainer: 'mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-16',
  card: 'border border-[var(--border-hairline)] bg-[var(--surface-band)]',
  cardElevated: 'border border-[var(--border-strong)] bg-[var(--surface-canvas)]',

  // Typography
  inkPrimary: 'text-[var(--ink-primary)]',
  inkBody: 'text-[var(--ink-body)]',
  inkSecondary: 'text-[var(--ink-secondary)]',
  inkMuted: 'text-[var(--ink-muted)]',
  inkSubtle: 'text-[var(--ink-subtle)]',
  accentInk: 'text-[var(--accent-ink)]',
  successInk: 'text-[var(--status-success)]',
  dangerInk: 'text-[var(--status-danger)]',

  // Borders
  borderHairline: 'border-[var(--border-hairline)]',
  borderStrong: 'border-[var(--border-strong)]',
  divideHairline: 'divide-y divide-[var(--border-hairline)]',

  // Inputs & Labels
  label: 'block text-xs font-medium text-[var(--ink-secondary)]',
  input:
    'w-full min-h-[42px] px-3 py-2 text-sm bg-[var(--surface-input)] text-[var(--ink-primary)] border border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-ink)]',
  inputMono:
    'w-full min-h-[42px] px-3 py-2 font-mono-code text-xs bg-[var(--surface-input)] text-[var(--ink-primary)] border border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-ink)]',
  inputCompact:
    'w-full min-h-[40px] px-3 py-2 text-sm bg-[var(--surface-input)] text-[var(--ink-primary)] border border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-ink)]',
  textarea:
    'w-full px-3 py-2 text-sm leading-relaxed bg-[var(--surface-input)] text-[var(--ink-primary)] border border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-ink)]',

  // Buttons
  btnPrimary:
    'inline-flex items-center justify-center gap-2 min-h-[42px] px-4 py-2 text-xs font-medium bg-[var(--ink-primary)] text-[var(--surface-canvas)] hover:bg-[var(--accent-primary)] hover:text-[var(--accent-contrast)] transition-colors whitespace-nowrap shrink-0 cursor-pointer',
  btnAccent:
    'inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2 text-xs font-medium bg-[var(--accent-primary)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50',
  btnOutline:
    'inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 text-xs font-medium border border-[var(--border-strong)] text-[var(--ink-primary)] hover:border-[var(--accent-ink)] transition-colors whitespace-nowrap shrink-0 cursor-pointer',
  btnSecondary:
    'inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 py-2 text-xs font-medium border border-[var(--border-strong)] text-[var(--ink-secondary)] hover:border-[var(--ink-primary)] cursor-pointer whitespace-nowrap shrink-0',

  // Alerts
  alertError:
    'p-3 border border-[var(--status-danger)]/50 bg-[var(--accent-primary)]/5 text-xs text-[var(--status-danger)]',
  alertInfo:
    'p-3 border border-[var(--border-strong)] bg-[var(--surface-input)] text-xs text-[var(--ink-secondary)]',
} as const;
