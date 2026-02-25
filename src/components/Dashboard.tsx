import { useState, useEffect, useMemo } from 'react'
import { motion, type Variants } from 'framer-motion'
import { CheckCircle2, Clock, Flame } from 'lucide-react'
import { getWeekStart, addDays, toDateString } from '@/lib/calendar'
import { useLogs } from '@/hooks/useLogs'
import { useTranslation } from '@/lib/i18n'
import type { WorkoutDay } from '@/data/workouts'
import { WORKOUT_SCHEDULE_6_WEEKS } from '@/data/workouts'

interface DashboardProps {
  onSelectDay: (day: WorkoutDay) => void
  onOpenHistory?: () => void
  onOpenTour?: () => void
  onOpenSettings?: () => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
}

export function Dashboard({ onSelectDay }: DashboardProps) {
  const { t } = useTranslation()
  const [weekStart] = useState(() => getWeekStart(new Date()))
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const { fetchLogsForDateRange } = useLogs()
  const [selectedWeekNum, setSelectedWeekNum] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    // Fetch up to 6 weeks ago to determine the current week for the program.
    const startHistory = addDays(weekStart, -(6 * 7))
    const end = addDays(weekStart, 6)
    end.setHours(23, 59, 59, 999)

    fetchLogsForDateRange(startHistory, end).then(({ completedDates: set }) => {
      if (!cancelled) setCompletedDates(set)
    })
    return () => {
      cancelled = true
    }
  }, [weekStart, fetchLogsForDateRange])

  // Determine current week (1-6) based on history 
  // Very simple approach: see how many distinct weeks they have logged at least once.
  const currentWeekNum = useMemo(() => {
    // To ensure a proper 6-week progression, we map it based on how many logs they have total.
    // Roughly 3 days a week. Every 3 logs = 1 week advanced.
    const totalLogs = completedDates.size
    const computedWeek = Math.floor(totalLogs / 3) + 1
    // Cap strictly at week 1 to 6
    return Math.max(1, Math.min(6, computedWeek))
  }, [completedDates])

  // Use the explicitly selected week or default to the highest unlocked week
  const activeWeekNum = selectedWeekNum ?? currentWeekNum

  const schedule = WORKOUT_SCHEDULE_6_WEEKS[activeWeekNum] || WORKOUT_SCHEDULE_6_WEEKS[1]

  const { mappedDays, completedCount } = useMemo(() => {
    let count = 0
    const mapped = schedule.map((day, ix) => {
      const activityDate = addDays(weekStart, day.dayIndex)
      const dateStr = toDateString(activityDate)
      const isCompleted = completedDates.has(dateStr)
      if (isCompleted) count++
      return { ...day, isCompleted, dateStr, displayIndex: ix + 1 }
    })
    return { mappedDays: mapped, completedCount: count }
  }, [schedule, weekStart, completedDates])

  return (
    <motion.div
      className="mx-auto max-w-md space-y-8 px-6 py-8 pb-32"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Hero Section */}
      <motion.div variants={item} className="mb-10 mt-4">
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase flex gap-2 items-center">
          <span>{t('dashboard.heroThisWeek')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>PROGRAMMA</span>
        </p>
        <h1 className="font-display text-[3.25rem] leading-[1.1] tracking-tight text-foreground">
          {t('dashboard.heroYourCore')}<br />
          <span className="italic text-primary">{t('dashboard.heroRoutine')}</span>
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground pr-4">
          {t('dashboard.heroDesc')}
        </p>

        {/* Horizontal Week Selector */}
        <div className="mt-8 -mx-6 px-6 overflow-x-auto pb-4 scrollbar-hide snap-x flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((w) => {
            const isSelected = activeWeekNum === w
            const isLocked = w > currentWeekNum

            return (
              <button
                key={w}
                onClick={() => !isLocked && setSelectedWeekNum(w)}
                className={`snap-start shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 border ${isSelected
                  ? 'bg-charcoal text-white border-charcoal ring-2 ring-charcoal/20'
                  : isLocked
                    ? 'bg-muted/50 text-muted-foreground/50 border-transparent cursor-not-allowed'
                    : 'bg-white text-charcoal border-border hover:border-charcoal/30'
                  }`}
              >
                WEEK {w}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Progress Section */}
      <motion.div variants={item} className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <span className="text-sm font-bold tracking-widest text-foreground">
            {t('dashboard.weeklyProgress')}
          </span>
          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            {completedCount} / {schedule.length}
          </span>
        </div>
        {/* Progress Bar Track */}
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-charcoal-light"
            style={{ backgroundColor: 'var(--color-charcoal-light)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / schedule.length) * 100}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Workout List */}
      <motion.div variants={container} className="space-y-4">
        {mappedDays.map((day) => (
          <motion.button
            key={day.id}
            variants={item}
            onClick={() => onSelectDay(day)}
            className="w-full card-minimal text-left px-5 py-6 flex items-center justify-between"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                {t('dashboard.dayLabel')} {day.displayIndex}
              </span>
              <h3 className="font-display text-[1.35rem] leading-none text-foreground mb-1">
                {day.title}
              </h3>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {day.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="size-3.5" />
                  {day.intensity}
                </span>
              </div>
            </div>
            <div className="shrink-0 pl-4">
              {day.isCompleted ? (
                <CheckCircle2 className="size-7 text-charcoal-light opacity-90" />
              ) : (
                <div className="size-7 rounded-full border-[2px] border-muted-foreground/30" />
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
