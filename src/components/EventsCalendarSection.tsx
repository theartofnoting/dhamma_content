import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, List, Pencil, Plus } from 'lucide-react';
import { SITE_CONFIG, TAXONOMY } from '../config/siteConfig';
import { eventToIcs } from '../content/exporters';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { EditorModal } from '../theme/components/EditorModal';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { triggerFileDownload } from '../tools/fileTools';
import { EventStatus, EventType, GoogleFormTab, GroupEvent } from '../types/dhamma';

interface EventsCalendarSectionProps {
  events: GroupEvent[];
  formTabs: GoogleFormTab[];
  isOwner: boolean;
  onSaveEvent: (event: GroupEvent, isEdit: boolean) => void;
  onDeleteEvent: (id: string) => void;
  onRegisterWithForm: (formTabId: string) => void;
}

const EVENT_FILTER_TYPES: (EventType | 'All')[] = ['All', ...TAXONOMY.eventTypes];

function formatDateRange(start: string, end: string): string {
  return start === end ? start : `${start} – ${end}`;
}

export function EventsCalendarSection({
  events,
  formTabs,
  isOwner,
  onSaveEvent,
  onDeleteEvent,
  onRegisterWithForm,
}: EventsCalendarSectionProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedType, setSelectedType] = useState<EventType | 'All'>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>(TAXONOMY.eventTypes[0]);
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('2026-12-01');
  const [timeRange, setTimeRange] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [teacher, setTeacher] = useState('');
  const [status, setStatus] = useState<EventStatus>(TAXONOMY.eventStatuses[0]);
  const [description, setDescription] = useState('');
  const [linkedFormTabId, setLinkedFormTabId] = useState(formTabs[0]?.id || '');
  const [formError, setFormError] = useState<string | null>(null);

  const sortedEvents = useMemo(() => {
    const base =
      selectedType === 'All' ? events : events.filter((e) => e.eventType === selectedType);
    return [...base].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, selectedType]);

  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(Date.UTC(calYear, calMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(calYear, calMonth + 1, 0)).getUTCDate();
    const cells: { iso: string | null; dayNum: number | null; dayEvents: GroupEvent[] }[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ iso: null, dayNum: null, dayEvents: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = sortedEvents.filter(
        (evt) => iso >= evt.startDate && iso <= evt.endDate,
      );
      cells.push({ iso, dayNum: d, dayEvents });
    }
    return cells;
  }, [calYear, calMonth, sortedEvents]);

  const displayedEvents = useMemo(() => {
    if (viewMode === 'calendar' && selectedDayIso) {
      return sortedEvents.filter(
        (evt) => selectedDayIso >= evt.startDate && selectedDayIso <= evt.endDate,
      );
    }
    return sortedEvents;
  }, [viewMode, selectedDayIso, sortedEvents]);

  const handlePrevMonth = () => {
    setSelectedDayIso(null);
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDayIso(null);
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const openCreateModal = () => {
    const defaultDate = new Date().toISOString().slice(0, 10);
    setEditingEvent(null);
    setTitle('');
    setEventType(TAXONOMY.eventTypes[0]);
    setStartDate(defaultDate);
    setEndDate(defaultDate);
    setTimeRange('09:00 – 17:00');
    setLocationOrLink('Main Dhamma Hall');
    setTeacher('Group Sayadaw & Practice Leaders');
    setStatus(TAXONOMY.eventStatuses[0]);
    setDescription('');
    setLinkedFormTabId(formTabs[0]?.id || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (evt: GroupEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setEventType(evt.eventType);
    setStartDate(evt.startDate);
    setEndDate(evt.endDate);
    setTimeRange(evt.timeRange);
    setLocationOrLink(evt.locationOrLink);
    setTeacher(evt.teacher);
    setStatus(evt.status);
    setDescription(evt.description);
    setLinkedFormTabId(evt.linkedFormTabId || formTabs[0]?.id || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      setFormError('Please provide an event title and start date.');
      return;
    }
    const resolvedEnd = endDate && endDate >= startDate ? endDate : startDate;

    const newEvent: GroupEvent = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      title: title.trim(),
      eventType,
      startDate,
      endDate: resolvedEnd,
      timeRange: timeRange.trim() || 'Schedule to be announced',
      locationOrLink: locationOrLink.trim() || 'Group Meditation Center',
      teacher: teacher.trim() || 'Senior Sayadaw',
      status,
      description: description.trim() || 'Group meditation course and Dhamma study gathering.',
      linkedFormTabId: linkedFormTabId || undefined,
      isUserCreated: true,
    };

    onSaveEvent(newEvent, Boolean(editingEvent));
    setIsModalOpen(false);
  };

  const handleDownloadIcs = (evt: GroupEvent) => {
    triggerFileDownload(`${evt.id}.ics`, eventToIcs(evt), 'text/calendar;charset=utf-8');
  };

  return (
    <section id="events-section" className={THEME_CLASSES.band}>
      <div className={THEME_CLASSES.sectionContainer}>
        <SectionHeader
          kicker="04. Courses & Calendar"
          title="Meditation Courses & Group Calendar Events"
          description={`Retreats, weekly group sittings, and Sayadaw seminars organized by our ${SITE_CONFIG.brandTitle} community.`}
          actions={
            <>
              <div
                role="group"
                aria-label="Events view mode"
                className={`flex items-center border ${THEME_CLASSES.borderStrong}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    setSelectedDayIso(null);
                  }}
                  className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                      : THEME_CLASSES.inkMuted
                  }`}
                >
                  <List className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Schedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 text-xs font-medium cursor-pointer transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                      : THEME_CLASSES.inkMuted
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Calendar</span>
                </button>
              </div>

              {isOwner && (
                <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnPrimary}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add Course / Event</span>
                </button>
              )}
            </>
          }
        />

        {/* Event Type Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter events by type"
          className={`flex items-center gap-1.5 overflow-x-auto py-5 border-b ${THEME_CLASSES.borderHairline}`}
        >
          {EVENT_FILTER_TYPES.map((t) => {
            const active = selectedType === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedType(t)}
                className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                    : 'bg-[var(--surface-canvas)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                }`}
              >
                {t === 'All' ? 'All Events' : t}
              </button>
            );
          })}
        </div>

        {/* Calendar Month Grid */}
        {viewMode === 'calendar' && (
          <div className="pt-8 pb-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                {TAXONOMY.monthNames[calMonth]} {calYear}
              </h3>
              <div className="flex items-center gap-2">
                {selectedDayIso && (
                  <button
                    type="button"
                    onClick={() => setSelectedDayIso(null)}
                    className={`min-h-[36px] px-3 text-xs ${THEME_CLASSES.accentInk} underline cursor-pointer`}
                  >
                    Show All Dates
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} hover:border-[var(--accent-ink)] cursor-pointer`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-7 border-t border-l ${THEME_CLASSES.borderStrong}`}>
              {TAXONOMY.weekdays.map((wd) => (
                <div
                  key={wd}
                  className={`py-2 px-2 text-center text-[11px] uppercase tracking-wider ${THEME_CLASSES.inkSubtle} bg-[var(--surface-canvas)] border-r border-b ${THEME_CLASSES.borderStrong}`}
                >
                  {wd}
                </div>
              ))}

              {calendarDays.map((cell, idx) => {
                if (!cell.iso || cell.dayNum === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className={`min-h-[76px] sm:min-h-[92px] bg-[var(--surface-elevated)]/40 border-r border-b ${THEME_CLASSES.borderStrong}`}
                    />
                  );
                }

                const isSelected = selectedDayIso === cell.iso;
                const hasEvents = cell.dayEvents.length > 0;
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setSelectedDayIso(isSelected ? null : cell.iso)}
                    className={`min-h-[76px] sm:min-h-[92px] p-2 text-left flex flex-col justify-between border-r border-b ${THEME_CLASSES.borderStrong} transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-primary)]/15'
                        : hasEvents
                          ? 'bg-[var(--surface-canvas)] hover:bg-[var(--surface-elevated)]/70'
                          : 'bg-[var(--surface-canvas)]/60 hover:bg-[var(--surface-elevated)]/40'
                    }`}
                  >
                    <span
                      className={`font-mono-code text-xs tabular-nums ${
                        hasEvents
                          ? `font-semibold ${THEME_CLASSES.accentInk}`
                          : THEME_CLASSES.inkSubtle
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasEvents && (
                      <div className="space-y-0.5 w-full overflow-hidden">
                        {cell.dayEvents.slice(0, 2).map((evt) => (
                          <p
                            key={evt.id}
                            className={`text-[11px] leading-tight font-medium ${THEME_CLASSES.inkPrimary} truncate`}
                          >
                            {evt.title}
                          </p>
                        ))}
                        {cell.dayEvents.length > 2 && (
                          <p className={`text-[10px] ${THEME_CLASSES.inkSubtle} tabular-nums`}>
                            +{cell.dayEvents.length - 2} more
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Schedule / Filtered Day Event List */}
        {displayedEvents.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className={`font-display text-2xl font-medium ${THEME_CLASSES.inkPrimary}`}>
              {selectedDayIso
                ? `No scheduled events on ${selectedDayIso}`
                : 'No group courses or events yet'}
            </p>
            <div className="flex justify-center gap-3">
              {selectedDayIso && (
                <button
                  type="button"
                  onClick={() => setSelectedDayIso(null)}
                  className={THEME_CLASSES.btnOutline}
                >
                  Show All Dates
                </button>
              )}
              {isOwner && (
                <button type="button" onClick={openCreateModal} className={THEME_CLASSES.btnAccent}>
                  Add Course / Event
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`pt-4 ${THEME_CLASSES.divideHairline}`}>
            {displayedEvents.map((evt) => (
              <article
                key={evt.id}
                className="py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-3 space-y-1">
                  <p className={`font-mono-code text-xs ${THEME_CLASSES.accentInk} tabular-nums`}>
                    {formatDateRange(evt.startDate, evt.endDate)}
                  </p>
                  <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>{evt.timeRange}</p>
                  <p className={`text-xs font-medium ${THEME_CLASSES.inkBody} pt-1`}>
                    {evt.eventType} · {evt.status}
                  </p>
                </div>

                <div className="lg:col-span-6 space-y-2">
                  <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                    {evt.title}
                  </h3>
                  <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
                    {evt.teacher} · {evt.locationOrLink}
                  </p>
                  <p className={`text-sm leading-[1.7] ${THEME_CLASSES.inkSecondary} pt-1`}>
                    {evt.description}
                  </p>
                </div>

                <div className="lg:col-span-3 flex flex-wrap lg:flex-col items-start lg:items-end justify-between gap-3">
                  <div className="flex flex-wrap lg:justify-end gap-2">
                    {evt.linkedFormTabId && (
                      <button
                        type="button"
                        onClick={() => onRegisterWithForm(evt.linkedFormTabId!)}
                        className={THEME_CLASSES.btnPrimary}
                      >
                        Register via Form
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadIcs(evt)}
                      className={THEME_CLASSES.btnOutline}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Add to Calendar (.ics)</span>
                    </button>
                  </div>

                  {isOwner && (
                    <div className={`flex items-center gap-3 text-xs ${THEME_CLASSES.inkSubtle}`}>
                      <button
                        type="button"
                        onClick={() => openEditModal(evt)}
                        className="inline-flex items-center gap-1 hover:text-[var(--ink-primary)] cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>

                      <ConfirmDeleteAction
                        isConfirming={confirmDeleteId === evt.id}
                        onRequestConfirm={() => setConfirmDeleteId(evt.id)}
                        onConfirm={() => {
                          onDeleteEvent(evt.id);
                          setConfirmDeleteId(null);
                        }}
                        onCancel={() => setConfirmDeleteId(null)}
                        ariaLabel={`Delete ${evt.title}`}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isOwner && (
        <EditorModal
          isOpen={isModalOpen}
          headingId="event-modal-heading"
          kicker="Group Meditation Schedule"
          title={editingEvent ? 'Edit Course / Event' : 'Add Course or Calendar Event'}
          error={formError}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmitEvent} className="space-y-4">
            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Course / Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 3-Day Weekend Satipaṭṭhāna Retreat"
                className={THEME_CLASSES.input}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className={THEME_CLASSES.input}
                >
                  {TAXONOMY.eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Registration Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className={THEME_CLASSES.input}
                >
                  {TAXONOMY.eventStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={THEME_CLASSES.inputMono}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={THEME_CLASSES.inputMono}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Daily Hours</label>
                <input
                  type="text"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  placeholder="e.g., 08:30 – 17:00"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Teacher / Sayadaw</label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="e.g., Ven. Dr. Nandamālābhivaṃsa"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Location or Online Link</label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  placeholder="e.g., Main Dhamma Hall & Zoom"
                  className={THEME_CLASSES.input}
                />
              </div>

              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Linked Registration Form Tab</label>
                <select
                  value={linkedFormTabId}
                  onChange={(e) => setLinkedFormTabId(e.target.value)}
                  className={THEME_CLASSES.input}
                >
                  <option value="">None</option>
                  {formTabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Course Details &amp; Guidelines</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe prerequisites, precepts, meal arrangements, or study materials..."
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
                {editingEvent ? 'Update Event' : 'Save Event'}
              </button>
            </div>
          </form>
        </EditorModal>
      )}
    </section>
  );
}
