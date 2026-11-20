import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { resolveAssetUrl } from '../plugins/mediaResolver';
import { THEME_CLASSES } from '../theme/uiClasses';

interface ArchivalImageProps {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectClassName?: string;
}

export function ArchivalImage({
  src,
  alt,
  caption,
  className = '',
  aspectClassName = 'aspect-[4/3]',
}: ArchivalImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = src ? resolveAssetUrl(src) : undefined;

  useEffect(() => {
    setHasError(false);
  }, [resolvedSrc]);

  return (
    <figure className={`flex flex-col ${className}`}>
      <div
        className={`relative overflow-hidden bg-[var(--surface-elevated)] border ${THEME_CLASSES.borderHairline} ${aspectClassName}`}
      >
        {resolvedSrc && !hasError ? (
          <img
            src={resolvedSrc}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-gradient-to-br from-[var(--surface-muted)] to-[var(--surface-elevated)]">
            <BookOpen className={`h-7 w-7 ${THEME_CLASSES.accentInk}`} aria-hidden="true" />
            <p className={`font-display text-lg font-medium ${THEME_CLASSES.inkBody} max-w-xs text-balance`}>
              {alt}
            </p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className={`mt-2.5 text-xs font-serif italic ${THEME_CLASSES.inkMuted} leading-relaxed`}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
