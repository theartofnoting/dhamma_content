import { GroupEvent } from '../types/dhamma';

export interface CalendarCell {
  isoDate: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  events: GroupEvent[];
}

export function formatIsoDate(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function formatDateRange(start: string, end: string): string {
  return start === end ? start : `${start} – ${end}`;
}

export function doesEventCoverDate(event: GroupEvent, isoDate: string): boolean {
  return isoDate >= event.startDate && isoDate <= event.endDate;
}

export function buildMonthGrid(
  year: number,
  monthIndex: number,
  events: GroupEvent[],
): CalendarCell[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const isoDate = formatIsoDate(prevYear, prevMonth, day);
    cells.push({
      isoDate,
      dayOfMonth: day,
      isCurrentMonth: false,
      events: events.filter((evt) => doesEventCoverDate(evt, isoDate)),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isoDate = formatIsoDate(year, monthIndex, day);
    cells.push({
      isoDate,
      dayOfMonth: day,
      isCurrentMonth: true,
      events: events.filter((evt) => doesEventCoverDate(evt, isoDate)),
    });
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  for (let day = 1; day <= remaining; day++) {
    const isoDate = formatIsoDate(nextYear, nextMonth, day);
    cells.push({
      isoDate,
      dayOfMonth: day,
      isCurrentMonth: false,
      events: events.filter((evt) => doesEventCoverDate(evt, isoDate)),
    });
  }

  return cells;
}
