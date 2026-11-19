import { ExternalLink, FileText, Film, Headphones, Image as ImageIcon } from 'lucide-react';
import { DiscourseMediaItem } from '../types/dhamma';
import { resolveMediaSource } from '../utils/storageAndExport';
import { ArchivalImage } from './ArchivalImage';

interface DiscourseMediaBlockProps {
  audioReferenceUrl?: string;
  mediaItems?: DiscourseMediaItem[];
  discourseTitle: string;
}

export function DiscourseMediaBlock({
  audioReferenceUrl,
  mediaItems = [],
  discourseTitle,
}: DiscourseMediaBlockProps) {
  const combinedItems: DiscourseMediaItem[] = [
    ...(audioReferenceUrl && audioReferenceUrl.trim()
      ? [
          {
            id: 'primary-audio-ref',
            type: resolveMediaSource(audioReferenceUrl).kind === 'youtube' ||
              resolveMediaSource(audioReferenceUrl).kind === 'video'
              ? ('video' as const)
              : resolveMediaSource(audioReferenceUrl).kind === 'audio'
                ? ('audio' as const)
                : ('document' as const),
            title: `${discourseTitle} — Recorded Talk / Primary Media`,
            url: audioReferenceUrl.trim(),
          },
        ]
      : []),
    ...mediaItems.filter((m) => m.url.trim().length > 0),
  ];

  if (combinedItems.length === 0) return null;

  return (
    <section
      aria-label="Discourse media and recordings"
      className="space-y-5 p-5 sm:p-6 border border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/55 dark:bg-[#1E1A16]"
    >
      <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-[#E5DFD3] dark:border-[#342E28]">
        <h2 className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
          Recordings &amp; Attached Media
        </h2>
        <span className="font-mono-code text-[11px] text-[#78716C] dark:text-[#A8A29E] tabular-nums">
          {combinedItems.length} {combinedItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-6">
        {combinedItems.map((item) => {
          const resolved = resolveMediaSource(item.url, item.type);

          if (resolved.kind === 'youtube' && resolved.embedSrc) {
            return (
              <div key={item.id} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1917] dark:text-[#F5F5F4]">
                    <Film className="h-4 w-4 text-[#9A3412] dark:text-[#FDBA74]" aria-hidden="true" />
                    <span>{item.title}</span>
                  </p>
                  <a
                    href={resolved.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#9A3412] dark:text-[#FDBA74] hover:underline shrink-0"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
                <div className="aspect-video w-full border border-[#D6CEBE] dark:border-[#342E28] bg-[#1C1917]">
                  <iframe
                    src={resolved.embedSrc}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="w-full h-full border-0"
                  />
                </div>
                {item.caption && (
                  <p className="text-xs font-serif italic text-[#57534E] dark:text-[#A8A29E]">
                    {item.caption}
                  </p>
                )}
              </div>
            );
          }

          if (resolved.kind === 'audio') {
            return (
              <div
                key={item.id}
                className="p-4 border border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#181512] space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1917] dark:text-[#F5F5F4]">
                    <Headphones
                      className="h-4 w-4 text-[#9A3412] dark:text-[#FDBA74]"
                      aria-hidden="true"
                    />
                    <span>{item.title}</span>
                  </p>
                  <a
                    href={resolved.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#57534E] dark:text-[#A8A29E] hover:text-[#9A3412] shrink-0"
                  >
                    <span>Open Audio</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
                <audio controls preload="metadata" src={resolved.src} className="w-full">
                  Your browser does not support embedded audio playback.
                </audio>
                {item.caption && (
                  <p className="text-xs font-serif italic text-[#57534E] dark:text-[#A8A29E]">
                    {item.caption}
                  </p>
                )}
              </div>
            );
          }

          if (resolved.kind === 'video') {
            return (
              <div key={item.id} className="space-y-2.5">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1917] dark:text-[#F5F5F4]">
                  <Film className="h-4 w-4 text-[#9A3412] dark:text-[#FDBA74]" aria-hidden="true" />
                  <span>{item.title}</span>
                </p>
                <video
                  controls
                  preload="metadata"
                  src={resolved.src}
                  className="w-full max-h-[420px] border border-[#D6CEBE] dark:border-[#342E28] bg-[#1C1917]"
                >
                  Your browser does not support embedded video playback.
                </video>
                {item.caption && (
                  <p className="text-xs font-serif italic text-[#57534E] dark:text-[#A8A29E]">
                    {item.caption}
                  </p>
                )}
              </div>
            );
          }

          if (resolved.kind === 'image') {
            return (
              <div key={item.id} className="space-y-2">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{item.title}</span>
                </p>
                <ArchivalImage
                  src={resolved.src}
                  alt={item.title}
                  caption={item.caption}
                  aspectClassName="aspect-[16/10]"
                />
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="p-4 border border-[#E5DFD3] dark:border-[#342E28] bg-[#FBF9F5] dark:bg-[#181512] flex flex-wrap items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-[#1C1917] dark:text-[#F5F5F4]">
                  <FileText
                    className="h-4 w-4 text-[#9A3412] dark:text-[#FDBA74] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.title}</span>
                </p>
                {item.caption && (
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">{item.caption}</p>
                )}
              </div>
              <a
                href={resolved.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 text-xs font-medium border border-[#1C1917] dark:border-[#E7E5E4] text-[#1C1917] dark:text-[#F5F5F4] hover:bg-[#1C1917] hover:text-[#FBF9F5] dark:hover:bg-[#F5F5F4] dark:hover:text-[#1C1917] transition-colors shrink-0"
              >
                <span>Open Resource</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
