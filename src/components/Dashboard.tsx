import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Dumbbell, History, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getWeekStart,
  getWeekDays,
  addWeeks,
  addDays,
  addMonths,
  getMonthStart,
  getMonthGrid,
  getCalendarDay,
  formatWeekRange,
  formatDayHeader,
  formatMonthTitle,
  toDateString,
  type CalendarDay,
} from '@/lib/calendar'
import { useLogs } from '@/hooks/useLogs'
import { computeStreakAndMonth } from '@/lib/stats'
import { getReminderTime } from '@/lib/settings'
import { useTranslation } from '@/lib/i18n'
import type { WorkoutDay } from '@/data/workouts'

const REMINDER_DISMISSED_KEY = 'corequeen_reminder_dismissed'

function isWorkoutDayToday(): boolean {
  const d = new Date()
  const wd = d.getDay()
  const iso = wd === 0 ? 7 : wd
  return iso === 1 || iso === 3 || iso === 5
}

function shouldShowReminder(): boolean {
  const reminder = getReminderTime()
  if (!reminder) return false
  if (!isWorkoutDayToday()) return false
  const today = toDateString(new Date())
  try {
    if (localStorage.getItem(`${REMINDER_DISMISSED_KEY}_${today}`) === 'true') return false
  } catch {
    return false
  }
  const [h, m] = reminder.split(':').map(Number)
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const reminderMins = h * 60 + m
  return nowMins >= reminderMins
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

/** Map ISO weekday (1=Mon, 3=Wed, 5=Fri) to schedule index. */
function getScheduleIndexForWeekday(weekday: number): number | null {
  if (weekday === 1) return 0
  if (weekday === 3) return 1
  if (weekday === 5) return 2
  return null
}

interface DashboardProps {
  schedule: WorkoutDay[]
  onSelectDay: (day: WorkoutDay) => void
  onOpenHistory?: () => void
  onOpenTour?: () => void
  onOpenSettings?: () => void
}

export type CalendarViewMode = 'day' | 'week' | 'month'

export function Dashboard({ schedule, onSelectDay, onOpenHistory, onOpenTour, onOpenSettings }: DashboardProps) {
  const { t, locale } = useTranslation()
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('week')
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [focusedDate, setFocusedDate] = useState(() => new Date())
  const [monthStart, setMonthStart] = useState(() => getMonthStart(new Date()))
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<{ workoutsThisMonth: number; currentStreakWeeks: number } | null>(null)
  const [showReminder, setShowReminder] = useState(false)
  const { fetchLogsForDateRange, fetchLogs, insertLog } = useLogs()

  useEffect(() => {
    setShowReminder(shouldShowReminder())
  }, [])

  useEffect(() => {
    let cancelled = false
    let start: Date
    let end: Date
    if (calendarView === 'day') {
      start = new Date(focusedDate)
      end = new Date(focusedDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    } else if (calendarView === 'month') {
      start = new Date(monthStart)
      end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
    } else {
      start = new Date(weekStart)
      end = addDays(weekStart, 6)
      end.setHours(23, 59, 59, 999)
    }
    fetchLogsForDateRange(start, end).then(({ completedDates: set }) => {
      if (!cancelled) setCompletedDates(set)
    })
    return () => {
      cancelled = true
    }
  }, [calendarView, weekStart, focusedDate, monthStart, fetchLogsForDateRange])

  useEffect(() => {
    let cancelled = false
    fetchLogs(100).then((logs) => {
      if (!cancelled) setStats(computeStreakAndMonth(logs))
    })
    return () => {
      cancelled = true
    }
  }, [fetchLogs])

  const goPrevWeek = () => setWeekStart(addWeeks(weekStart, -1))
  const goNextWeek = () => setWeekStart(addWeeks(weekStart, 1))
  const goPrevDay = () => setFocusedDate((d) => addDays(d, -1))
  const goNextDay = () => setFocusedDate((d) => addDays(d, 1))
  const goPrevMonth = () => setMonthStart((m) => getMonthStart(addMonths(m, -1)))
  const goNextMonth = () => setMonthStart((m) => getMonthStart(addMonths(m, 1)))

  const handleDayClick = useCallback(
    (day: CalendarDay) => {
      if (day.isWorkoutDay) {
        const idx = getScheduleIndexForWeekday(day.weekday)
        if (idx !== null && schedule[idx]) onSelectDay(schedule[idx])
      }
    },
    [schedule, onSelectDay]
  )

  const getVisibleRange = useCallback((): { start: Date; end: Date } => {
    if (calendarView === 'day') {
      const start = new Date(focusedDate)
      const end = new Date(focusedDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    if (calendarView === 'month') {
      const start = new Date(monthStart)
      const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    const start = new Date(weekStart)
    const end = addDays(weekStart, 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [calendarView, focusedDate, weekStart, monthStart])

  const handleLogRest = useCallback(async (_day: CalendarDay) => {
    await insertLog([], 'Rest')
    const { start, end } = getVisibleRange()
    const { completedDates: set } = await fetchLogsForDateRange(start, end)
    setCompletedDates(set)
  }, [insertLog, fetchLogsForDateRange, getVisibleRange])

  const days = useMemo(() => getWeekDays(weekStart), [weekStart, locale])
  const focusedDay = useMemo(() => getCalendarDay(focusedDate), [focusedDate, locale])
  const monthGrid = useMemo(
    () => (calendarView === 'month' ? getMonthGrid(monthStart) : []),
    [calendarView, monthStart, locale]
  )

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-6 flex flex-col items-center gap-2 text-center sm:mb-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {t('dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">{t('dashboard.subtitle')}</p>
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
          {onOpenHistory && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              onClick={onOpenHistory}
            >
              <History className="mr-2 size-4" />
              {t('dashboard.history')}
            </Button>
          )}
          {onOpenTour && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={onOpenTour}
              aria-label={t('dashboard.tour')}
            >
              <HelpCircle className="size-4" />
            </Button>
          )}
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={onOpenSettings}
              aria-label={t('dashboard.settings')}
            >
              <Settings className="size-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {showReminder && (
        <motion.div
          variants={item}
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3"
        >
          <span className="font-semibold text-foreground">{t('dashboard.reminderTitle')}</span>
          <Button
            size="sm"
            variant="ghost"
            className="text-white"
            onClick={() => {
              try {
                localStorage.setItem(`${REMINDER_DISMISSED_KEY}_${toDateString(new Date())}`, 'true')
              } catch {
                // ignore
              }
              setShowReminder(false)
            }}
          >
            {t('dashboard.dismiss')}
          </Button>
        </motion.div>
      )}

      {stats && (stats.workoutsThisMonth > 0 || stats.currentStreakWeeks > 0) && (
        <motion.div
          variants={item}
          className="flex flex-wrap justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:gap-6"
        >
          {stats.currentStreakWeeks > 0 && (
            <span className="text-sm font-semibold text-primary">
              {stats.currentStreakWeeks} {stats.currentStreakWeeks === 1 ? t('dashboard.weekInRow') : t('dashboard.weeksInRow')}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {stats.workoutsThisMonth} {t('dashboard.workoutsThisMonth')}
          </span>
        </motion.div>
      )}

      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-4"
      >
        <button
          type="button"
          onClick={calendarView === 'day' ? goPrevDay : calendarView === 'month' ? goPrevMonth : goPrevWeek}
          className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-foreground/80 transition hover:bg-white/10 hover:text-foreground"
          aria-label={
            calendarView === 'day'
              ? t('dashboard.prevDay')
              : calendarView === 'month'
                ? t('dashboard.prevMonth')
                : t('dashboard.prevWeek')
          }
        >
          <ChevronLeft className="size-6" />
        </button>
        <span className="min-w-0 flex-1 shrink-0 text-center text-sm font-medium tabular-nums text-foreground sm:min-w-[180px] sm:flex-none sm:text-base">
          {calendarView === 'day'
            ? formatDayHeader(focusedDate)
            : calendarView === 'month'
              ? formatMonthTitle(monthStart)
              : formatWeekRange(weekStart)}
        </span>
        <button
          type="button"
          onClick={calendarView === 'day' ? goNextDay : calendarView === 'month' ? goNextMonth : goNextWeek}
          className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-foreground/80 transition hover:bg-white/10 hover:text-foreground"
          aria-label={
            calendarView === 'day'
              ? t('dashboard.nextDay')
              : calendarView === 'month'
                ? t('dashboard.nextMonth')
                : t('dashboard.nextWeek')
          }
        >
          <ChevronRight className="size-6" />
        </button>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <div className="inline-flex rounded-2xl bg-white/5 p-1.5 shadow-lg shadow-black/20 backdrop-blur-md ring-1 ring-white/10">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCalendarView(mode)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                calendarView === mode
                  ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(255,0,127,0.35)]'
                  : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {mode === 'day' ? t('dashboard.viewDaily') : mode === 'week' ? t('dashboard.viewWeekly') : t('dashboard.viewMonthly')}
            </button>
          ))}
        </div>
      </motion.div>

      {calendarView === 'day' && focusedDay && (
        <motion.div key="day" className="mx-auto max-w-md" variants={container}>
          {renderDayCard(focusedDay)}
        </motion.div>
      )}

      {calendarView === 'week' && (
        <motion.div
          key="week"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7"
          variants={container}
        >
          {days.map((day) => (
            <motion.div key={toDateString(day.date)} variants={item} className="min-w-0">
              {renderDayCard(day)}
            </motion.div>
          ))}
        </motion.div>
      )}

      {calendarView === 'month' && (
        <motion.div
          key="month"
          className="grid grid-cols-7 gap-1.5 sm:gap-2"
          variants={container}
        >
          {monthGrid.map((cell, i) => (
            <motion.div key={i} variants={item} className="min-w-0">
              {cell ? renderDayCard(cell, true) : <div className="aspect-square rounded-xl bg-white/[0.02]" />}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )

  function renderDayCard(day: CalendarDay, compact = false) {
    const completed = completedDates.has(toDateString(day.date))
    const isWorkoutClickable = day.isWorkoutDay
    const isRestClickable = !day.isWorkoutDay && !completed && compact
    const isClickable = isWorkoutClickable || isRestClickable
    const isToday = toDateString(day.date) === toDateString(new Date())
    const CardWrap = isClickable ? 'button' : 'div'
    return (
      <CardWrap
        type={isClickable ? 'button' : undefined}
        onClick={
          isClickable
            ? isWorkoutClickable
              ? () => handleDayClick(day)
              : (e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleLogRest(day)
                }
            : undefined
        }
        className={`relative flex w-full flex-col justify-center rounded-2xl border bg-white/5 text-left shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-200 ${
          compact ? 'min-h-0 p-2 sm:p-2' : 'min-h-[88px] p-3 sm:min-h-[100px] sm:p-4'
        } ${
          isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_24px_rgba(255,0,127,0.2)]' : ''
        } ${
          isClickable
            ? 'cursor-pointer border-white/10 hover:border-primary/50 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,0,127,0.12)] active:bg-white/15'
            : 'cursor-default border-white/10 opacity-90'
        }`}
      >
        <div className={`flex items-center justify-between ${compact ? 'mb-0.5' : 'mb-2'}`}>
          <span className={`font-bold uppercase tracking-wider text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {day.dayLabel} | {day.date.getDate()}
            {isToday ? ` · ${t('dashboard.today')}` : ''}
          </span>
          {day.isWorkoutDay ? (
            completed ? (
              <CheckCircle2 className={`shrink-0 text-primary ${compact ? 'size-3' : 'size-5'}`} aria-hidden />
            ) : (
              <Circle className={`shrink-0 text-primary/60 ${compact ? 'size-3' : 'size-5'}`} aria-hidden />
            )
          ) : (
            <Circle className={`shrink-0 text-white/20 ${compact ? 'size-2.5' : 'size-4'}`} aria-hidden />
          )}
        </div>
        <div className={`flex flex-wrap items-center gap-2 ${compact ? 'gap-1' : ''}`}>
          {day.isWorkoutDay ? (
            <>
              <Dumbbell className={`shrink-0 text-primary ${compact ? 'size-3' : 'size-4'}`} />
              <span className={`font-semibold text-foreground ${compact ? 'text-xs' : ''}`}>{t('dashboard.workout')}</span>
            </>
          ) : (
            <>
              <span className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-sm'}`}>{t('dashboard.restDay')}</span>
              {!completed && !compact && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-[36px] shrink-0 text-xs text-primary hover:bg-primary/20"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    handleLogRest(day)
                  }}
                >
                  {t('dashboard.logRest')}
                </Button>
              )}
            </>
          )}
        </div>
      </CardWrap>
    )
  }
}
