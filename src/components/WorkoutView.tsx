import { useState, useCallback, useEffect, useMemo } from 'react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Info, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import type { WorkoutDay } from '@/data/workouts'
import { toExerciseData } from '@/data/workouts'
import { LogSessionModal } from './LogSessionModal'
import { ExerciseDetailSheet } from './ExerciseDetailSheet'
import { getSoundEnabled } from '@/lib/settings'
import { useTranslation } from '@/lib/i18n'
import type { WorkoutExercise } from '@/data/workouts'
import { vibrate } from '@/lib/haptics'

function playCompletionFeedback() {
  vibrate(50)
  if (getSoundEnabled()) {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)
    } catch {
      // ignore
    }
  }
}

const REST_SECONDS_KEY = 'corequeen_rest_seconds'
const DEFAULT_REST_SECONDS = 60

function getRestSeconds(): number {
  const stored = localStorage.getItem(REST_SECONDS_KEY)
  const n = stored ? parseInt(stored, 10) : NaN
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_REST_SECONDS
}

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
}

function fireConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['var(--primary)', 'var(--chart-2)', '#fff'],
  })
}

interface WorkoutViewProps {
  day: WorkoutDay
  onBack: () => void
}

export function WorkoutView({ day, onBack }: WorkoutViewProps) {
  const { t } = useTranslation()
  const parsedSets = useMemo(() => {
    return day.exercises.map(ex => {
      const match = ex.setsReps.match(/^(\d+)\s*[x×*]/i)
      return match ? parseInt(match[1], 10) : 1
    })
  }, [day.exercises])

  const [completedSets, setCompletedSets] = useState<number[]>(
    day.exercises.map(() => 0)
  )
  const completed = useMemo(() => completedSets.map((count, i) => count === parsedSets[i]), [completedSets, parsedSets])
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [restSecondsLeft, setRestSecondsLeft] = useState<number | null>(null)
  const [exerciseDetail, setExerciseDetail] = useState<WorkoutExercise | null>(null)
  const [exerciseDetailOpen, setExerciseDetailOpen] = useState(false)

  useEffect(() => {
    if (restSecondsLeft === null || restSecondsLeft <= 0) return
    const id = setInterval(() => {
      setRestSecondsLeft((s) => {
        if (s === null) return null
        const next = s - 1
        return next <= 0 ? null : next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [restSecondsLeft])

  const toggleAll = useCallback(
    (index: number) => {
      setCompletedSets((prev) => {
        const next = [...prev]
        const total = parsedSets[index]
        const isComplete = next[index] === total
        next[index] = isComplete ? 0 : total
        if (!isComplete) {
          playCompletionFeedback()
          if (index < day.exercises.length - 1) {
            setRestSecondsLeft(getRestSeconds())
          }
        }
        return next
      })
    },
    [day.exercises.length, parsedSets]
  )

  const toggleSet = useCallback(
    (exIndex: number, setIndex: number) => {
      setCompletedSets((prev) => {
        const next = [...prev]
        const current = next[exIndex]
        if (current === setIndex + 1) {
          next[exIndex] = setIndex
        } else {
          next[exIndex] = setIndex + 1
          vibrate(20) // subtle pop for a single set
        }
        if (next[exIndex] === parsedSets[exIndex] && current !== parsedSets[exIndex]) {
          playCompletionFeedback()
          if (exIndex < day.exercises.length - 1) {
            setRestSecondsLeft(getRestSeconds())
          }
        }
        return next
      })
    },
    [day.exercises.length, parsedSets]
  )

  const exerciseData = useMemo(
    () => toExerciseData(day.exercises, completed),
    [day.exercises, completed]
  )
  const allDone = useMemo(() => completed.every(Boolean), [completed])

  useEffect(() => {
    if (allDone && day.exercises.length > 0) {
      fireConfetti()
      vibrate([100, 50, 100])
    }
  }, [allDone, day.exercises.length])

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-8 flex min-h-[44px] items-center justify-between gap-2 sm:mb-10 mt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={t('workout.back')}
        >
          <ArrowLeft className="size-6 stroke-[1.5]" />
        </Button>
        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
          {t('dashboard.workout')}
        </span>
        <div className="w-10 shrink-0" />
      </div>

      <div className="mb-10 text-center">
        <h2 className="font-display text-[2.5rem] leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          {day.title}
        </h2>
      </div>

      <div className="card-minimal pt-3 pb-2 mb-8">
        <div className="mb-2 px-6 pt-4">
          <h3 className="text-xs tracking-widest uppercase text-muted-foreground font-semibold">{t('workout.exercises')}</h3>
        </div>
        <CardContent className="px-0 pb-0">
          <motion.ul
            className="flex flex-col"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {day.exercises.map((ex, i) => {
                const isCompleted = completed[i]
                const totalSets = parsedSets[i]
                return (
                  <motion.li
                    key={`${ex.name}-${i}`}
                    variants={rowVariants}
                    className="flex flex-col border-b border-border px-6 py-5 last:border-0"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleAll(i)}
                        className="mt-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                        aria-label={`Toggle all for ${ex.name}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-[26px] text-charcoal" />
                        ) : (
                          <div className="size-[26px] rounded-full border-2 border-muted-foreground/30 hover:border-charcoal-light/50 transition-colors" />
                        )}
                      </button>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <h4 className={`font-display text-[1.15rem] font-bold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {ex.name}
                          </h4>
                          <div className="flex items-center gap-3 shrink-0 ml-4 pt-1">
                            <span className="text-sm font-medium text-muted-foreground">
                              {ex.setsReps}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExerciseDetail(ex)
                                setExerciseDetailOpen(true)
                              }}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              aria-label={`Info over ${ex.name}`}
                            >
                              <Info className="size-[1.1rem]" />
                            </button>
                          </div>
                        </div>

                        {ex.why && (
                          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground pr-8">
                            {ex.why}
                          </p>
                        )}

                        {totalSets > 1 && (
                          <div className="mt-4 flex flex-wrap gap-2.5">
                            {Array.from({ length: totalSets }).map((_, setIdx) => {
                              const setDone = completedSets[i] > setIdx
                              return (
                                <button
                                  key={setIdx}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleSet(i, setIdx)
                                  }}
                                  className={`size-8 rounded-full border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                                    ${setDone
                                      ? 'bg-charcoal border-charcoal text-white'
                                      : 'border-charcoal-light/30 hover:border-charcoal-light/60 bg-transparent text-transparent'}`}
                                  aria-label={`Set ${setIdx + 1}`}
                                >
                                  <Check className="size-4" strokeWidth={3} />
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </motion.ul>
        </CardContent>
      </div>

      <div className="flex justify-end mb-12">
        <Button
          size="lg"
          className="w-full sm:w-auto bg-charcoal text-white rounded-full font-bold hover:bg-charcoal-light py-6"
          onClick={() => setLogModalOpen(true)}
          disabled={!allDone}
        >
          {t('workout.logSession')}
        </Button>
      </div>

      <LogSessionModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        exerciseData={exerciseData}
        onSuccess={() => onBack()}
      />
      <ExerciseDetailSheet
        exercise={exerciseDetail}
        open={exerciseDetailOpen}
        onOpenChange={setExerciseDetailOpen}
      />

      <AnimatePresence>
        {restSecondsLeft !== null && restSecondsLeft > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))]"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-popover px-6 py-6 text-center shadow-xl sm:px-8"
            >
              <p className="text-muted-foreground">{t('workout.rest')}</p>
              <p className="mt-2 text-4xl font-black tabular-nums text-primary">
                {Math.floor((restSecondsLeft ?? 0) / 60)}:{(restSecondsLeft ?? 0) % 60 < 10 ? '0' : ''}{(restSecondsLeft ?? 0) % 60}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border-white/20"
                onClick={() => setRestSecondsLeft(null)}
              >
                {t('workout.skip')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
