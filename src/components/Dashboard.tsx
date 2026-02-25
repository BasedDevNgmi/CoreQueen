import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Dumbbell, History, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getWeekStart,
  getWeekDays,
  formatWeekRange,
  formatTwoWeekRange,
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

export function Dashboard({ schedule, onSelectDay, onOpenHistory, onOpenTour, onOpenSettings }: DashboardProps) {
  const { t } = useTranslation()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<{ workoutsThisMonth: number; currentStreakWeeks: number } | null>(null)
  const [showReminder, setShowReminder] = useState(false)
  const [twoWeeks, setTwoWeeks] = useState(false)
  const { fetchLogsForDateRange, fetchLogs, insertLog } = useLogs()

  useEffect(() => {
    setShowReminder(shouldShowReminder())
  }, [])

  useEffect(() => {
    let cancelled = false
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + (twoWeeks ? 13 : 6))
    fetchLogsForDateRange(weekStart, end).then(({ completedDates: set }) => {
      if (!cancelled) setCompletedDates(set)
    })
    return () => {
      cancelled = true
    }
  }, [weekStart, twoWeeks, fetchLogsForDateRange])

  useEffect(() => {
    let cancelled = false
    fetchLogs(100).then((logs) => {
      if (!cancelled) setStats(computeStreakAndMonth(logs))
    })
    return () => {
      cancelled = true
    }
  }, [fetchLogs, weekStart])

  const goPrev = () => {
    const prev = new Date(weekStart)
    prev.setDate(weekStart.getDate() - 7)
    setWeekStart(prev)
  }

  const goNext = () => {
    const next = new Date(weekStart)
    next.setDate(weekStart.getDate() + 7)
    setWeekStart(next)
  }

  const handleDayClick = useCallback(
    (day: CalendarDay) => {
      if (day.isWorkoutDay) {
        const idx = getScheduleIndexForWeekday(day.weekday)
        if (idx !== null && schedule[idx]) onSelectDay(schedule[idx])
      }
    },
    [schedule, onSelectDay]
  )

  const handleLogRest = useCallback(async (_day: CalendarDay) => {
    await insertLog([], 'Rest')
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + (twoWeeks ? 13 : 6))
    const { completedDates: set } = await fetchLogsForDateRange(weekStart, end)
    setCompletedDates(set)
  }, [insertLog, fetchLogsForDateRange, weekStart, twoWeeks])

  const days = useMemo(() => getWeekDays(weekStart), [weekStart])
  const nextWeekStart = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + 7)
    return d
  }, [weekStart])
  const daysWeek2 = useMemo(
    () => (twoWeeks ? getWeekDays(nextWeekStart) : []),
    [twoWeeks, nextWeekStart]
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
              className="text-muted-foreground hover:text-[#FF007F]"
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
              className="text-muted-foreground hover:text-[#FF007F]"
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
              className="text-muted-foreground hover:text-[#FF007F]"
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
          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#FF007F]/40 bg-[#FF007F]/10 px-4 py-3"
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
            <span className="text-sm font-semibold text-[#FF007F]">
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
          onClick={goPrev}
          className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-foreground/80 transition hover:bg-white/10 hover:text-foreground"
          aria-label={t('dashboard.prevWeek')}
        >
          <ChevronLeft className="size-6" />
        </button>
        <span className="min-w-0 flex-1 shrink-0 text-center text-sm font-medium tabular-nums text-foreground sm:min-w-[200px] sm:flex-none sm:text-base">
          {twoWeeks ? formatTwoWeekRange(weekStart) : formatWeekRange(weekStart)}
        </span>
        <button
          type="button"
          onClick={() => setTwoWeeks((w) => !w)}
          className="min-h-[44px] rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground sm:px-2 sm:py-1"
        >
          {twoWeeks ? t('dashboard.oneWeek') : t('dashboard.twoWeeks')}
        </button>
        <button
          type="button"
          onClick={goNext}
          className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-foreground/80 transition hover:bg-white/10 hover:text-foreground"
          aria-label={t('dashboard.nextWeek')}
        >
          <ChevronRight className="size-6" />
        </button>
      </motion.div>

      {[
          { weekDays: days, key: 'w1' },
          ...(twoWeeks ? [{ weekDays: daysWeek2, key: 'w2' }] : []),
        ].map(({ weekDays, key }) => (
          <motion.div
            key={key}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7"
            variants={container}
          >
            {weekDays.map((day) => {
              const completed = completedDates.has(toDateString(day.date))
              const isClickable = day.isWorkoutDay
              const isToday = toDateString(day.date) === toDateString(new Date())
              const CardWrap = isClickable ? 'button' : 'div'
              return (
                <motion.div key={toDateString(day.date)} variants={item} className="min-w-0">
                  <CardWrap
                    type={isClickable ? 'button' : undefined}
                    onClick={isClickable ? () => handleDayClick(day) : undefined}
                    className={`relative flex min-h-[88px] w-full flex-col justify-center rounded-2xl border bg-white/5 p-3 text-left backdrop-blur-xl transition sm:min-h-[100px] sm:p-4 ${
                      isToday ? 'ring-2 ring-[#FF007F] ring-offset-2 ring-offset-background' : ''
                    } ${
                      isClickable
                        ? 'cursor-pointer border-white/10 hover:border-[#FF007F]/40 hover:bg-white/10 active:bg-white/15'
                        : 'cursor-default border-white/10 opacity-90'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {day.dayLabel} | {day.date.getDate()}
                        {isToday ? ` · ${t('dashboard.today')}` : ''}
                      </span>
                      {day.isWorkoutDay ? (
                        completed ? (
                          <CheckCircle2 className="size-5 shrink-0 text-[#FF007F]" aria-hidden />
                        ) : (
                          <Circle className="size-5 shrink-0 text-[#FF007F]/60" aria-hidden />
                        )
                      ) : (
                        <Circle className="size-4 shrink-0 text-white/20" aria-hidden />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {day.isWorkoutDay ? (
                        <>
                          <Dumbbell className="size-4 shrink-0 text-[#FF007F]" />
                          <span className="font-semibold text-foreground">{t('dashboard.workout')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground">{t('dashboard.restDay')}</span>
                          {!completed && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="min-h-[36px] shrink-0 text-xs text-[#FF007F] hover:bg-[#FF007F]/20"
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
                </motion.div>
              )
            })}
          </motion.div>
        ))}
    </motion.div>
  )
}
