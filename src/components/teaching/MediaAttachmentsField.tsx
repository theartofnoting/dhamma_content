import { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { THEME_CLASSES } from '../../theme/uiClasses';
import { readFileAsDataUrl } from '../../tools/fileTools';
import { DiscourseMediaItem, DiscourseMediaType } from '../../types/dhamma';
import { DiscourseMediaBlock } from '../DiscourseMediaBlock';

interface MediaAttachmentsFieldProps {
  discourseTitle: string;
  audioReferenceUrl: string;
  onAudioReferenceUrlChange: (url: string) => void;
  mediaItems: DiscourseMediaItem[];
  onMediaItemsChange: (items: DiscourseMediaItem[]) => void;
  onUploadNotice: (notice: string | null) => void;
  onError: (err: string | null) => void;
}

export function MediaAttachmentsField({
  discourseTitle,
  audioReferenceUrl,
  onAudioReferenceUrlChange,
  mediaItems,
  onMediaItemsChange,
  onUploadNotice,
  onError,
}: MediaAttachmentsFieldProps) {
  const [newMediaType, setNewMediaType] = useState<DiscourseMediaType>('audio');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onResult: (payload: { dataUrl: string; fileName: string; mimeType: string }) => void,
    noticeBuilder: (fileName: string) => string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const payload = await readFileAsDataUrl(file, SITE_CONFIG.maxUploadBytes);
      onResult(payload);
      onError(null);
      onUploadNotice(noticeBuilder(file.name));
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to attach file.');
    }
  };

  const handleAddMediaItem = () => {
    const cleanUrl = newMediaUrl.trim();
    if (!cleanUrl) return;
    onMediaItemsChange([
      ...mediaItems,
      {
        id: `media-${Date.now()}`,
        type: newMediaType,
        title: newMediaTitle.trim() || `${newMediaType.toUpperCase()} Attachment`,
        url: cleanUrl,
        caption: newMediaCaption.trim() || undefined,
      },
    ]);
    setNewMediaTitle('');
    setNewMediaUrl('');
    setNewMediaCaption('');
  };

  const showMediaPreview = Boolean(audioReferenceUrl.trim() || mediaItems.length > 0);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className={THEME_CLASSES.label}>
          Primary Audio / Video Talk (YouTube, MP3/MP4 URL, or Upload)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={audioReferenceUrl}
            onChange={(e) => onAudioReferenceUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or upload audio/video"
            className={`flex-1 ${THEME_CLASSES.inputMono}`}
          />
          <label className={THEME_CLASSES.btnOutline}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload</span>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(e) =>
                handleFileUpload(
                  e,
                  ({ dataUrl }) => onAudioReferenceUrlChange(dataUrl),
                  (name) => `Attached talk media "${name}". Publish to save it to the archive.`,
                )
              }
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className={`p-4 ${THEME_CLASSES.card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={THEME_CLASSES.label}>Additional Media Attachments ({mediaItems.length})</p>
          <label className={THEME_CLASSES.btnOutline}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload File</span>
            <input
              type="file"
              accept="image/*,audio/*,video/*,.pdf"
              onChange={(e) =>
                handleFileUpload(
                  e,
                  ({ dataUrl, fileName, mimeType }) => {
                    const inferredType: DiscourseMediaType = mimeType.startsWith('audio/')
                      ? 'audio'
                      : mimeType.startsWith('video/')
                        ? 'video'
                        : mimeType.startsWith('image/')
                          ? 'image'
                          : 'document';
                    onMediaItemsChange([
                      ...mediaItems,
                      {
                        id: `media-${Date.now()}`,
                        type: inferredType,
                        title: fileName.replace(/\.[^.]+$/, ''),
                        url: dataUrl,
                      },
                    ]);
                  },
                  (name) => `Attached "${name}" to this discourse.`,
                )
              }
              className="sr-only"
            />
          </label>
        </div>

        {mediaItems.length > 0 && (
          <div
            className={`${THEME_CLASSES.divideHairline} border-t border-b ${THEME_CLASSES.borderHairline}`}
          >
            {mediaItems.map((item) => (
              <div key={item.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className={`font-medium ${THEME_CLASSES.inkPrimary} truncate`}>
                    <span className={`font-mono-code uppercase text-[10px] ${THEME_CLASSES.accentInk} mr-2`}>
                      [{item.type}]
                    </span>
                    {item.title}
                  </p>
                  <p className={`font-mono-code text-[11px] ${THEME_CLASSES.inkSubtle} truncate`}>
                    {item.url.startsWith('data:') ? 'Uploaded file ready to publish' : item.url}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onMediaItemsChange(mediaItems.filter((m) => m.id !== item.id))}
                  aria-label={`Remove ${item.title}`}
                  className={`p-1.5 ${THEME_CLASSES.dangerInk} hover:opacity-80 cursor-pointer shrink-0`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
          <div className="sm:col-span-3 space-y-1">
            <label className={`block text-[11px] ${THEME_CLASSES.inkMuted}`}>Type</label>
            <select
              value={newMediaType}
              onChange={(e) => setNewMediaType(e.target.value as DiscourseMediaType)}
              className={`w-full min-h-[38px] px-2.5 text-xs bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong}`}
            >
              <option value="audio">Audio (MP3/M4A)</option>
              <option value="video">Video / YouTube</option>
              <option value="image">Image / Diagram</option>
              <option value="document">PDF / Handout</option>
            </select>
          </div>
          <div className="sm:col-span-4 space-y-1">
            <label className={`block text-[11px] ${THEME_CLASSES.inkMuted}`}>Label</label>
            <input
              type="text"
              value={newMediaTitle}
              onChange={(e) => setNewMediaTitle(e.target.value)}
              placeholder="e.g., Part 1 Audio Recording"
              className={`w-full min-h-[38px] px-2.5 text-xs bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong}`}
            />
          </div>
          <div className="sm:col-span-5 space-y-1">
            <label className={`block text-[11px] ${THEME_CLASSES.inkMuted}`}>Media URL</label>
            <input
              type="text"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full min-h-[38px] px-2.5 font-mono-code text-xs bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong}`}
            />
          </div>
          <div className="sm:col-span-9 space-y-1">
            <input
              type="text"
              value={newMediaCaption}
              onChange={(e) => setNewMediaCaption(e.target.value)}
              placeholder="Optional caption or duration note..."
              className={`w-full min-h-[36px] px-2.5 text-xs bg-[var(--surface-canvas)] ${THEME_CLASSES.inkPrimary} border ${THEME_CLASSES.borderStrong}`}
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={handleAddMediaItem}
              className={`w-full inline-flex items-center justify-center gap-1 min-h-[36px] px-3 text-xs font-medium border border-[var(--ink-primary)] ${THEME_CLASSES.inkPrimary} hover:bg-[var(--ink-primary)] hover:text-[var(--surface-canvas)] cursor-pointer`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Media</span>
            </button>
          </div>
        </div>
      </div>

      {showMediaPreview && (
        <DiscourseMediaBlock
          audioReferenceUrl={audioReferenceUrl}
          mediaItems={mediaItems}
          discourseTitle={discourseTitle || 'Discourse Preview'}
        />
      )}
    </div>
  );
}
