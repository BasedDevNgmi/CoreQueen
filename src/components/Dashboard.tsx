import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Flame } from 'lucide-react'
import { getWeekStart, addDays, toDateString } from '@/lib/calendar'
import { useLogs } from '@/hooks/useLogs'
import { useTranslation } from '@/lib/i18n'
import type { WorkoutDay } from '@/data/workouts'

interface DashboardProps {
  schedule: WorkoutDay[]
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

const item: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
}

export function Dashboard({ schedule, onSelectDay }: DashboardProps) {
  const { t } = useTranslation()
  const [weekStart] = useState(() => getWeekStart(new Date()))
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const { fetchLogsForDateRange } = useLogs()

  useEffect(() => {
    let cancelled = false
    const start = new Date(weekStart)
    const end = addDays(weekStart, 6)
    end.setHours(23, 59, 59, 999)
    fetchLogsForDateRange(start, end).then(({ completedDates: set }) => {
      if (!cancelled) setCompletedDates(set)
    })
    return () => {
      cancelled = true
    }
  }, [weekStart, fetchLogsForDateRange])

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
        <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          {t('dashboard.heroThisWeek')}
        </p>
        <h1 className="font-display text-[3.25rem] leading-[1.1] tracking-tight text-foreground">
          {t('dashboard.heroYourCore')}<br />
          <span className="italic text-primary">{t('dashboard.heroRoutine')}</span>
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground pr-4">
          {t('dashboard.heroDesc')}
        </p>
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
