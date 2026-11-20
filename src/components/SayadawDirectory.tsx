import { useState } from 'react';
import { Image as ImageIcon, Pencil, Plus } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { resolveAssetUrl } from '../plugins/mediaResolver';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { EditorModal } from '../theme/components/EditorModal';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { readFileAsDataUrl } from '../tools/fileTools';
import { slugifySegment } from '../tools/slugify';
import { DhammaDiscourse, SayadawProfile } from '../types/dhamma';

interface SayadawDirectoryProps {
  sayadaws: SayadawProfile[];
  discourses: DhammaDiscourse[];
  isOwner: boolean;
  onFilterBySayadaw: (sayadawId: string) => void;
  onSaveSayadaw: (sayadaw: SayadawProfile, isEdit: boolean) => void;
  onDeleteSayadaw: (sayadawId: string) => void;
}

export function SayadawDirectory({
  sayadaws,
  discourses,
  isOwner,
  onFilterBySayadaw,
  onSaveSayadaw,
  onDeleteSayadaw,
}: SayadawDirectoryProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSayadaw, setEditingSayadaw] = useState<SayadawProfile | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [honorificTitle, setHonorificTitle] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [years, setYears] = useState('');
  const [monastery, setMonastery] = useState('');
  const [location, setLocation] = useState('');
  const [lineage, setLineage] = useState('');
  const [biography, setBiography] = useState('');
  const [primaryTextsRaw, setPrimaryTextsRaw] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSayadaw(null);
    setName('');
    setSlug('');
    setHonorificTitle('Sayadaw');
    setChineseName('');
    setYears('');
    setMonastery('');
    setLocation('');
    setLineage('Vipassanā');
    setBiography('');
    setPrimaryTextsRaw('');
    setImageUrl('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: SayadawProfile) => {
    setEditingSayadaw(s);
    setName(s.name);
    setSlug(s.slug || s.id);
    setHonorificTitle(s.honorificTitle);
    setChineseName(s.chineseName || '');
    setYears(s.years);
    setMonastery(s.monastery);
    setLocation(s.location);
    setLineage(s.lineage);
    setBiography(s.biography);
    setPrimaryTextsRaw(s.primaryTexts.join('\n'));
    setImageUrl(s.imageUrl || '');
    setFormError(null);
    setIsModalOpen(true);
  };

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
      setFormError('Sayadaw name is required.');
      return;
    }
    const resolvedSlug = slugifySegment(slug.trim() || name.trim());
    const resolvedId = editingSayadaw ? editingSayadaw.id : resolvedSlug;
    const primaryTexts = primaryTextsRaw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload: SayadawProfile = {
      id: resolvedId,
      slug: resolvedSlug,
      name: name.trim(),
      honorificTitle: honorificTitle.trim() || 'Sayadaw',
      chineseName: chineseName.trim() || undefined,
      monastery: monastery.trim() || `${SITE_CONFIG.brandTitle} Archive`,
      location: location.trim(),
      lineage: lineage.trim() || 'Vipassanā',
      years: years.trim(),
      biography: biography.trim() || `Teachings and discourses of ${name.trim()}.`,
      primaryTexts,
      imageUrl: imageUrl.trim() || undefined,
    };

    onSaveSayadaw(payload, Boolean(editingSayadaw));
    setIsModalOpen(false);
  };

  return (
    <section id="sayadaws-section" className={THEME_CLASSES.band}>
      <div className={THEME_CLASSES.sectionContainer}>
        <SectionHeader
          kicker="02. Lineage & Teachers"
          title="Sayadaw Masters in the Archive"
          description={`Biographical notes, monastic seats, and core Pāli-Burmese lineages preserved by our ${SITE_CONFIG.brandTitle} group.`}
          bottomPaddingClassName="pb-10"
          actions={
            isOwner ? (
              <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnPrimary}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Sayadaw</span>
              </button>
            ) : undefined
          }
        />

        {sayadaws.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className={`font-display text-2xl font-medium ${THEME_CLASSES.inkPrimary}`}>
              No Sayadaw profiles added yet
            </p>
            {isOwner && (
              <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnAccent}>
                Add First Sayadaw
              </button>
            )}
          </div>
        ) : (
          <div className={THEME_CLASSES.divideHairline}>
            {sayadaws.map((s) => {
              const count = discourses.filter((d) => d.sayadawId === s.id).length;
              const portraitSrc = s.imageUrl ? resolveAssetUrl(s.imageUrl) : '';
              return (
                <article
                  key={s.id}
                  className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  <div className="lg:col-span-4 flex items-start gap-4">
                    {portraitSrc && (
                      <img
                        src={portraitSrc}
                        alt={s.name}
                        className={`h-16 w-16 shrink-0 object-cover border ${THEME_CLASSES.borderStrong}`}
                      />
                    )}
                    <div className="space-y-1.5 min-w-0">
                      {(s.years || s.location) && (
                        <p className={`font-mono-code text-xs ${THEME_CLASSES.accentInk}`}>
                          {[s.years, s.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                        {s.name}
                      </h3>
                      {s.chineseName && (
                        <p className={`text-sm ${THEME_CLASSES.inkSecondary}`}>{s.chineseName}</p>
                      )}
                      {s.honorificTitle && (
                        <p className={`text-xs ${THEME_CLASSES.inkSubtle} pt-1`}>
                          {s.honorificTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">
                    {(s.monastery || s.lineage) && (
                      <p className={`text-xs uppercase tracking-wider ${THEME_CLASSES.inkSubtle}`}>
                        {[s.monastery, s.lineage].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className={`text-sm leading-[1.7] ${THEME_CLASSES.inkSecondary}`}>
                      {s.biography}
                    </p>
                  </div>

                  <div className="lg:col-span-3 flex flex-col justify-between gap-4 lg:items-end">
                    {s.primaryTexts.length > 0 && (
                      <div className="lg:text-right space-y-1">
                        <p className={`text-xs uppercase tracking-wider ${THEME_CLASSES.inkSubtle}`}>
                          Key Works
                        </p>
                        <ul className={`text-xs ${THEME_CLASSES.inkSecondary} space-y-1`}>
                          {s.primaryTexts.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap lg:justify-end items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onFilterBySayadaw(s.id)}
                        className={`${THEME_CLASSES.btnOutline} hover:text-[var(--accent-ink)]`}
                      >
                        <span className="tabular-nums">View {count} Discourses</span>
                      </button>

                      {isOwner && (
                        <div className={`flex items-center gap-2 text-xs ${THEME_CLASSES.inkMuted}`}>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            aria-label={`Edit ${s.name}`}
                            className={`inline-flex items-center gap-1 min-h-[36px] px-2.5 border ${THEME_CLASSES.borderStrong} hover:border-[var(--accent-ink)] hover:text-[var(--ink-primary)] cursor-pointer`}
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>

                          <ConfirmDeleteAction
                            isConfirming={confirmDeleteId === s.id}
                            onRequestConfirm={() => setConfirmDeleteId(s.id)}
                            onConfirm={() => {
                              onDeleteSayadaw(s.id);
                              setConfirmDeleteId(null);
                            }}
                            onCancel={() => setConfirmDeleteId(null)}
                            ariaLabel={`Delete ${s.name}`}
                            confirmLabel={count > 0 ? `Delete + ${count} talk(s)` : 'Confirm'}
                            variant="button"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {isOwner && (
        <EditorModal
          isOpen={isModalOpen}
          headingId="sayadaw-modal-heading"
          kicker="Lineage & Teachers"
          title={editingSayadaw ? 'Edit Sayadaw Profile' : 'Add Sayadaw Profile'}
          error={formError}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Sayadaw Name *</label>
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
                <label className={THEME_CLASSES.label}>URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Auto-generated (e.g. ven-mogok)"
                  className={THEME_CLASSES.inputMono}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Honorific Title</label>
                <input
                  type="text"
                  value={honorificTitle}
                  onChange={(e) => setHonorificTitle(e.target.value)}
                  placeholder="e.g., Aggamahāpaṇḍita"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Chinese Name (Optional)</label>
                <input
                  type="text"
                  value={chineseName}
                  onChange={(e) => setChineseName(e.target.value)}
                  placeholder="e.g., 莫哥薩亞多"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Monastery / Center</label>
                <input
                  type="text"
                  value={monastery}
                  onChange={(e) => setMonastery(e.target.value)}
                  placeholder="e.g., Mingala Taik Monastery"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Mogok & Mandalay, Myanmar"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Lineage / Tradition</label>
                <input
                  type="text"
                  value={lineage}
                  onChange={(e) => setLineage(e.target.value)}
                  placeholder="e.g., Paṭiccasamuppāda & Cittānupassanā"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Years</label>
                <input
                  type="text"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="e.g., 1899–1962"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className={THEME_CLASSES.label}>Portrait Image (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or upload an image"
                    className={`${THEME_CLASSES.inputMono} flex-1`}
                  />
                  <label className={THEME_CLASSES.btnOutline}>
                    <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Upload</span>
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
              <label className={THEME_CLASSES.label}>Biography</label>
              <textarea
                rows={3}
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                placeholder="Biographical summary and emphasis of teachings..."
                className={THEME_CLASSES.textarea}
              />
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Key Works (One per line, optional)</label>
              <textarea
                rows={2}
                value={primaryTextsRaw}
                onChange={(e) => setPrimaryTextsRaw(e.target.value)}
                placeholder="Dhamma Talks by Mogok Sayadaw"
                className={THEME_CLASSES.textarea}
              />
            </div>

            <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex justify-end gap-3`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={THEME_CLASSES.btnSecondary}
              >
                Cancel
              </button>
              <button type="submit" className={THEME_CLASSES.btnAccent}>
                {editingSayadaw ? 'Update Sayadaw' : 'Save Sayadaw'}
              </button>
            </div>
          </form>
        </EditorModal>
      )}
    </section>
  );
}
