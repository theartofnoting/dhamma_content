import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { GITHUB_CONFIG, SITE_CONFIG, TAXONOMY } from '../config/siteConfig';
import { EditorModal } from '../theme/components/EditorModal';
import { THEME_CLASSES } from '../theme/uiClasses';
import { readFileAsDataUrl } from '../tools/fileTools';
import { calculateEstimatedReadingMinutes } from '../tools/readingTime';
import { slugifySegment } from '../tools/slugify';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  DiscourseMediaItem,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';
import { MediaAttachmentsField } from './teaching/MediaAttachmentsField';

interface StoreTeachingModalProps {
  isOpen: boolean;
  editingDiscourse?: DhammaDiscourse | null;
  presetSayadawId?: string;
  sayadaws: SayadawProfile[];
  existingCount: number;
  onClose: () => void;
  onSave: (discourse: DhammaDiscourse, isEdit: boolean, newSayadaw?: SayadawProfile) => void;
}

export function StoreTeachingModal({
  isOpen,
  editingDiscourse,
  presetSayadawId,
  sayadaws,
  existingCount,
  onClose,
  onSave,
}: StoreTeachingModalProps) {
  const [title, setTitle] = useState('');
  const [vietnameseTitle, setVietnameseTitle] = useState('');
  const [paliSubtitle, setPaliSubtitle] = useState('');
  const [sayadawId, setSayadawId] = useState(sayadaws[0]?.id || '__new__');
  const [newSayadawName, setNewSayadawName] = useState('');
  const [newSayadawHonorific, setNewSayadawHonorific] = useState('Sayadaw');
  const [newSayadawMonastery, setNewSayadawMonastery] = useState('');
  const [collection, setCollection] = useState<TraditionCollection>(TAXONOMY.collections[1]);
  const [language, setLanguage] = useState<DiscourseLanguage>(TAXONOMY.languages[0]);
  const [sourceFormat, setSourceFormat] = useState<'md' | 'rst'>('md');
  const [dateRecorded, setDateRecorded] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [summary, setSummary] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [paliExcerpt, setPaliExcerpt] = useState('');
  const [paliTranslation, setPaliTranslation] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [audioReferenceUrl, setAudioReferenceUrl] = useState('');
  const [mediaItems, setMediaItems] = useState<DiscourseMediaItem[]>([]);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingDiscourse) {
      setTitle(editingDiscourse.title);
      setVietnameseTitle(editingDiscourse.vietnameseTitle || '');
      setPaliSubtitle(editingDiscourse.paliSubtitle || '');
      setSayadawId(editingDiscourse.sayadawId);
      setNewSayadawName('');
      setCollection(editingDiscourse.collection);
      setLanguage(editingDiscourse.language);
      setSourceFormat(editingDiscourse.sourceFormat === 'rst' ? 'rst' : 'md');
      setDateRecorded(editingDiscourse.dateRecorded);
      setSourceText(editingDiscourse.sourceText);
      setSummary(editingDiscourse.summary);
      setPullQuote(editingDiscourse.pullQuote);
      setPaliExcerpt(editingDiscourse.sections[0]?.paliExcerpt || '');
      setPaliTranslation(editingDiscourse.sections[0]?.paliTranslation || '');
      setBodyText(
        editingDiscourse.sections
          .map((s) =>
            s.heading && s.heading !== editingDiscourse.title
              ? `## ${s.heading}\n\n${s.paragraphs.join('\n\n')}`
              : s.paragraphs.join('\n\n'),
          )
          .join('\n\n'),
      );
      setCoverImage(editingDiscourse.coverImage || '');
      setAudioReferenceUrl(editingDiscourse.audioReferenceUrl || '');
      setMediaItems(editingDiscourse.mediaItems || []);
    } else {
      setTitle('');
      setVietnameseTitle('');
      setPaliSubtitle('');
      setSayadawId(presetSayadawId || sayadaws[0]?.id || '__new__');
      setNewSayadawName('');
      setNewSayadawHonorific('Sayadaw');
      setNewSayadawMonastery('');
      setCollection(TAXONOMY.collections[1]);
      setLanguage(TAXONOMY.languages[0]);
      setSourceFormat('md');
      setDateRecorded(new Date().toISOString().slice(0, 10));
      setSourceText('');
      setSummary('');
      setPullQuote('');
      setPaliExcerpt('');
      setPaliTranslation('');
      setBodyText('');
      setCoverImage('');
      setAudioReferenceUrl('');
      setMediaItems([]);
    }
    setUploadNotice(null);
    setFormError(null);
  }, [isOpen, editingDiscourse, presetSayadawId, sayadaws]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const payload = await readFileAsDataUrl(file, SITE_CONFIG.maxUploadBytes);
      setCoverImage(payload.dataUrl);
      setFormError(null);
      setUploadNotice(`Attached cover image "${file.name}". Publish to commit to GitHub.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to upload cover image.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bodyText.trim()) {
      setFormError('Title and Discourse Text are required.');
      return;
    }

    let resolvedSayadawId = sayadawId;
    let resolvedSayadawName = sayadaws.find((s) => s.id === sayadawId)?.name || 'Group Sayadaw';
    let resolvedSayadawSlug =
      sayadaws.find((s) => s.id === sayadawId)?.slug || slugifySegment(sayadawId);
    let createdSayadaw: SayadawProfile | undefined;

    if (sayadawId === '__new__') {
      if (!newSayadawName.trim()) {
        setFormError('Please enter the new Sayadaw name.');
        return;
      }
      resolvedSayadawSlug = slugifySegment(newSayadawName.trim());
      resolvedSayadawId = resolvedSayadawSlug;
      resolvedSayadawName = newSayadawName.trim();
      createdSayadaw = {
        id: resolvedSayadawId,
        slug: resolvedSayadawSlug,
        name: resolvedSayadawName,
        honorificTitle: newSayadawHonorific.trim() || 'Sayadaw',
        monastery: newSayadawMonastery.trim() || 'Vipassana Bhavana Archive',
        location: '',
        lineage: collection,
        years: '',
        biography: `Discourses and study records by ${resolvedSayadawName}.`,
        primaryTexts: sourceText.trim() ? [sourceText.trim()] : [],
      };
    }

    const rawBlocks = bodyText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const sections: DhammaDiscourse['sections'] = [];
    let currentHeading = title.trim();
    let currentParagraphs: string[] = [];

    for (const block of rawBlocks) {
      if (block.startsWith('## ')) {
        if (currentParagraphs.length > 0) {
          sections.push({
            heading: currentHeading,
            paragraphs: currentParagraphs,
          });
          currentParagraphs = [];
        }
        currentHeading = block.replace(/^##\s+/, '').trim();
      } else {
        currentParagraphs.push(block);
      }
    }
    if (currentParagraphs.length > 0) {
      sections.push({
        heading: currentHeading,
        paragraphs: currentParagraphs,
      });
    }

    if (sections.length > 0 && paliExcerpt.trim()) {
      sections[0].paliExcerpt = paliExcerpt.trim();
      if (paliTranslation.trim()) {
        sections[0].paliTranslation = paliTranslation.trim();
      }
    }

    const discourseSlug = editingDiscourse?.slug || slugifySegment(title.trim());
    const collectionSlug = slugifySegment(collection);
    const prefix = TAXONOMY.collectionPrefixes[collection];
    const accessionCode =
      editingDiscourse?.accessionCode || `${prefix}-${String(existingCount + 1).padStart(3, '0')}`;

    const draft: DhammaDiscourse = {
      id: editingDiscourse?.id || `${resolvedSayadawSlug}-${discourseSlug}`,
      accessionCode,
      slug: discourseSlug,
      collectionSlug,
      sourceFormat,
      title: title.trim(),
      vietnameseTitle: vietnameseTitle.trim() || undefined,
      paliSubtitle: paliSubtitle.trim() || undefined,
      sayadawId: resolvedSayadawId,
      sayadawName: resolvedSayadawName,
      collection,
      language,
      dateRecorded: dateRecorded.trim() || 'Archive Entry',
      readingMinutes: 5,
      sourceText: sourceText.trim() || 'Group Dhamma Recording',
      summary: summary.trim() || rawBlocks[0]?.slice(0, 220) || title.trim(),
      sections,
      pullQuote:
        pullQuote.trim() ||
        rawBlocks[0]?.slice(0, 160) ||
        'Contemplate arising and passing away with steady awareness.',
      marginNotes: editingDiscourse?.marginNotes || [],
      footnotes: editingDiscourse?.footnotes || [],
      coverImage: coverImage.trim() || undefined,
      coverCaption: editingDiscourse?.coverCaption,
      audioReferenceUrl: audioReferenceUrl.trim() || undefined,
      mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      repoPath:
        editingDiscourse?.repoPath ||
        `${GITHUB_CONFIG.articlesRoot}/${collectionSlug}/${resolvedSayadawSlug}/${discourseSlug}.${sourceFormat}`,
      isUserCreated: true,
    };

    draft.readingMinutes = calculateEstimatedReadingMinutes(draft);
    onSave(draft, Boolean(editingDiscourse), createdSayadaw);
  };

  return (
    <EditorModal
      isOpen={isOpen}
      headingId="store-teaching-heading"
      kicker={editingDiscourse ? 'Edit Repository Entry' : 'Publish to Archive'}
      title={editingDiscourse ? 'Edit Sayadaw Discourse' : 'Store a Sayadaw Teaching'}
      maxWidthClassName="max-w-3xl"
      error={formError}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {uploadNotice && <div className={THEME_CLASSES.alertInfo}>{uploadNotice}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Discourse Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Contemplation of Impermanence"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Vietnamese Title (Optional)</label>
            <input
              type="text"
              value={vietnameseTitle}
              onChange={(e) => setVietnameseTitle(e.target.value)}
              placeholder="vd: Quán Niệm Vô Thường"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Pāli Subtitle (Optional)</label>
            <input
              type="text"
              value={paliSubtitle}
              onChange={(e) => setPaliSubtitle(e.target.value)}
              placeholder="e.g., Aniccānupassanā"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Sayadaw *</label>
            <select
              value={sayadawId}
              onChange={(e) => setSayadawId(e.target.value)}
              className={THEME_CLASSES.input}
            >
              {sayadaws.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.vietnameseName ? `${s.name} (${s.vietnameseName})` : s.name}
                </option>
              ))}
              <option value="__new__">+ Add a new Sayadaw...</option>
            </select>
          </div>
        </div>

        {sayadawId === '__new__' && (
          <div className={`p-4 ${THEME_CLASSES.card} grid grid-cols-1 sm:grid-cols-3 gap-3`}>
            <div className="space-y-1">
              <label className={THEME_CLASSES.label}>New Sayadaw Name *</label>
              <input
                type="text"
                value={newSayadawName}
                onChange={(e) => setNewSayadawName(e.target.value)}
                placeholder="Ven. Sayadaw ..."
                className={THEME_CLASSES.inputCompact}
              />
            </div>
            <div className="space-y-1">
              <label className={THEME_CLASSES.label}>Honorific</label>
              <input
                type="text"
                value={newSayadawHonorific}
                onChange={(e) => setNewSayadawHonorific(e.target.value)}
                className={THEME_CLASSES.inputCompact}
              />
            </div>
            <div className="space-y-1">
              <label className={THEME_CLASSES.label}>Monastery</label>
              <input
                type="text"
                value={newSayadawMonastery}
                onChange={(e) => setNewSayadawMonastery(e.target.value)}
                className={THEME_CLASSES.inputCompact}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Collection</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value as TraditionCollection)}
              className={THEME_CLASSES.input}
            >
              {TAXONOMY.collections.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as DiscourseLanguage)}
              className={THEME_CLASSES.input}
            >
              {TAXONOMY.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>File Format</label>
            <select
              value={sourceFormat}
              onChange={(e) => setSourceFormat(e.target.value as 'md' | 'rst')}
              className={THEME_CLASSES.input}
            >
              <option value="md">Markdown (.md)</option>
              <option value="rst">reStructuredText (.rst)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Date Recorded</label>
            <input
              type="text"
              value={dateRecorded}
              onChange={(e) => setDateRecorded(e.target.value)}
              placeholder="YYYY-MM-DD"
              className={THEME_CLASSES.input}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Source Text / Series</label>
            <input
              type="text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="e.g., Mahāsatipaṭṭhāna Sutta Series"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Cover Image (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://... or upload image"
                className={`flex-1 ${THEME_CLASSES.inputMono}`}
              />
              <label className={THEME_CLASSES.btnOutline}>
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={THEME_CLASSES.label}>Executive Summary</label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief editorial overview of this discourse..."
            className={THEME_CLASSES.textarea}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Pāli Excerpt (Optional)</label>
            <textarea
              rows={2}
              value={paliExcerpt}
              onChange={(e) => setPaliExcerpt(e.target.value)}
              placeholder="Ekāyano ayaṃ bhikkhave maggo..."
              className={THEME_CLASSES.textarea}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Excerpt Translation (Optional)</label>
            <textarea
              rows={2}
              value={paliTranslation}
              onChange={(e) => setPaliTranslation(e.target.value)}
              placeholder="Vietnamese or English translation of excerpt..."
              className={THEME_CLASSES.textarea}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={THEME_CLASSES.label}>Pull Quote (Optional)</label>
          <input
            type="text"
            value={pullQuote}
            onChange={(e) => setPullQuote(e.target.value)}
            placeholder="Highlighted key teaching sentence..."
            className={THEME_CLASSES.input}
          />
        </div>

        <div className="space-y-1.5">
          <label className={THEME_CLASSES.label}>
            Discourse Prose * (Use ## Heading for sub-sections)
          </label>
          <textarea
            rows={7}
            required
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Enter discourse paragraphs separated by blank lines..."
            className={THEME_CLASSES.textarea}
          />
        </div>

        <MediaAttachmentsField
          discourseTitle={title}
          audioReferenceUrl={audioReferenceUrl}
          onAudioReferenceUrlChange={setAudioReferenceUrl}
          mediaItems={mediaItems}
          onMediaItemsChange={setMediaItems}
          onUploadNotice={setUploadNotice}
          onError={setFormError}
        />

        <div
          className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex flex-wrap items-center justify-end gap-3`}
        >
          <button type="button" onClick={onClose} className={THEME_CLASSES.btnSecondary}>
            Cancel
          </button>
          <button type="submit" className={THEME_CLASSES.btnAccent}>
            {editingDiscourse ? 'Update Discourse' : 'Save Discourse'}
          </button>
        </div>
      </form>
    </EditorModal>
  );
}
