import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  DhammaDiscourse,
  DiscourseLanguage,
  DiscourseSection,
  SayadawProfile,
  TraditionCollection,
} from '../types/dhamma';

interface StoreTeachingModalProps {
  isOpen: boolean;
  editingDiscourse: DhammaDiscourse | null;
  sayadaws: SayadawProfile[];
  existingCount: number;
  onClose: () => void;
  onSave: (discourse: DhammaDiscourse, isEdit: boolean) => void;
}

const COLLECTIONS: TraditionCollection[] = [
  'Abhidhamma',
  'Satipatthana & Vipassana',
  'Sutta Pitaka',
  'Visuddhimagga',
  'Monastic Talks',
];

const LANGUAGES: DiscourseLanguage[] = [
  'Pāli · 繁體中文 · English',
  'Pāli · English',
  'English',
  '繁體中文',
];

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || `discourse-${Date.now()}`
  );
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
          : ['Recorded for open Dhamma study in the Nanda Dhamma Archive.'],
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
    .map((sec) => {
      const head = `## ${sec.heading}`;
      const body = sec.paragraphs.join('\n\n');
      return `${head}\n\n${body}`;
    })
    .join('\n\n');
}

export function StoreTeachingModal({
  isOpen,
  editingDiscourse,
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
  const [collection, setCollection] = useState<TraditionCollection>('Abhidhamma');
  const [language, setLanguage] = useState<DiscourseLanguage>('Pāli · 繁體中文 · English');
  const [sourceText, setSourceText] = useState('');
  const [dateRecorded, setDateRecorded] = useState('');
  const [summary, setSummary] = useState('');
  const [paliExcerpt, setPaliExcerpt] = useState('');
  const [paliTranslation, setPaliTranslation] = useState('');
  const [bodyContent, setBodyContent] = useState('');
  const [pullQuote, setPullQuote] = useState('');
  const [marginTerm, setMarginTerm] = useState('');
  const [marginNoteText, setMarginNoteText] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValidationError(null);
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
      setRepoPath(editingDiscourse.repoPath);
    } else {
      setTitle('');
      setChineseTitle('');
      setPaliSubtitle('');
      setSayadawSelection(sayadaws[0]?.id || 'custom');
      setCustomSayadawName('');
      setCollection('Abhidhamma');
      setLanguage('Pāli · 繁體中文 · English');
      setSourceText('');
      setDateRecorded(`${new Date().getFullYear()} · Archive Entry`);
      setSummary('');
      setPaliExcerpt('');
      setPaliTranslation('');
      setBodyContent('');
      setPullQuote('');
      setMarginTerm('');
      setMarginNoteText('');
      setRepoPath('');
    }
  }, [isOpen, editingDiscourse, sayadaws]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter a discourse title.');
      return;
    }
    if (!bodyContent.trim()) {
      setValidationError('Please enter the Sayadaw teaching content to store.');
      return;
    }

    const chosenSayadaw = sayadaws.find((s) => s.id === sayadawSelection);
    const resolvedSayadawName =
      sayadawSelection === 'custom'
        ? customSayadawName.trim() || 'Sayadaw (Archive Contributor)'
        : chosenSayadaw?.name || 'Ven. Dr. Nandamālābhivaṃsa';
    const resolvedSayadawId =
      sayadawSelection === 'custom'
        ? slugify(resolvedSayadawName)
        : sayadawSelection;

    const sections = parseContentToSections(bodyContent, paliExcerpt, paliTranslation);
    const wordCount = bodyContent.trim().split(/\s+/).length;
    const readingMinutes = Math.max(3, Math.round(wordCount / 180));

    const slug = slugify(title);
    const computedRepoPath =
      repoPath.trim() || `docs/sayadaw/${resolvedSayadawId}/${slug}.md`;

    const nextNumber = String(existingCount + 1).padStart(2, '0');
    const prefix =
      collection === 'Abhidhamma'
        ? 'ABH'
        : collection === 'Satipatthana & Vipassana'
          ? 'VIP'
          : collection === 'Sutta Pitaka'
            ? 'SUT'
            : collection === 'Visuddhimagga'
              ? 'VIS'
              : 'MNK';

    const discourse: DhammaDiscourse = {
      id: editingDiscourse ? editingDiscourse.id : `${slug}-${Date.now()}`,
      accessionCode: editingDiscourse
        ? editingDiscourse.accessionCode
        : `ACC. ${prefix}.${nextNumber}`,
      title: title.trim(),
      chineseTitle: chineseTitle.trim() || undefined,
      paliSubtitle: paliSubtitle.trim() || undefined,
      sayadawId: resolvedSayadawId,
      sayadawName: resolvedSayadawName,
      collection,
      language,
      dateRecorded: dateRecorded.trim() || `${new Date().getFullYear()} · Archive Entry`,
      readingMinutes,
      sourceText: sourceText.trim() || 'Recorded Sayadaw Desanā',
      summary:
        summary.trim() ||
        bodyContent.trim().split('\n').find((l) => l.trim() && !l.startsWith('## '))?.slice(0, 220) ||
        title.trim(),
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
                sourceCitation: sourceText.trim() || 'theartofnoting/dhamma_content',
              },
            ]
          : editingDiscourse?.marginNotes || [],
      footnotes: editingDiscourse?.footnotes || [
        {
          index: 1,
          text: 'Stored locally in Vipassana Bhavana (Dhamma Page) and ready to commit as Markdown to theartofnoting/dhamma_content.',
        },
      ],
      repoPath: computedRepoPath,
      isUserCreated: true,
    };

    onSave(discourse, Boolean(editingDiscourse));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-teaching-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FBF9F5] dark:bg-[#181512] border border-[#D6CEBE] dark:border-[#342E28] p-6 sm:p-8 shadow-xl">
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#E5DFD3] dark:border-[#342E28]">
          <div className="space-y-1">
            <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
              theartofnoting/dhamma_content · Archive Entry
            </p>
            <h2
              id="store-teaching-heading"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]"
            >
              {editingDiscourse ? 'Edit Stored Sayadaw Teaching' : 'Store Sayadaw Dhamma Teaching'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pt-6 space-y-5">
          {validationError && (
            <div
              role="alert"
              className="p-3 border border-[#9A3412]/50 bg-[#9A3412]/5 text-xs text-[#9A3412] dark:text-[#FCA5A5]"
            >
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Discourse Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Contemplation of Feeling (Vedanānupassanā) in Daily Practice"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Chinese Title (Optional)
              </label>
              <input
                type="text"
                value={chineseTitle}
                onChange={(e) => setChineseTitle(e.target.value)}
                placeholder="e.g., 日常修行中的受念處"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Pāli Subtitle (Optional)
              </label>
              <input
                type="text"
                value={paliSubtitle}
                onChange={(e) => setPaliSubtitle(e.target.value)}
                placeholder="e.g., Vedanānupassanā-satipaṭṭhāna"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Sayadaw Master
              </label>
              <select
                value={sayadawSelection}
                onChange={(e) => setSayadawSelection(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              >
                {sayadaws.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="custom">Other Sayadaw (Enter Name)</option>
              </select>
            </div>

            {sayadawSelection === 'custom' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Custom Sayadaw Name
                </label>
                <input
                  type="text"
                  value={customSayadawName}
                  onChange={(e) => setCustomSayadawName(e.target.value)}
                  placeholder="e.g., Ven. Sayadaw U Pandita"
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Collection
              </label>
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value as TraditionCollection)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              >
                {COLLECTIONS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Language / Script
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as DiscourseLanguage)}
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Source Text / Sutta Reference
              </label>
              <input
                type="text"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="e.g., Satipaṭṭhāna Sutta (MN 10)"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Year &amp; Venue Recorded
              </label>
              <input
                type="text"
                value={dateRecorded}
                onChange={(e) => setDateRecorded(e.target.value)}
                placeholder="e.g., 2018 · Sagaing Hills"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Summary / Editorial Abstract
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief overview of the core Dhamma teaching..."
                className="w-full px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Full Discourse Text * (Prefix section titles with "## ")
              </label>
              <textarea
                rows={6}
                required
                value={bodyContent}
                onChange={(e) => setBodyContent(e.target.value)}
                placeholder={`## 1. Direct Observation\n\nEnter Sayadaw's discourse paragraphs here...\n\n## 2. Applying Insight in Daily Life\n\nSecond section paragraphs...`}
                className="w-full px-3 py-2 text-sm leading-relaxed bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Pāli Excerpt (Optional)
              </label>
              <input
                type="text"
                value={paliExcerpt}
                onChange={(e) => setPaliExcerpt(e.target.value)}
                placeholder="e.g., Sukhaṃ vā vedanaṃ vedayamāno..."
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Pāli Translation (Optional)
              </label>
              <input
                type="text"
                value={paliTranslation}
                onChange={(e) => setPaliTranslation(e.target.value)}
                placeholder="English or Chinese translation of excerpt..."
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Pull Quote (Optional)
              </label>
              <input
                type="text"
                value={pullQuote}
                onChange={(e) => setPullQuote(e.target.value)}
                placeholder="Key contemplative insight highlighted in the Reading Room..."
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Margin Glossary Term (Optional)
              </label>
              <input
                type="text"
                value={marginTerm}
                onChange={(e) => setMarginTerm(e.target.value)}
                placeholder="e.g., Vedanā-paccayā taṇhā"
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Margin Note Explanation (Optional)
              </label>
              <input
                type="text"
                value={marginNoteText}
                onChange={(e) => setMarginNoteText(e.target.value)}
                placeholder="Concise scholarly note for the margin rail..."
                className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                Target Repository Path (for theartofnoting/dhamma_content export)
              </label>
              <input
                type="text"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="docs/sayadaw/nandamalabhivamsa/new-teaching.md"
                className="w-full min-h-[42px] px-3 py-2 font-mono-code text-xs bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#342E28] flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2 text-sm font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] hover:border-[#1C1917] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2 text-sm font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] dark:bg-[#B45309] dark:hover:bg-[#92400E] cursor-pointer"
            >
              {editingDiscourse ? 'Update Teaching' : 'Save to Archive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
