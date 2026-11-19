import { useState } from 'react';
import { BookOpen } from 'lucide-react';

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

  return (
    <figure className={`flex flex-col ${className}`}>
      <div
        className={`relative overflow-hidden bg-[#EFEAE0] dark:bg-[#231F1B] border border-[#E5DFD3] dark:border-[#342E28] ${aspectClassName}`}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center bg-gradient-to-br from-[#F4EFE6] via-[#EFEAE0] to-[#E6DFD1] dark:from-[#25211D] dark:to-[#1B1815]">
            <BookOpen className="h-7 w-7 text-[#9A3412]/70 dark:text-[#D97757]" aria-hidden="true" />
            <p className="font-display text-lg font-medium text-[#292524] dark:text-[#E7E5E4] max-w-xs text-balance">
              {alt}
            </p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-xs font-serif italic text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
