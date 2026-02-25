import { useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkoutDay } from '@/data/workouts'
import type { ExerciseDatum } from '@/types/log'
import { toExerciseData } from '@/data/workouts'
import { LogSessionModal } from './LogSessionModal'

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
  const [completed, setCompleted] = useState<boolean[]>(
    day.exercises.map(() => false)
  )
  const [logModalOpen, setLogModalOpen] = useState(false)

  const toggle = useCallback(
    (index: number) => {
      setCompleted((prev) => {
        const next = [...prev]
        const newVal = !next[index]
        next[index] = newVal
        if (newVal) fireConfetti()
        return next
      })
    },
    []
  )

  const exerciseData: ExerciseDatum[] = toExerciseData(day.exercises, completed)
  const allDone = completed.every(Boolean)

  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-6 px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="size-5" />
          <span className="sr-only">Back</span>
        </Button>
        <h2 className="text-xl font-bold text-white">{day.label}</h2>
        <div className="w-9" />
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.ul
            className="space-y-3"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {day.exercises.map((ex, i) => (
                <motion.li
                  key={`${ex.name}-${i}`}
                  variants={rowVariants}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <Checkbox
                    id={`ex-${i}`}
                    checked={completed[i]}
                    onCheckedChange={() => toggle(i)}
                    className="border-white/30 data-[state=checked]:bg-[#FF007F] data-[state=checked]:border-[#FF007F]"
                  />
                  <label
                    htmlFor={`ex-${i}`}
                    className="flex flex-1 cursor-pointer flex-col gap-0.5 text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      {completed[i] ? (
                        <CheckCircle2 className="size-5 shrink-0 text-[#FF007F]" />
                      ) : null}
                      <span className={completed[i] ? 'line-through opacity-80' : ''}>
                        {ex.name}
                      </span>
                      <span className="text-muted-foreground">
                        {ex.setsReps}
                      </span>
                    </span>
                    {ex.why ? (
                      <span className="text-xs text-muted-foreground">
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
          Log session
        </Button>
      </div>

      <LogSessionModal
        open={logModalOpen}
        onOpenChange={setLogModalOpen}
        exerciseData={exerciseData}
        onSuccess={() => onBack()}
      />
    </motion.div>
  )
}
