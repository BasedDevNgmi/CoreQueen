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

export interface CalendarDay {
  date: Date
  dayLabel: string
  weekday: number
  isWorkoutDay: boolean
}

const DAY_LABELS = ['MA', 'DI', 'WO', 'DO', 'VR', 'ZA', 'ZO']

/** Monday = 1, Wednesday = 3, Friday = 5 are workout days. */
export function getWeekDays(weekStart: Date): CalendarDay[] {
  const days: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const weekday = getISOWeekday(date)
    days.push({
      date,
      dayLabel: DAY_LABELS[i] ?? '',
      weekday,
      isWorkoutDay: weekday === 1 || weekday === 3 || weekday === 5,
    })
  }
  return days
}

/** Format for week nav header, e.g. "15 – 21 Feb 2026". */
export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart)
  end.setDate(weekStart.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${weekStart.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('nl-NL', opts)}`
}

/** YYYY-MM-DD in local timezone for comparing with log dates. */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
