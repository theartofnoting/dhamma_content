import { useEffect, useRef, useState } from 'react';
import { FilePlus, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import { GITHUB_CONFIG, SITE_CONFIG, TAXONOMY } from '../config/siteConfig';
import { EditorModal } from '../theme/components/EditorModal';
import { THEME_CLASSES } from '../theme/uiClasses';
import { readFileAsDataUrl } from '../tools/fileTools';
import { calculateEstimatedReadingMinutes } from '../tools/readingTime';
import {
  getCollectionSlug,
  getDiscourseSlug,
  getSayadawSlug,
  slugifySegment,
} from '../tools/slugify';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  DiscourseMediaItem,
  DiscourseMediaType,
  DiscourseSection,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';
import { DiscourseMediaBlock } from './DiscourseMediaBlock';

interface StoreTeachingModalProps {
  isOpen: boolean;
  editingDiscourse: DhammaDiscourse | null;
  presetSayadawId?: string;
  sayadaws: SayadawProfile[];
  existingCount: number;
  onClose: () => void;
  onSave: (
    discourse: DhammaDiscourse,
    isEdit: boolean,
    newSayadaw?: SayadawProfile,
  ) => void;
}

function parseContentToSections(
  rawBody: string,
  paliExcerpt: string,
  paliTranslation: string,
): DiscourseSection[] {
  const lines = rawBody.split('\n');
  const sections: DiscourseSection[] = [];
  let currentHeading = '1. Exposition';
  let currentParagraphs: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      if (currentParagraphs.length > 0) {
        sections.push({
          heading: currentHeading,
          paragraphs: currentParagraphs,
        });
      }
      currentHeading = trimmed.replace(/^##\s+/, '');
      currentParagraphs = [];
    } else if (trimmed.length > 0) {
      currentParagraphs.push(trimmed);
    }
  }

  if (currentParagraphs.length > 0 || sections.length === 0) {
    sections.push({
      heading: currentHeading,
      paragraphs:
        currentParagraphs.length > 0
          ? currentParagraphs
          : [`Recorded for open Dhamma study in ${SITE_CONFIG.brandTitle}.`],
    });
  }

  if (paliExcerpt.trim() && sections[0]) {
    sections[0].paliExcerpt = paliExcerpt.trim();
    if (paliTranslation.trim()) {
      sections[0].paliTranslation = paliTranslation.trim();
    }
  }

  return sections;
}

function sectionsToRawBody(sections: DiscourseSection[]): string {
  return sections
    .map((sec) => `## ${sec.heading}\n\n${sec.paragraphs.join('\n\n')}`)
    .join('\n\n');
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
  const [chineseTitle, setChineseTitle] = useState('');
  const [paliSubtitle, setPaliSubtitle] = useState('');
  const [sayadawSelection, setSayadawSelection] = useState(sayadaws[0]?.id || 'custom');
  const [customSayadawName, setCustomSayadawName] = useState('');
  const [customSayadawMonastery, setCustomSayadawMonastery] = useState('');
  const [collection, setCollection] = useState<TraditionCollection>(TAXONOMY.collections[1]);
  const [language, setLanguage] = useState<DiscourseLanguage>(TAXONOMY.languages[0]);
  const [sourceText, setSourceText] = useState('');
  const [dateRecorded, setDateRecorded] = useState('');
  const [summary, setSummary] = useState('');
  const [paliExcerpt, setPaliExcerpt] = useState('');
  const [paliTranslation, setPaliTranslation] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [marginTerm, setMarginTerm] = useState('');
  const [marginNoteText, setMarginNoteText] = useState('');
  const [discourseSlug, setDiscourseSlug] = useState('');
  const [collectionSlug, setCollectionSlug] = useState('');
  const [sourceFormat, setSourceFormat] = useState<'md' | 'rst'>('md');

  // Media fields
  const [coverImage, setCoverImage] = useState('');
  const [coverCaption, setCoverCaption] = useState('');
  const [audioReferenceUrl, setAudioReferenceUrl] = useState('');
  const [mediaItems, setMediaItems] = useState<DiscourseMediaItem[]>([]);
  const [newMediaType, setNewMediaType] = useState<DiscourseMediaType>('audio');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValidationError(null);
    setUploadNotice(null);
    setShowMediaPreview(false);

    if (editingDiscourse) {
      setTitle(editingDiscourse.title);
      setChineseTitle(editingDiscourse.chineseTitle || '');
      setPaliSubtitle(editingDiscourse.paliSubtitle || '');
      const known = sayadaws.find((s) => s.id === editingDiscourse.sayadawId);
      if (known) {
        setSayadawSelection(known.id);
        setCustomSayadawName('');
      } else {
        setSayadawSelection('custom');
        setCustomSayadawName(editingDiscourse.sayadawName);
      }
      setCustomSayadawMonastery('');
      setCollection(editingDiscourse.collection);
      setLanguage(editingDiscourse.language);
      setSourceText(editingDiscourse.sourceText);
      setDateRecorded(editingDiscourse.dateRecorded);
      setSummary(editingDiscourse.summary);
      setPaliExcerpt(editingDiscourse.sections[0]?.paliExcerpt || '');
      setPaliTranslation(editingDiscourse.sections[0]?.paliTranslation || '');
      setBodyContent(sectionsToRawBody(editingDiscourse.sections));
      setPullQuote(editingDiscourse.pullQuote);
      setMarginTerm(editingDiscourse.marginNotes[0]?.termPali || '');
      setMarginNoteText(editingDiscourse.marginNotes[0]?.noteText || '');
      setDiscourseSlug(getDiscourseSlug(editingDiscourse));
      setCollectionSlug(getCollectionSlug(editingDiscourse));
      setSourceFormat(
        editingDiscourse.sourceFormat || (editingDiscourse.repoPath.endsWith('.rst') ? 'rst' : 'md'),
      );
      setCoverImage(editingDiscourse.coverImage || '');
      setCoverCaption(editingDiscourse.coverCaption || '');
      setAudioReferenceUrl(editingDiscourse.audioReferenceUrl || '');
      setMediaItems(editingDiscourse.mediaItems || []);
    } else {
      setTitle('');
      setChineseTitle('');
      setPaliSubtitle('');
      const initialSayadaw =
        presetSayadawId && sayadaws.some((s) => s.id === presetSayadawId)
          ? presetSayadawId
          : sayadaws[0]?.id || 'custom';
      setSayadawSelection(initialSayadaw);
      setCustomSayadawName('');
      setCustomSayadawMonastery('');
      setCollection(TAXONOMY.collections[1]);
      setLanguage(TAXONOMY.languages[0]);
      setSourceText('');
      setDateRecorded(`${new Date().getFullYear()} · Archive Entry`);
      setSummary('');
      setPaliExcerpt('');
      setPaliTranslation('');
      setBodyContent('');
      setPullQuote('');
      setMarginTerm('');
      setMarginNoteText('');
      setDiscourseSlug('');
      setCollectionSlug('satipatthana-vipassana');
      setSourceFormat('md');
      setCoverImage('');
      setCoverCaption('');
      setAudioReferenceUrl('');
      setMediaItems([]);
    }
    setNewMediaType('audio');
    setNewMediaTitle('');
    setNewMediaUrl('');
    setNewMediaCaption('');
  }, [isOpen, editingDiscourse, presetSayadawId, sayadaws]);

  const insertSectionTemplate = () => {
    const snippet = `\n\n## New Section Title\n\nWrite the Sayadaw's exposition or transcript paragraphs here.\n`;
    const textarea = bodyTextareaRef.current;
    if (!textarea) {
      setBodyContent((prev) => `${prev}${snippet}`.trimStart());
      return;
    }
    const start = textarea.selectionStart ?? bodyContent.length;
    const end = textarea.selectionEnd ?? bodyContent.length;
    const next = `${bodyContent.slice(0, start)}${snippet}${bodyContent.slice(end)}`;
    setBodyContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (result: { dataUrl: string; fileName: string; mimeType: string }) => void,
    successNotice: (fileName: string) => string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loaded = await readFileAsDataUrl(file, SITE_CONFIG.maxUploadBytes);
      onLoaded(loaded);
      setUploadNotice(successNotice(loaded.fileName));
    } catch (err) {
      setUploadNotice(err instanceof Error ? err.message : 'Unable to attach file.');
    }
  };

  const handleAddMediaItem = () => {
    if (!newMediaUrl.trim()) {
      setValidationError('Enter a media URL before clicking Add Media.');
      return;
    }
    setValidationError(null);
    setMediaItems((prev) => [
      ...prev,
      {
        id: `media-${Date.now()}-${prev.length}`,
        type: newMediaType,
        title:
          newMediaTitle.trim() || `${newMediaType.toUpperCase()} Attachment ${prev.length + 1}`,
        url: newMediaUrl.trim(),
        caption: newMediaCaption.trim() || undefined,
      },
    ]);
    setNewMediaTitle('');
    setNewMediaUrl('');
    setNewMediaCaption('');
  };

  const handleRemoveMediaItem = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const buildDiscoursePayload = (): {
    discourse: DhammaDiscourse;
    newSayadaw?: SayadawProfile;
  } => {
    const chosenSayadaw = sayadaws.find((s) => s.id === sayadawSelection);
    const resolvedSayadawName =
      sayadawSelection === 'custom'
        ? customSayadawName.trim() || 'Sayadaw'
        : chosenSayadaw?.name || 'Sayadaw';
    const resolvedSayadawId =
      sayadawSelection === 'custom' ? slugifySegment(resolvedSayadawName) : sayadawSelection;

    let newSayadaw: SayadawProfile | undefined;
    if (sayadawSelection === 'custom' && !sayadaws.some((s) => s.id === resolvedSayadawId)) {
      newSayadaw = {
        id: resolvedSayadawId,
        slug: resolvedSayadawId,
        name: resolvedSayadawName,
        honorificTitle: 'Sayadaw',
        monastery: customSayadawMonastery.trim() || `${SITE_CONFIG.brandTitle} Archive`,
        location: '',
        lineage: collection,
        years: '',
        biography: `Discourses indexed under ${resolvedSayadawName}.`,
        primaryTexts: sourceText.trim() ? [sourceText.trim()] : [],
      };
    }

    const sections = parseContentToSections(bodyContent, paliExcerpt, paliTranslation);
    const sSlug =
      sayadawSelection === 'custom'
        ? slugifySegment(resolvedSayadawName)
        : getSayadawSlug(resolvedSayadawId, sayadaws, resolvedSayadawName);
    const cSlug = slugifySegment(collectionSlug || collection);
    const dSlug = slugifySegment(discourseSlug || title || 'new-discourse');
    const computedRepoPath = `${GITHUB_CONFIG.articlesRoot}/${cSlug}/${sSlug}/${dSlug}.${sourceFormat}`;

    const nextNumber = String(existingCount + 1).padStart(2, '0');
    const prefix = TAXONOMY.collectionPrefixes[collection] || 'MNK';

    const draft: DhammaDiscourse = {
      id: editingDiscourse ? editingDiscourse.id : `${dSlug}-${Date.now()}`,
      accessionCode: editingDiscourse
        ? editingDiscourse.accessionCode
        : `ACC. ${prefix}.${nextNumber}`,
      slug: dSlug,
      collectionSlug: cSlug,
      sourceFormat,
      title: title.trim() || 'Untitled Discourse',
      chineseTitle: chineseTitle.trim() || undefined,
      paliSubtitle: paliSubtitle.trim() || undefined,
      sayadawId: resolvedSayadawId,
      sayadawName: resolvedSayadawName,
      collection,
      language,
      dateRecorded: dateRecorded.trim() || `${new Date().getFullYear()} · Archive Entry`,
      readingMinutes: 5,
      sourceText: sourceText.trim() || 'Recorded Sayadaw Desanā',
      summary:
        summary.trim() ||
        bodyContent
          .trim()
          .split('\n')
          .find((l) => l.trim() && !l.startsWith('## '))
          ?.slice(0, 220) ||
        title.trim() ||
        'Sayadaw Dhamma discourse.',
      sections,
      pullQuote:
        pullQuote.trim() ||
        'Mindfulness grounded in right understanding sees phenomena as they truly arise and pass away.',
      marginNotes:
        marginTerm.trim() && marginNoteText.trim()
          ? [
              {
                id: `mn-${Date.now()}`,
                anchorLabel: 'Archival Note',
                termPali: marginTerm.trim(),
                noteText: marginNoteText.trim(),
                sourceCitation: sourceText.trim() || SITE_CONFIG.brandTitle,
              },
            ]
          : editingDiscourse?.marginNotes || [],
      footnotes: editingDiscourse?.footnotes || [],
      coverImage: coverImage.trim() || undefined,
      coverCaption: coverCaption.trim() || undefined,
      audioReferenceUrl: audioReferenceUrl.trim() || undefined,
      mediaItems: mediaItems.length > 0 ? mediaItems : undefined,
      repoPath: computedRepoPath,
      featuredRank: editingDiscourse?.featuredRank,
      isUserCreated: editingDiscourse ? editingDiscourse.isUserCreated : true,
    };

    draft.readingMinutes = calculateEstimatedReadingMinutes(draft);
    return { discourse: draft, newSayadaw };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter a discourse title.');
      return;
    }
    if (sayadawSelection === 'custom' && !customSayadawName.trim()) {
      setValidationError('Please enter the new Sayadaw name to index this discourse.');
      return;
    }
    if (!bodyContent.trim()) {
      setValidationError('Please enter the Sayadaw writing content to store.');
      return;
    }

    const { discourse, newSayadaw } = buildDiscoursePayload();
    onSave(discourse, Boolean(editingDiscourse), newSayadaw);
  };

  const liveWordCount = bodyContent.trim()
    ? bodyContent.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const liveEstMinutes = Math.max(2, Math.round(liveWordCount / 125));

  return (
    <EditorModal
      isOpen={isOpen}
      headingId="store-teaching-heading"
      kicker="Discourse & Media Editor"
      title={editingDiscourse ? 'Edit Discourse Content & Media' : 'Add Sayadaw Discourse & Media'}
      maxWidthClassName="max-w-3xl"
      error={validationError}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Core Metadata & Sayadaw Index */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className={THEME_CLASSES.label}>Discourse Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Contemplation of Feeling (Vedanānupassanā)"
              className={THEME_CLASSES.input}
            />
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Index Under Sayadaw *</label>
            <select
              value={sayadawSelection}
              onChange={(e) => setSayadawSelection(e.target.value)}
              className={THEME_CLASSES.input}
            >
              {sayadaws.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value="custom">+ Add New Sayadaw to Index</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Collection</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value as TraditionCollection)}
              className={THEME_CLASSES.input}
            >
              {TAXONOMY.collections.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {sayadawSelection === 'custom' && (
            <>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>New Sayadaw Name *</label>
                <input
                  type="text"
                  required
                  value={customSayadawName}
                  onChange={(e) => setCustomSayadawName(e.target.value)}
                  placeholder="e.g., Ven. Sayadaw U Pandita"
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Monastery / Center (Optional)</label>
                <input
                  type="text"
                  value={customSayadawMonastery}
                  onChange={(e) => setCustomSayadawMonastery(e.target.value)}
                  placeholder="e.g., Panditarama Meditation Center"
                  className={THEME_CLASSES.input}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Chinese Title (Optional)</label>
            <input
              type="text"
              value={chineseTitle}
              onChange={(e) => setChineseTitle(e.target.value)}
              placeholder="e.g., 日常修行中的受念處"
              className={THEME_CLASSES.input}
            />
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Pāli Subtitle (Optional)</label>
            <input
              type="text"
              value={paliSubtitle}
              onChange={(e) => setPaliSubtitle(e.target.value)}
              placeholder="e.g., Vedanānupassanā-satipaṭṭhāna"
              className={THEME_CLASSES.input}
            />
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Language / Script</label>
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
            <label className={THEME_CLASSES.label}>Source Text / Sutta Reference</label>
            <input
              type="text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="e.g., Satipaṭṭhāna Sutta (MN 10)"
              className={THEME_CLASSES.input}
            />
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Year &amp; Venue Recorded</label>
            <input
              type="text"
              value={dateRecorded}
              onChange={(e) => setDateRecorded(e.target.value)}
              placeholder="e.g., 2026 · Retreat Hall"
              className={THEME_CLASSES.input}
            />
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>URL Discourse Slug</label>
            <input
              type="text"
              value={discourseSlug}
              onChange={(e) => setDiscourseSlug(e.target.value)}
              placeholder="e.g., pt05-02-stopping-and-contemplation"
              className={THEME_CLASSES.inputMono}
            />
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>URL Collection Slug</label>
            <input
              type="text"
              value={collectionSlug}
              onChange={(e) => setCollectionSlug(e.target.value)}
              placeholder="e.g., dhamma-talks-by-mogok-sayadaw"
              className={THEME_CLASSES.inputMono}
            />
          </div>

          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Source Format</label>
            <select
              value={sourceFormat}
              onChange={(e) => setSourceFormat(e.target.value as 'md' | 'rst')}
              className={THEME_CLASSES.input}
            >
              <option value="md">Markdown (.md)</option>
              <option value="rst">reStructuredText (.rst)</option>
            </select>
          </div>
        </div>

        {/* 2. Writing Content */}
        <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} space-y-4`}>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>Summary / Editorial Abstract</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief overview of the core Dhamma teaching shown in the catalog..."
              className={THEME_CLASSES.textarea}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className={THEME_CLASSES.label}>
                Full Discourse Writing * (Start sections with{' '}
                <span className="font-mono-code">## Heading</span>)
              </label>
              <div className="flex items-center gap-3">
                <span className={`font-mono-code text-[11px] ${THEME_CLASSES.inkSubtle} tabular-nums`}>
                  {liveWordCount} words · ~{liveEstMinutes} min read
                </span>
                <button
                  type="button"
                  onClick={insertSectionTemplate}
                  className={`inline-flex items-center gap-1 min-h-[30px] px-2.5 text-[11px] font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
                >
                  <FilePlus className="h-3 w-3" aria-hidden="true" />
                  <span>+ Insert Section</span>
                </button>
              </div>
            </div>
            <textarea
              ref={bodyTextareaRef}
              rows={7}
              required
              value={bodyContent}
              onChange={(e) => setBodyContent(e.target.value)}
              placeholder={`## 1. Direct Observation\n\nEnter the Sayadaw's discourse paragraphs here...\n\n## 2. Applying Insight in Daily Life\n\nSecond section paragraphs...`}
              className={THEME_CLASSES.textarea}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Pāli Excerpt (Optional)</label>
              <input
                type="text"
                value={paliExcerpt}
                onChange={(e) => setPaliExcerpt(e.target.value)}
                placeholder="e.g., Sukhaṃ vā vedanaṃ vedayamāno..."
                className={THEME_CLASSES.inputCompact}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Pāli Translation (Optional)</label>
              <input
                type="text"
                value={paliTranslation}
                onChange={(e) => setPaliTranslation(e.target.value)}
                placeholder="English or Chinese translation of excerpt..."
                className={THEME_CLASSES.inputCompact}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className={THEME_CLASSES.label}>Pull Quote (Optional)</label>
              <input
                type="text"
                value={pullQuote}
                onChange={(e) => setPullQuote(e.target.value)}
                placeholder="Key contemplative insight highlighted in the Reading Room..."
                className={THEME_CLASSES.inputCompact}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Margin Glossary Term (Optional)</label>
              <input
                type="text"
                value={marginTerm}
                onChange={(e) => setMarginTerm(e.target.value)}
                placeholder="e.g., Vedanā-paccayā taṇhā"
                className={THEME_CLASSES.inputCompact}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Margin Note Explanation (Optional)</label>
              <input
                type="text"
                value={marginNoteText}
                onChange={(e) => setMarginNoteText(e.target.value)}
                placeholder="Concise note shown in the Reading Room rail..."
                className={THEME_CLASSES.inputCompact}
              />
            </div>
          </div>
        </div>

        {/* 3. Media: Cover Image, Audio/Video Talk, Additional Attachments */}
        <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className={`font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
              Media &amp; Recordings
            </h4>
            {(audioReferenceUrl.trim() || mediaItems.length > 0) && (
              <button
                type="button"
                onClick={() => setShowMediaPreview((v) => !v)}
                className={`min-h-[34px] px-3 text-xs font-medium border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
              >
                {showMediaPreview ? 'Hide Media Preview' : 'Preview Media'}
              </button>
            )}
          </div>

          {uploadNotice && <div className={THEME_CLASSES.alertInfo}>{uploadNotice}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Cover Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... or upload an image"
                  className={`flex-1 ${THEME_CLASSES.inputMono}`}
                />
                <label className={THEME_CLASSES.btnOutline}>
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        ({ dataUrl }) => setCoverImage(dataUrl),
                        (name) => `Attached cover image "${name}". Publish to save it to the archive.`,
                      )
                    }
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Cover Image Caption (Optional)</label>
              <input
                type="text"
                value={coverCaption}
                onChange={(e) => setCoverCaption(e.target.value)}
                placeholder="e.g., Sagaing Dhamma Hall · 2026 Retreat"
                className={THEME_CLASSES.inputCompact}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className={THEME_CLASSES.label}>
                Primary Audio / Video Talk (YouTube, MP3/MP4 URL, or Upload)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={audioReferenceUrl}
                  onChange={(e) => setAudioReferenceUrl(e.target.value)}
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
                        ({ dataUrl }) => setAudioReferenceUrl(dataUrl),
                        (name) => `Attached talk media "${name}". Publish to save it to the archive.`,
                      )
                    }
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className={`p-4 ${THEME_CLASSES.card} space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={THEME_CLASSES.label}>
                Additional Media Attachments ({mediaItems.length})
              </p>
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
                        setMediaItems((prev) => [
                          ...prev,
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
                  <div
                    key={item.id}
                    className="py-2 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className={`font-medium ${THEME_CLASSES.inkPrimary} truncate`}>
                        <span
                          className={`font-mono-code uppercase text-[10px] ${THEME_CLASSES.accentInk} mr-2`}
                        >
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
                      onClick={() => handleRemoveMediaItem(item.id)}
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
              discourseTitle={title || 'Discourse Preview'}
            />
          )}
        </div>

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
