import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Dumbbell } from 'lucide-react'
import {
  getWeekStart,
  getWeekDays,
  formatWeekRange,
  toDateString,
  type CalendarDay,
} from '@/lib/calendar'
import { useLogs } from '@/hooks/useLogs'
import type { WorkoutDay } from '@/data/workouts'

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
}

export function Dashboard({ schedule, onSelectDay }: DashboardProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const { fetchLogsForDateRange } = useLogs()

  const days = getWeekDays(weekStart)

  useEffect(() => {
    let cancelled = false
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    fetchLogsForDateRange(weekStart, end).then(({ completedDates: set }) => {
      if (!cancelled) setCompletedDates(set)
    })
    return () => {
      cancelled = true
    }
  }, [weekStart, fetchLogsForDateRange])

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

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isWorkoutDay) return
    const idx = getScheduleIndexForWeekday(day.weekday)
    if (idx !== null && schedule[idx]) onSelectDay(schedule[idx])
  }

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-6 px-4 py-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
          CoreQueen
        </h1>
        <p className="mt-2 text-muted-foreground">3× per week — controle & ademhaling</p>
      </motion.div>

      <motion.div
        variants={item}
        className="flex items-center justify-center gap-4 text-white"
      >
        <button
          type="button"
          onClick={goPrev}
          className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Vorige week"
        >
          <ChevronLeft className="size-6" />
        </button>
        <span className="min-w-[200px] text-center font-medium tabular-nums text-foreground">
          {formatWeekRange(weekStart)}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Volgende week"
        >
          <ChevronRight className="size-6" />
        </button>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7"
        variants={container}
      >
        {days.map((day) => {
          const completed = completedDates.has(toDateString(day.date))
          const isClickable = day.isWorkoutDay
          return (
            <motion.div key={toDateString(day.date)} variants={item}>
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={!isClickable}
                className={`w-full rounded-2xl border bg-white/5 p-4 text-left backdrop-blur-xl transition ${
                  isClickable
                    ? 'cursor-pointer border-white/10 hover:border-[#FF007F]/40 hover:bg-white/10'
                    : 'cursor-default border-white/10 opacity-90'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {day.dayLabel} | {day.date.getDate()}
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
                <div className="flex items-center gap-2">
                  {day.isWorkoutDay ? (
                    <>
                      <Dumbbell className="size-4 shrink-0 text-[#FF007F]" />
                      <span className="font-semibold text-white">Workout</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Rest day</span>
                  )}
                </div>
              </button>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
