import { ExternalLink, FileText, Film, Headphones, Image as ImageIcon } from 'lucide-react';
import { resolveMediaSource } from '../plugins/mediaResolver';
import { THEME_CLASSES } from '../theme/uiClasses';
import { DiscourseMediaItem } from '../types/dhamma';
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
            type:
              resolveMediaSource(audioReferenceUrl).kind === 'youtube' ||
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
      className={`space-y-5 p-5 sm:p-6 ${THEME_CLASSES.card}`}
    >
      <div className={`flex items-baseline justify-between gap-4 pb-3 border-b ${THEME_CLASSES.borderHairline}`}>
        <h2 className={`text-xs tracking-widest uppercase ${THEME_CLASSES.inkSubtle}`}>
          Recordings &amp; Attached Media
        </h2>
        <span className={`font-mono-code text-[11px] ${THEME_CLASSES.inkSubtle} tabular-nums`}>
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
                  <p className={`inline-flex items-center gap-2 text-sm font-medium ${THEME_CLASSES.inkPrimary}`}>
                    <Film className={`h-4 w-4 ${THEME_CLASSES.accentInk}`} aria-hidden="true" />
                    <span>{item.title}</span>
                  </p>
                  <a
                    href={resolved.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs ${THEME_CLASSES.accentInk} hover:underline shrink-0`}
                  >
                    <span>YouTube</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
                <div className={`aspect-video w-full border ${THEME_CLASSES.borderStrong} bg-[#1C1917]`}>
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
                  <p className={`text-xs font-serif italic ${THEME_CLASSES.inkMuted}`}>
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
                className={`p-4 border ${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)] space-y-2.5`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={`inline-flex items-center gap-2 text-sm font-medium ${THEME_CLASSES.inkPrimary}`}>
                    <Headphones className={`h-4 w-4 ${THEME_CLASSES.accentInk}`} aria-hidden="true" />
                    <span>{item.title}</span>
                  </p>
                  <a
                    href={resolved.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs ${THEME_CLASSES.inkMuted} hover:text-[var(--accent-ink)] shrink-0`}
                  >
                    <span>Open Audio</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
                <audio controls preload="metadata" src={resolved.src} className="w-full">
                  Your browser does not support embedded audio playback.
                </audio>
                {item.caption && (
                  <p className={`text-xs font-serif italic ${THEME_CLASSES.inkMuted}`}>
                    {item.caption}
                  </p>
                )}
              </div>
            );
          }

          if (resolved.kind === 'video') {
            return (
              <div key={item.id} className="space-y-2.5">
                <p className={`inline-flex items-center gap-2 text-sm font-medium ${THEME_CLASSES.inkPrimary}`}>
                  <Film className={`h-4 w-4 ${THEME_CLASSES.accentInk}`} aria-hidden="true" />
                  <span>{item.title}</span>
                </p>
                <video
                  controls
                  preload="metadata"
                  src={resolved.src}
                  className={`w-full max-h-[420px] border ${THEME_CLASSES.borderStrong} bg-[#1C1917]`}
                >
                  Your browser does not support embedded video playback.
                </video>
                {item.caption && (
                  <p className={`text-xs font-serif italic ${THEME_CLASSES.inkMuted}`}>
                    {item.caption}
                  </p>
                )}
              </div>
            );
          }

          if (resolved.kind === 'image') {
            return (
              <div key={item.id} className="space-y-2">
                <p className={`inline-flex items-center gap-2 text-xs uppercase tracking-wider ${THEME_CLASSES.inkSubtle}`}>
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
              className={`p-4 border ${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)] flex flex-wrap items-center justify-between gap-3`}
            >
              <div className="space-y-1 min-w-0">
                <p className={`inline-flex items-center gap-2 text-sm font-medium ${THEME_CLASSES.inkPrimary}`}>
                  <FileText className={`h-4 w-4 ${THEME_CLASSES.accentInk} shrink-0`} aria-hidden="true" />
                  <span className="truncate">{item.title}</span>
                </p>
                {item.caption && (
                  <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>{item.caption}</p>
                )}
              </div>
              <a
                href={resolved.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 text-xs font-medium border border-[var(--ink-primary)] text-[var(--ink-primary)] hover:bg-[var(--ink-primary)] hover:text-[var(--surface-canvas)] transition-colors shrink-0"
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
