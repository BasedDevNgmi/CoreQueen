import { getWeekStart, toDateString } from '@/lib/calendar'
import type { LogRow } from '@/types/log'

export function computeStreakAndMonth(logs: LogRow[]): {
  workoutsThisMonth: number
  currentStreakWeeks: number
} {
  const now = new Date()
  const thisMonth = now.getFullYear() * 12 + now.getMonth()
  let workoutsThisMonth = 0
  const weekDates = new Set<string>()
  for (const log of logs) {
    const createdAt = log.created_at ? new Date(log.created_at) : null
    if (!createdAt) continue
    if (createdAt.getFullYear() * 12 + createdAt.getMonth() === thisMonth) {
      workoutsThisMonth++
    }
    const weekStart = getWeekStart(createdAt)
    weekDates.add(toDateString(weekStart))
  }

  let currentStreakWeeks = 0
  const check = new Date(now)
  const thisWeekStart = getWeekStart(check)
  const weekStart = new Date(thisWeekStart)
  while (true) {
    const key = toDateString(weekStart)
    if (weekDates.has(key)) {
      currentStreakWeeks++
      weekStart.setDate(weekStart.getDate() - 7)
    } else {
      break
    }
  }
  return { workoutsThisMonth, currentStreakWeeks }
}
