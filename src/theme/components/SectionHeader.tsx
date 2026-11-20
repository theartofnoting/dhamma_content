import { ReactNode } from 'react';
import { THEME_CLASSES } from '../uiClasses';

interface SectionHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  bottomPaddingClassName?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  actions,
  bottomPaddingClassName = 'pb-8',
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${bottomPaddingClassName} border-b ${THEME_CLASSES.borderHairline}`}
    >
      <div className="space-y-2 max-w-2xl">
        <p className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>{kicker}</p>
        <h2
          className={`font-display text-3xl sm:text-4xl font-semibold ${THEME_CLASSES.inkPrimary} text-balance`}
        >
          {title}
        </h2>
        {description && (
          <p className={`text-sm sm:text-base leading-relaxed ${THEME_CLASSES.inkMuted}`}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
