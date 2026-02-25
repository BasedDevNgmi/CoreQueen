import { t, getLocaleForIntl } from '@/lib/i18n'

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

/** Monday = 1, Tuesday = 2, ... Sunday = 7 (ISO weekday). */
export function getISOWeekday(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 7 : d
}

/** Start of week (Monday 00:00:00) for the given date. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const wd = getISOWeekday(d)
  d.setDate(d.getDate() - (wd - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

/** Add n weeks to a date (returns new Date). */
export function addWeeks(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n * 7)
  return d
}

/** Add n days to a date (returns new Date). */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

/** Add n months to a date (returns new Date). */
export function addMonths(date: Date, n: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

/** First day of month at 00:00:00. */
export function getMonthStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Grid for month view: 6 rows × 7 days. Empty cells are null (padding). */
export function getMonthGrid(monthStart: Date): (CalendarDay | null)[] {
  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()
  const first = new Date(year, month, 1)
  const startWeekday = getISOWeekday(first)
  const startOffset = startWeekday - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid: (CalendarDay | null)[] = []
  for (let i = 0; i < 42; i++) {
    const dayIndex = i - startOffset
    if (dayIndex < 1 || dayIndex > daysInMonth) {
      grid.push(null)
      continue
    }
    const date = new Date(year, month, dayIndex)
    const weekday = getISOWeekday(date)
    grid.push({
      date,
      dayLabel: t(`calendar.${DAY_KEYS[weekday - 1]}`),
      weekday,
      isWorkoutDay: weekday === 1 || weekday === 3 || weekday === 5,
    })
  }
  return grid
}

/** Format single day for day view header, e.g. "Mon 9 Mar 2026". */
export function formatDayHeader(date: Date): string {
  const loc = getLocaleForIntl()
  return date.toLocaleDateString(loc, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Format month for month view nav, e.g. "March 2026". */
export function formatMonthTitle(monthStart: Date): string {
  const loc = getLocaleForIntl()
  return monthStart.toLocaleDateString(loc, { month: 'long', year: 'numeric' })
}

export interface CalendarDay {
  date: Date
  dayLabel: string
  weekday: number
  isWorkoutDay: boolean
}

/** Build a CalendarDay for a single date. */
export function getCalendarDay(date: Date): CalendarDay {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const weekday = getISOWeekday(d)
  return {
    date: d,
    dayLabel: t(`calendar.${DAY_KEYS[weekday - 1]}`),
    weekday,
    isWorkoutDay: weekday === 1 || weekday === 3 || weekday === 5,
  }
}

/** Monday = 1, Wednesday = 3, Friday = 5 are workout days. */
export function getWeekDays(weekStart: Date): CalendarDay[] {
  const days: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const weekday = getISOWeekday(date)
    days.push({
      date,
      dayLabel: t(`calendar.${DAY_KEYS[i]}`),
      weekday,
      isWorkoutDay: weekday === 1 || weekday === 3 || weekday === 5,
    })
  }
  return days
}

function formatDateRange(weekStart: Date, daysToAdd: number): string {
  const end = new Date(weekStart)
  end.setDate(weekStart.getDate() + daysToAdd)
  const loc = getLocaleForIntl()
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${weekStart.toLocaleDateString(loc, { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString(loc, opts)}`
}

/** Format for week nav header, e.g. "15 – 21 Feb 2026". */
export function formatWeekRange(weekStart: Date): string {
  return formatDateRange(weekStart, 6)
}

/** Format for two-week range. */
export function formatTwoWeekRange(weekStart: Date): string {
  return formatDateRange(weekStart, 13)
}

/** YYYY-MM-DD in local timezone for comparing with log dates. */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
