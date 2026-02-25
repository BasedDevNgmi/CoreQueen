import { useState, useCallback, useEffect, useMemo } from 'react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkoutDay } from '@/data/workouts'
import { toExerciseData } from '@/data/workouts'
import { LogSessionModal } from './LogSessionModal'
import { ExerciseDetailSheet } from './ExerciseDetailSheet'
import { getSoundEnabled } from '@/lib/settings'
import { useTranslation } from '@/lib/i18n'
import type { WorkoutExercise } from '@/data/workouts'

function playCompletionFeedback() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(50)
  }
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
    colors: ['#FF007F', '#ff3399', '#fff'],
  })
}

interface WorkoutViewProps {
  day: WorkoutDay
  onBack: () => void
}

export function WorkoutView({ day, onBack }: WorkoutViewProps) {
  const { t } = useTranslation()
  const [completed, setCompleted] = useState<boolean[]>(
    day.exercises.map(() => false)
  )
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

  const toggle = useCallback(
    (index: number) => {
      setCompleted((prev) => {
        const next = [...prev]
        const newVal = !next[index]
        next[index] = newVal
        if (newVal) {
          fireConfetti()
          playCompletionFeedback()
          if (index < day.exercises.length - 1) {
            setRestSecondsLeft(getRestSeconds())
          }
        }
        return next
      })
    },
    [day.exercises.length]
  )

  const exerciseData = useMemo(
    () => toExerciseData(day.exercises, completed),
    [day.exercises, completed]
  )
  const allDone = useMemo(() => completed.every(Boolean), [completed])

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4 flex min-h-[44px] items-center justify-between gap-2 sm:mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={t('workout.back')}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="min-w-0 truncate text-center text-lg font-bold text-foreground sm:text-xl">{day.label}</h2>
        <div className="w-9 shrink-0" />
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">{t('workout.exercises')}</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.ul
            className="space-y-2 sm:space-y-3"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {day.exercises.map((ex, i) => (
                <motion.li
                  key={`${ex.name}-${i}`}
                  variants={rowVariants}
                  className="flex min-h-[56px] items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 sm:px-4"
                >
                  <Checkbox
                    id={`ex-${i}`}
                    checked={completed[i]}
                    onCheckedChange={() => toggle(i)}
                    className="border-white/30 data-[state=checked]:bg-[#FF007F] data-[state=checked]:border-[#FF007F]"
                  />
                  <label
                    htmlFor={`ex-${i}`}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5 text-foreground"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {completed[i] ? (
                        <CheckCircle2 className="size-5 shrink-0 text-[#FF007F]" />
                      ) : null}
                      <span className={`min-w-0 truncate sm:max-w-none ${completed[i] ? 'line-through opacity-80' : ''}`}>
                        {ex.name}
                      </span>
                      <span className="text-muted-foreground">
                        {ex.setsReps}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setExerciseDetail(ex)
                          setExerciseDetailOpen(true)
                        }}
                        className="ml-auto rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-[#FF007F]"
                        aria-label={`Info over ${ex.name}`}
                      >
                        <Info className="size-4" />
                      </button>
                    </span>
                    {ex.why ? (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {ex.why}
                      </span>
                    ) : null}
                  </label>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="bg-[#FF007F] font-bold hover:bg-[#ff3399]"
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
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a1a] px-6 py-6 text-center shadow-xl sm:px-8"
            >
              <p className="text-muted-foreground">{t('workout.rest')}</p>
              <p className="mt-2 text-4xl font-black tabular-nums text-[#FF007F]">
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
