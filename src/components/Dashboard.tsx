import { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
    transition: { staggerChildren: 0.07 },
  },
}

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

const springTransition = { type: 'tween' as const, duration: 0.2 }

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
  const { t } = useTranslation()
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

  const handleLogRest = useCallback(async () => {
    await insertLog([], 'Rest')
    const { start, end } = getVisibleRange()
    const { completedDates: set } = await fetchLogsForDateRange(start, end)
    setCompletedDates(set)
  }, [insertLog, fetchLogsForDateRange, getVisibleRange])

  const days = useMemo(() => getWeekDays(weekStart), [weekStart])
  const focusedDay = useMemo(() => getCalendarDay(focusedDate), [focusedDate])
  const monthGrid = useMemo(
    () => (calendarView === 'month' ? getMonthGrid(monthStart) : []),
    [calendarView, monthStart]
  )

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-12 flex flex-col items-center gap-2 text-center sm:mb-16">
        <p className="font-sans text-sm tracking-[0.2em] text-primary uppercase">{t('dashboard.subtitle')}</p>
        <h1
          className="font-display text-5xl font-black italic tracking-tight text-foreground sm:text-7xl"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #F5EEF0 40%, #DAA8CE 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('dashboard.title')}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 mt-4">
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
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 shadow-[0_0_20px_rgba(224,169,165,0.12)]"
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
          className="flex flex-wrap justify-center gap-4 rounded-2xl border border-primary/20 bg-white/5 px-4 py-3 backdrop-blur-xl shadow-[0_0_16px_rgba(224,169,165,0.08)] sm:gap-6"
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
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 my-8"
      >
        <motion.button
          type="button"
          onClick={calendarView === 'day' ? goPrevDay : calendarView === 'month' ? goPrevMonth : goPrevWeek}
          className="min-h-[56px] min-w-[56px] rounded-full p-2 text-foreground/60 transition hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={
            calendarView === 'day'
              ? t('dashboard.prevDay')
              : calendarView === 'month'
                ? t('dashboard.prevMonth')
                : t('dashboard.prevWeek')
          }
        >
          <ChevronLeft className="size-8 stroke-[1.5]" />
        </motion.button>

        <span className="font-display italic text-3xl font-medium text-foreground sm:text-5xl">
          {calendarView === 'day'
            ? formatDayHeader(focusedDate)
            : calendarView === 'month'
              ? formatMonthTitle(monthStart)
              : formatWeekRange(weekStart)}
        </span>

        <motion.button
          type="button"
          onClick={calendarView === 'day' ? goNextDay : calendarView === 'month' ? goNextMonth : goNextWeek}
          className="min-h-[56px] min-w-[56px] rounded-full p-2 text-foreground/60 transition hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={
            calendarView === 'day'
              ? t('dashboard.nextDay')
              : calendarView === 'month'
                ? t('dashboard.nextMonth')
                : t('dashboard.nextWeek')
          }
        >
          <ChevronRight className="size-8 stroke-[1.5]" />
        </motion.button>
      </motion.div>

      <motion.div variants={item} className="flex justify-center">
        <div className="relative inline-flex rounded-2xl bg-white/5 p-1.5 shadow-lg shadow-black/20 backdrop-blur-xl ring-1 ring-white/10">
          {(['day', 'week', 'month'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCalendarView(mode)}
              className={`relative z-10 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${calendarView === mode
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                }`}
            >
              {calendarView === mode && (
                <motion.span
                  layoutId="segment-pill"
                  className="absolute inset-0 z-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #DAA8CE 0%, #D49BB8 50%, #B298CD 100%)',
                    boxShadow: '0 0 20px rgba(218, 168, 206, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  transition={{ type: 'tween', duration: 0.22 }}
                />
              )}
              <span className="relative z-10">{mode === 'day' ? t('dashboard.viewDaily') : mode === 'week' ? t('dashboard.viewWeekly') : t('dashboard.viewMonthly')}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {calendarView === 'day' && focusedDay && (
          <motion.div
            key="day"
            className="mx-auto max-w-md"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderDayCard(focusedDay)}
          </motion.div>
        )}

        {calendarView === 'week' && (
          <motion.div
            key="week"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {monthGrid.map((cell, i) => (
              <motion.div key={i} variants={item} className="min-w-0">
                {cell ? renderDayCard(cell, true) : <div className="aspect-square rounded-xl bg-white/[0.02]" />}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )

  function renderDayCard(day: CalendarDay, compact = false) {
    const completed = completedDates.has(toDateString(day.date))
    const isWorkoutClickable = day.isWorkoutDay
    const isRestClickable = !day.isWorkoutDay && !completed && compact
    const isClickable = isWorkoutClickable || isRestClickable
    const isToday = toDateString(day.date) === toDateString(new Date())
    const CardWrap = isClickable ? motion.button : motion.div
    const baseClass = `relative flex w-full flex-col justify-center rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur-xl transition-all duration-200 card-glass ${compact ? 'min-h-0 p-2 sm:p-2' : 'min-h-[88px] p-3 sm:min-h-[100px] sm:p-4'
      } ${isToday
        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_0_28px_rgba(224,169,165,0.25),0_0_12px_rgba(224,169,165,0.15),inset_0_1px_0_rgba(255,255,255,0.06)]'
        : 'shadow-lg shadow-black/20'
      } ${isClickable
        ? 'cursor-pointer border-white/10 hover:border-primary/50 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(224,169,165,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-white/15'
        : 'cursor-default border-white/10 opacity-90'
      }`
    return (
      <CardWrap
        type={isClickable ? 'button' : undefined}
        onClick={
          isClickable
            ? isWorkoutClickable
              ? () => handleDayClick(day)
              : (e: React.MouseEvent) => {
                e.stopPropagation()
                handleLogRest()
              }
            : undefined
        }
        className={baseClass}
        whileHover={isClickable ? { scale: 1.02 } : undefined}
        whileTap={isClickable ? { scale: 0.98 } : undefined}
        transition={springTransition}
      >
        <div className={`flex items-center justify-between ${compact ? 'mb-0.5' : 'mb-2'}`}>
          <span className={`font-bold uppercase tracking-wider text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {day.dayLabel} | {day.date.getDate()}
            {isToday ? ` · ${t('dashboard.today')}` : ''}
          </span>
          {day.isWorkoutDay ? (
            completed ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <CheckCircle2 className={`shrink-0 text-primary ${compact ? 'size-3' : 'size-5'}`} aria-hidden />
              </motion.span>
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
                <motion.button
                  type="button"
                  className="min-h-[36px] shrink-0 rounded-full border border-primary/40 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    handleLogRest()
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springTransition}
                >
                  {t('dashboard.logRest')}
                </motion.button>
              )}
            </>
          )}
        </div>
      </CardWrap>
    )
  }
}
