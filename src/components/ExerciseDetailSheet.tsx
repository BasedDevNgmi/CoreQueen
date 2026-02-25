import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { WorkoutExercise } from '@/data/workouts'

interface ExerciseDetailSheetProps {
  exercise: WorkoutExercise | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExerciseDetailSheet({
  exercise,
  open,
  onOpenChange,
}: ExerciseDetailSheetProps) {
  if (!exercise) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#1a1a1a] text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">{exercise.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#FF007F]">{exercise.setsReps}</p>
          {exercise.why && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Waarom
              </p>
              <p className="mt-1 text-foreground">{exercise.why}</p>
            </div>
          )}
          {exercise.cues && exercise.cues.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cues
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-foreground">
                {exercise.cues.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
