import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, List, Pencil, Plus } from 'lucide-react';
import { SECTION_IDS, TAXONOMY } from '../config/siteConfig';
import { eventToIcs } from '../content/exporters';
import { LocaleDictionary } from '../i18n';
import { ConfirmDeleteAction } from '../theme/components/ConfirmDeleteAction';
import { EditorModal } from '../theme/components/EditorModal';
import { SectionHeader } from '../theme/components/SectionHeader';
import { THEME_CLASSES } from '../theme/uiClasses';
import { buildMonthGrid, formatDateRange } from '../tools/calendarHelpers';
import { triggerFileDownload } from '../tools/fileTools';
import { EventStatus, EventType, GoogleFormTab, GroupEvent } from '../types/dhamma';

interface EventsCalendarSectionProps {
  dict: LocaleDictionary;
  events: GroupEvent[];
  formTabs: GoogleFormTab[];
  isOwner: boolean;
  onSaveEvent: (event: GroupEvent, isEdit: boolean) => void;
  onDeleteEvent: (id: string) => void;
  onRegisterWithForm: (formTabId: string) => void;
}

const EVENT_FILTER_TYPES: (EventType | 'All')[] = ['All', ...TAXONOMY.eventTypes];

export function EventsCalendarSection({
  dict,
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

  const now = new Date();
  const [cursorYear, setCursorYear] = useState(now.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(now.getMonth());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>(TAXONOMY.eventTypes[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [teacher, setTeacher] = useState('');
  const [status, setStatus] = useState<EventStatus>(TAXONOMY.eventStatuses[0]);
  const [description, setDescription] = useState('');
  const [linkedFormTabId, setLinkedFormTabId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const base =
      selectedType === 'All' ? events : events.filter((e) => e.eventType === selectedType);
    return [...base].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, selectedType]);

  const calendarCells = useMemo(
    () => buildMonthGrid(cursorYear, cursorMonth, filteredEvents),
    [cursorYear, cursorMonth, filteredEvents],
  );

  const shiftMonth = (delta: number) => {
    const next = new Date(cursorYear, cursorMonth + delta, 1);
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
  };

  const openCreate = () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    setEditingEvent(null);
    setTitle('');
    setEventType(TAXONOMY.eventTypes[0]);
    setStartDate(todayIso);
    setEndDate(todayIso);
    setTimeRange('09:00 – 17:00');
    setLocationOrLink('');
    setTeacher('');
    setStatus(TAXONOMY.eventStatuses[0]);
    setDescription('');
    setLinkedFormTabId(formTabs[0]?.id || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEdit = (evt: GroupEvent) => {
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
    setLinkedFormTabId(evt.linkedFormTabId || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      setFormError('Title and start date are required.');
      return;
    }

    const payload: GroupEvent = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      title: title.trim(),
      eventType,
      startDate,
      endDate: endDate && endDate >= startDate ? endDate : startDate,
      timeRange: timeRange.trim() || 'TBA',
      locationOrLink: locationOrLink.trim() || 'Vipassana Bhavana Sanctuary',
      teacher: teacher.trim() || 'Sayadaw & Practice Facilitators',
      status,
      description: description.trim(),
      linkedFormTabId: linkedFormTabId || undefined,
      isUserCreated: true,
    };

    onSaveEvent(payload, Boolean(editingEvent));
    setIsModalOpen(false);
  };

  return (
    <section id={SECTION_IDS.events} className={THEME_CLASSES.band}>
      <div className={THEME_CLASSES.sectionContainer}>
        <SectionHeader
          kicker={dict.events.kicker}
          title={dict.events.title}
          description={dict.events.description}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex items-center border ${THEME_CLASSES.borderStrong}`}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs font-medium cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                      : `${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)]`
                  }`}
                >
                  <List className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{dict.events.listView}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 text-xs font-medium cursor-pointer ${
                    viewMode === 'calendar'
                      ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)]'
                      : `${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)]`
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{dict.events.calendarView}</span>
                </button>
              </div>
              {isOwner && (
                <button type="button" onClick={openCreate} className={THEME_CLASSES.btnAccent}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{dict.events.addEvent}</span>
                </button>
              )}
            </div>
          }
        />

        <div className="py-5 flex flex-wrap items-center gap-2">
          {EVENT_FILTER_TYPES.map((type) => {
            const isActive = selectedType === type;
            const label =
              type === 'All' ? dict.events.allTypes : dict.taxonomyLabels.eventTypes[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--ink-primary)] text-[var(--surface-canvas)] border-[var(--ink-primary)]'
                    : `${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkSecondary} hover:border-[var(--accent-ink)]`
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {viewMode === 'calendar' ? (
          <div className={`border ${THEME_CLASSES.borderHairline} bg-[var(--surface-canvas)]`}>
            <div
              className={`flex items-center justify-between px-4 py-3 border-b ${THEME_CLASSES.borderHairline}`}
            >
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} cursor-pointer`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className={`font-display text-xl font-semibold ${THEME_CLASSES.inkPrimary} tabular-nums`}>
                {dict.events.monthNames[cursorMonth]} {cursorYear}
              </p>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Next month"
                className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkPrimary} cursor-pointer`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className={`grid grid-cols-7 border-b ${THEME_CLASSES.borderHairline}`}>
              {dict.events.weekdays.map((wd) => (
                <div
                  key={wd}
                  className={`py-2 text-center text-xs font-medium ${THEME_CLASSES.inkSubtle}`}
                >
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarCells.map((cell) => (
                <div
                  key={cell.isoDate}
                  className={`min-h-[96px] p-2 border-b border-r ${THEME_CLASSES.borderHairline} space-y-1 ${
                    cell.isCurrentMonth ? '' : 'opacity-45 bg-[var(--surface-band)]'
                  }`}
                >
                  <span className={`font-mono-code text-xs ${THEME_CLASSES.inkSubtle} tabular-nums`}>
                    {cell.dayOfMonth}
                  </span>
                  {cell.events.slice(0, 2).map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`block w-full text-left truncate text-[11px] font-medium px-1.5 py-0.5 bg-[var(--surface-muted)] ${THEME_CLASSES.accentInk} hover:underline cursor-pointer`}
                    >
                      {evt.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <p
            className={`py-12 text-center text-sm ${THEME_CLASSES.inkMuted} border-t ${THEME_CLASSES.borderHairline}`}
          >
            {dict.events.emptyText}
          </p>
        ) : (
          <div className={THEME_CLASSES.divideHairline}>
            {filteredEvents.map((evt) => {
              const isLink = /^https?:\/\//i.test(evt.locationOrLink);
              return (
                <article
                  key={evt.id}
                  className="py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  <div className="lg:col-span-3 space-y-1">
                    <p className={`font-mono-code text-xs ${THEME_CLASSES.accentInk} tabular-nums`}>
                      {formatDateRange(evt.startDate, evt.endDate)}
                    </p>
                    <p className={`text-xs ${THEME_CLASSES.inkMuted} tabular-nums`}>
                      {evt.timeRange}
                    </p>
                    <p className={`text-xs font-medium ${THEME_CLASSES.inkSecondary}`}>
                      {dict.taxonomyLabels.eventTypes[evt.eventType]} ·{' '}
                      {dict.taxonomyLabels.eventStatuses[evt.status]}
                    </p>
                  </div>

                  <div className="lg:col-span-6 space-y-2">
                    <h3 className={`font-display text-2xl font-semibold ${THEME_CLASSES.inkPrimary}`}>
                      {evt.title}
                    </h3>
                    <p className={`text-xs ${THEME_CLASSES.inkMuted}`}>
                      {evt.teacher} ·{' '}
                      {isLink ? (
                        <a
                          href={evt.locationOrLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${THEME_CLASSES.accentInk} underline`}
                        >
                          {evt.locationOrLink}
                        </a>
                      ) : (
                        evt.locationOrLink
                      )}
                    </p>
                    {evt.description && (
                      <p className={`text-sm leading-relaxed ${THEME_CLASSES.inkSecondary}`}>
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-3 flex flex-wrap lg:justify-end items-center gap-2">
                    {evt.linkedFormTabId && (
                      <button
                        type="button"
                        onClick={() => onRegisterWithForm(evt.linkedFormTabId!)}
                        className={THEME_CLASSES.btnPrimary}
                      >
                        {dict.events.registerBtn}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        triggerFileDownload(
                          `${evt.id}.ics`,
                          eventToIcs(evt),
                          'text/calendar;charset=utf-8',
                        )
                      }
                      className={THEME_CLASSES.btnOutline}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{dict.events.downloadIcs}</span>
                    </button>

                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(evt)}
                          className={`inline-flex items-center gap-1 min-h-[36px] px-2.5 text-xs border ${THEME_CLASSES.borderStrong} ${THEME_CLASSES.inkMuted} hover:text-[var(--ink-primary)] cursor-pointer`}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{dict.sayadaws.edit}</span>
                        </button>
                        <ConfirmDeleteAction
                          isConfirming={confirmDeleteId === evt.id}
                          onRequestConfirm={() => setConfirmDeleteId(evt.id)}
                          onConfirm={() => {
                            onDeleteEvent(evt.id);
                            setConfirmDeleteId(null);
                          }}
                          onCancel={() => setConfirmDeleteId(null)}
                          confirmLabel={dict.catalog.confirmDelete}
                          cancelLabel={dict.sayadaws.cancelBtn}
                          variant="icon"
                        />
                      </div>
                    )}
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
          headingId="event-modal-heading"
          kicker="Community Schedule"
          title={editingEvent ? 'Edit Event' : 'Add Event'}
          error={formError}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className={THEME_CLASSES.label}>Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className={THEME_CLASSES.input}
                >
                  {TAXONOMY.eventTypes.map((et) => (
                    <option key={et} value={et}>
                      {et}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Status</label>
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
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Time Range</label>
                <input
                  type="text"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="space-y-1.5">
                <label className={THEME_CLASSES.label}>Teacher / Facilitator</label>
                <input
                  type="text"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className={THEME_CLASSES.label}>Location or Zoom Link</label>
                <input
                  type="text"
                  value={locationOrLink}
                  onChange={(e) => setLocationOrLink(e.target.value)}
                  className={THEME_CLASSES.input}
                />
              </div>
              {formTabs.length > 0 && (
                <div className="sm:col-span-2 space-y-1.5">
                  <label className={THEME_CLASSES.label}>Linked Registration Form</label>
                  <select
                    value={linkedFormTabId}
                    onChange={(e) => setLinkedFormTabId(e.target.value)}
                    className={THEME_CLASSES.input}
                  >
                    <option value="">None</option>
                    {formTabs.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className={THEME_CLASSES.label}>Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={THEME_CLASSES.textarea}
              />
            </div>

            <div className={`pt-4 border-t ${THEME_CLASSES.borderHairline} flex justify-end gap-3`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={THEME_CLASSES.btnSecondary}
              >
                {dict.sayadaws.cancelBtn}
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
