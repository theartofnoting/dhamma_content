import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';
import { LocaleDictionary } from '../../i18n';
import { EditorModal } from '../../theme/components/EditorModal';
import { THEME_CLASSES } from '../../theme/uiClasses';
import { readFileAsDataUrl } from '../../tools/fileTools';
import { slugifySegment } from '../../tools/slugify';
import { SayadawProfile } from '../../types/dhamma';

interface SayadawEditorModalProps {
  isOpen: boolean;
  dict: LocaleDictionary;
  editingSayadaw: SayadawProfile | null;
  onClose: () => void;
  onSave: (sayadaw: SayadawProfile, isEdit: boolean) => void;
}

export function SayadawEditorModal({
  isOpen,
  dict,
  editingSayadaw,
  onClose,
  onSave,
}: SayadawEditorModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [honorificTitle, setHonorificTitle] = useState('Sayadaw');
  const [vietnameseName, setVietnameseName] = useState('');
  const [years, setYears] = useState('');
  const [monastery, setMonastery] = useState('');
  const [location, setLocation] = useState('');
  const [lineage, setLineage] = useState('Vipassanā');
  const [biography, setBiography] = useState('');
  const [primaryTextsRaw, setPrimaryTextsRaw] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingSayadaw) {
      setName(editingSayadaw.name);
      setSlug(editingSayadaw.slug || editingSayadaw.id);
      setHonorificTitle(editingSayadaw.honorificTitle);
      setVietnameseName(editingSayadaw.vietnameseName || '');
      setYears(editingSayadaw.years);
      setMonastery(editingSayadaw.monastery);
      setLocation(editingSayadaw.location);
      setLineage(editingSayadaw.lineage);
      setBiography(editingSayadaw.biography);
      setPrimaryTextsRaw(editingSayadaw.primaryTexts.join('\n'));
      setImageUrl(editingSayadaw.imageUrl || '');
    } else {
      setName('');
      setSlug('');
      setHonorificTitle('Sayadaw');
      setVietnameseName('');
      setYears('');
      setMonastery('');
      setLocation('');
      setLineage('Vipassanā');
      setBiography('');
      setPrimaryTextsRaw('');
      setImageUrl('');
    }
    setFormError(null);
  }, [isOpen, editingSayadaw]);

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl } = await readFileAsDataUrl(file, SITE_CONFIG.maxPortraitBytes);
      setImageUrl(dataUrl);
      setFormError(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to upload portrait image.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(dict.sayadaws.nameRequiredError);
      return;
    }

    const resolvedSlug = slugifySegment(slug.trim() || name.trim());
    const resolvedId = editingSayadaw ? editingSayadaw.id : resolvedSlug;
    const primaryTexts = primaryTextsRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const profile: SayadawProfile = {
      id: resolvedId,
      slug: resolvedSlug,
      name: name.trim(),
      honorificTitle: honorificTitle.trim() || 'Sayadaw',
      vietnameseName: vietnameseName.trim() || undefined,
      monastery: monastery.trim() || 'Vipassana Bhavana Archive',
      location: location.trim(),
      lineage: lineage.trim() || 'Vipassanā',
      years: years.trim(),
      biography: biography.trim() || `Teachings and discourses of ${name.trim()}.`,
      primaryTexts,
      imageUrl: imageUrl.trim() || undefined,
    };

    onSave(profile, Boolean(editingSayadaw));
    onClose();
  };

  return (
    <EditorModal
      isOpen={isOpen}
      headingId="sayadaw-modal-heading"
      kicker={dict.sayadaws.modalKicker}
      title={editingSayadaw ? dict.sayadaws.editTitle : dict.sayadaws.createTitle}
      error={formError}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldName}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ven. Mogok Sayadaw (U Vimala)"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldSlug}</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ven-mogok"
              className={THEME_CLASSES.inputMono}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldHonorific}</label>
            <input
              type="text"
              value={honorificTitle}
              onChange={(e) => setHonorificTitle(e.target.value)}
              placeholder="Aggamahāpaṇḍita"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldVietnameseName}</label>
            <input
              type="text"
              value={vietnameseName}
              onChange={(e) => setVietnameseName(e.target.value)}
              placeholder="vd: Thiền Sư Mogok"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldMonastery}</label>
            <input
              type="text"
              value={monastery}
              onChange={(e) => setMonastery(e.target.value)}
              placeholder="Mingala Taik Monastery"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldLocation}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Mogok & Mandalay, Myanmar"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldLineage}</label>
            <input
              type="text"
              value={lineage}
              onChange={(e) => setLineage(e.target.value)}
              placeholder="Paṭiccasamuppāda & Cittānupassanā"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldYears}</label>
            <input
              type="text"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="1899–1962"
              className={THEME_CLASSES.input}
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldPortrait}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className={`${THEME_CLASSES.inputMono} flex-1`}
              />
              <label className={THEME_CLASSES.btnOutline}>
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{dict.sayadaws.uploadBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePortraitUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldBiography}</label>
          <textarea
            rows={3}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            className={THEME_CLASSES.textarea}
          />
        </div>

        <div className="space-y-1.5">
          <label className={THEME_CLASSES.label}>{dict.sayadaws.fieldPrimaryTexts}</label>
          <textarea
            rows={2}
            value={primaryTextsRaw}
            onChange={(e) => setPrimaryTextsRaw(e.target.value)}
            className={THEME_CLASSES.textarea}
          />
        </div>

        <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex justify-end gap-3`}>
          <button type="button" onClick={onClose} className={THEME_CLASSES.btnSecondary}>
            {dict.sayadaws.cancelBtn}
          </button>
          <button type="submit" className={THEME_CLASSES.btnAccent}>
            {editingSayadaw ? dict.sayadaws.updateBtn : dict.sayadaws.saveBtn}
          </button>
        </div>
      </form>
    </EditorModal>
  );
}
