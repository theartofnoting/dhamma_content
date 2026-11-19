import { useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  List,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { EventStatus, EventType, GoogleFormTab, GroupEvent } from '../types/dhamma';
import { eventToIcs, triggerFileDownload } from '../utils/storageAndExport';

interface EventsCalendarSectionProps {
  events: GroupEvent[];
  formTabs: GoogleFormTab[];
  onSaveEvent: (event: GroupEvent, isEdit: boolean) => void;
  onDeleteEvent: (id: string) => void;
  onRegisterWithForm: (formTabId: string) => void;
}

const EVENT_TYPES: (EventType | 'All')[] = [
  'All',
  'Retreat Course',
  'Group Sitting',
  'Dhamma Talk',
  'Study Circle',
];

const EVENT_STATUSES: EventStatus[] = [
  'Registration Open',
  'Drop-In Welcome',
  'Waitlist',
  'Completed',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateRange(start: string, end: string): string {
  if (start === end) return start;
  return `${start} – ${end}`;
}

export function EventsCalendarSection({
  events,
  formTabs,
  onSaveEvent,
  onDeleteEvent,
  onRegisterWithForm,
}: EventsCalendarSectionProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedType, setSelectedType] = useState<EventType | 'All'>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Calendar Month State (defaults to current system month, Nov 2026)
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(10); // 0-indexed: 10 = November
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('Retreat Course');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('2026-12-01');
  const [timeRange, setTimeRange] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [teacher, setTeacher] = useState('');
  const [status, setStatus] = useState<EventStatus>('Registration Open');
  const [description, setDescription] = useState('');
  const [linkedFormTabId, setLinkedFormTabId] = useState(formTabs[0]?.id || '');
  const [formError, setFormError] = useState<string | null>(null);

  const sortedEvents = useMemo(() => {
    const base =
      selectedType === 'All' ? events : events.filter((e) => e.eventType === selectedType);
    return [...base].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, selectedType]);

  // Calendar Grid cells for (calYear, calMonth)
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
    setEditingEvent(null);
    setTitle('');
    setEventType('Retreat Course');
    setStartDate('2026-12-06');
    setEndDate('2026-12-06');
    setTimeRange('09:00 – 17:00');
    setLocationOrLink('Main Dhamma Hall');
    setTeacher('Group Sayadaw & Practice Leaders');
    setStatus('Registration Open');
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
    const ics = eventToIcs(evt);
    triggerFileDownload(`${evt.id}.ics`, ics, 'text/calendar;charset=utf-8');
  };

  return (
    <section
      id="events-section"
      className="border-t border-[#E5DFD3] dark:border-[#342E28] bg-[#F4EFE6]/45 dark:bg-[#1E1A16]"
    >
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5DFD3] dark:border-[#342E28]">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs tracking-widest uppercase text-[#78716C] dark:text-[#A8A29E]">
              04. Courses &amp; Calendar
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F5F4] text-balance">
              Meditation Courses &amp; Group Calendar Events
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-[#57534E] dark:text-[#A8A29E]">
              Retreats, weekly group sittings, and Sayadaw seminars organized by our Vipassana
              Bhavana community.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Events view mode"
              className="flex items-center border border-[#D6CEBE] dark:border-[#44403C]"
            >
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setSelectedDayIso(null);
                }}
                className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                    : 'text-[#57534E] dark:text-[#A8A29E]'
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
                    ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                    : 'text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Calendar</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Course / Event</span>
            </button>
          </div>
        </div>

        {/* Event Type Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter events by type"
          className="flex items-center gap-1.5 overflow-x-auto py-5 border-b border-[#E5DFD3] dark:border-[#342E28]"
        >
          {EVENT_TYPES.map((t) => {
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
                    ? 'bg-[#1C1917] text-[#FBF9F5] dark:bg-[#F5F5F4] dark:text-[#1C1917]'
                    : 'bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917] dark:bg-[#25211D] dark:text-[#A8A29E] dark:hover:text-[#F5F5F4]'
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
              <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                {MONTH_NAMES[calMonth]} {calYear}
              </h3>
              <div className="flex items-center gap-2">
                {selectedDayIso && (
                  <button
                    type="button"
                    onClick={() => setSelectedDayIso(null)}
                    className="min-h-[36px] px-3 text-xs text-[#9A3412] dark:text-[#FDBA74] underline cursor-pointer"
                  >
                    Show All Dates
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-t border-l border-[#D6CEBE] dark:border-[#342E28]">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="py-2 px-2 text-center text-[11px] uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E] bg-[#FBF9F5] dark:bg-[#181512] border-r border-b border-[#D6CEBE] dark:border-[#342E28]"
                >
                  {wd}
                </div>
              ))}

              {calendarDays.map((cell, idx) => {
                if (!cell.iso || cell.dayNum === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[76px] sm:min-h-[92px] bg-[#EFEAE0]/35 dark:bg-[#181512]/50 border-r border-b border-[#D6CEBE] dark:border-[#342E28]"
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
                    className={`min-h-[76px] sm:min-h-[92px] p-2 text-left flex flex-col justify-between border-r border-b border-[#D6CEBE] dark:border-[#342E28] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#9A3412]/10 dark:bg-[#B45309]/20'
                        : hasEvents
                          ? 'bg-[#FBF9F5] dark:bg-[#221E1A] hover:bg-[#EFEAE0]/70'
                          : 'bg-[#FBF9F5]/60 dark:bg-[#1B1815] hover:bg-[#EFEAE0]/40'
                    }`}
                  >
                    <span
                      className={`font-mono-code text-xs tabular-nums ${
                        hasEvents
                          ? 'font-semibold text-[#9A3412] dark:text-[#FDBA74]'
                          : 'text-[#78716C] dark:text-[#A8A29E]'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasEvents && (
                      <div className="space-y-0.5 w-full overflow-hidden">
                        {cell.dayEvents.slice(0, 2).map((evt) => (
                          <p
                            key={evt.id}
                            className="text-[11px] leading-tight font-medium text-[#1C1917] dark:text-[#F5F5F4] truncate"
                          >
                            {evt.title}
                          </p>
                        ))}
                        {cell.dayEvents.length > 2 && (
                          <p className="text-[10px] text-[#78716C] tabular-nums">
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
            <p className="font-display text-2xl font-medium text-[#1C1917] dark:text-[#F5F5F4]">
              {selectedDayIso
                ? `No scheduled events on ${selectedDayIso}`
                : 'No group courses or events match this filter'}
            </p>
            <div className="flex justify-center gap-3">
              {selectedDayIso && (
                <button
                  type="button"
                  onClick={() => setSelectedDayIso(null)}
                  className="min-h-[40px] px-4 py-2 text-xs border border-[#D6CEBE] dark:border-[#44403C] cursor-pointer"
                >
                  Show All Dates
                </button>
              )}
              <button
                type="button"
                onClick={openCreateModal}
                className="min-h-[40px] px-4 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] cursor-pointer"
              >
                Add Course / Event
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 divide-y divide-[#E5DFD3] dark:divide-[#342E28]">
            {displayedEvents.map((evt) => (
              <article
                key={evt.id}
                className="py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-3 space-y-1">
                  <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74] tabular-nums">
                    {formatDateRange(evt.startDate, evt.endDate)}
                  </p>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">{evt.timeRange}</p>
                  <p className="text-xs font-medium text-[#292524] dark:text-[#E7E5E4] pt-1">
                    {evt.eventType} · {evt.status}
                  </p>
                </div>

                <div className="lg:col-span-6 space-y-2">
                  <h3 className="font-display text-2xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    {evt.teacher} · {evt.locationOrLink}
                  </p>
                  <p className="text-sm leading-[1.7] text-[#44403C] dark:text-[#D6D3D1] pt-1">
                    {evt.description}
                  </p>
                </div>

                <div className="lg:col-span-3 flex flex-wrap lg:flex-col items-start lg:items-end justify-between gap-3">
                  <div className="flex flex-wrap lg:justify-end gap-2">
                    {evt.linkedFormTabId && (
                      <button
                        type="button"
                        onClick={() => onRegisterWithForm(evt.linkedFormTabId!)}
                        className="min-h-[40px] px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#FBF9F5] hover:bg-[#9A3412] dark:bg-[#F5F5F4] dark:text-[#1C1917] dark:hover:bg-[#FDBA74] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Register via Form
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadIcs(evt)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#F5F5F4] hover:border-[#9A3412] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Add to Calendar (.ics)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#78716C] dark:text-[#A8A29E]">
                    <button
                      type="button"
                      onClick={() => openEditModal(evt)}
                      className="inline-flex items-center gap-1 hover:text-[#1C1917] dark:hover:text-[#F5F5F4] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>

                    {confirmDeleteId !== evt.id ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(evt.id)}
                        className="inline-flex items-center gap-1 hover:text-[#9A3412] dark:hover:text-[#FCA5A5] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteEvent(evt.id);
                            setConfirmDeleteId(null);
                          }}
                          className="text-[#9A3412] dark:text-[#FCA5A5] font-medium underline cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="cursor-pointer"
                        >
                          Cancel
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* In-app Course / Event Editor Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-[2px] p-4"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FBF9F5] dark:bg-[#181512] border border-[#D6CEBE] dark:border-[#342E28] p-6 sm:p-8 shadow-xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5DFD3] dark:border-[#342E28]">
              <div>
                <p className="font-mono-code text-xs text-[#9A3412] dark:text-[#FDBA74]">
                  Group Meditation Schedule
                </p>
                <h3
                  id="event-modal-heading"
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F5F4]"
                >
                  {editingEvent ? 'Edit Course / Event' : 'Add Course or Calendar Event'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#57534E] hover:text-[#1C1917] dark:text-[#A8A29E] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="pt-5 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="p-3 border border-[#9A3412]/50 bg-[#9A3412]/5 text-xs text-[#9A3412] dark:text-[#FCA5A5]"
                >
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Course / Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 3-Day Weekend Satipaṭṭhāna Retreat"
                  className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  >
                    {EVENT_TYPES.filter((t): t is EventType => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Registration Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  >
                    {EVENT_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono-code bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm font-mono-code bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Daily Hours
                  </label>
                  <input
                    type="text"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    placeholder="e.g., 08:30 – 17:00"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Teacher / Sayadaw
                  </label>
                  <input
                    type="text"
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    placeholder="e.g., Ven. Dr. Nandamālābhivaṃsa"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Location or Online Link
                  </label>
                  <input
                    type="text"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    placeholder="e.g., Main Dhamma Hall & Zoom"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                    Linked Registration Form Tab
                  </label>
                  <select
                    value={linkedFormTabId}
                    onChange={(e) => setLinkedFormTabId(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
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
                <label className="block text-xs font-medium text-[#44403C] dark:text-[#D6D3D1]">
                  Course Details &amp; Guidelines
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe prerequisites, precepts, meal arrangements, or study materials..."
                  className="w-full px-3 py-2 text-sm leading-relaxed bg-[#F4EFE6]/60 dark:bg-[#221E1A] text-[#1C1917] dark:text-[#F5F5F4] border border-[#D6CEBE] dark:border-[#3F3832] focus:outline-none focus:border-[#9A3412]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5DFD3] dark:border-[#342E28] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[42px] px-4 py-2 text-xs font-medium border border-[#D6CEBE] dark:border-[#44403C] text-[#44403C] dark:text-[#D6D3D1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 py-2 text-xs font-medium bg-[#9A3412] text-[#FBF9F5] hover:bg-[#7C2D12] cursor-pointer"
                >
                  {editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
