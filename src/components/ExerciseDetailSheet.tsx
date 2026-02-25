import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Play } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
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
  const { t } = useTranslation()
  if (!exercise) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-popover text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground font-display">{exercise.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          {exercise.imageUrl && (
            <div className="w-full h-48 bg-muted rounded-xl border border-border flex items-center justify-center overflow-hidden">
              <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-full object-cover mix-blend-multiply" />
            </div>
          )}

          <div>
            <p className="text-sm font-bold tracking-widest uppercase text-charcoal">{exercise.setsReps}</p>
          </div>
          {exercise.why && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('exerciseDetail.why')}
              </p>
              <p className="mt-1 text-foreground">{exercise.why}</p>
            </div>
          )}
          {exercise.cues && exercise.cues.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('exerciseDetail.cues')}
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-foreground">
                {exercise.cues.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {exercise.videoUrl && (
            <div className="pt-2">
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
              >
                <Play className="size-4 fill-primary" />
                Bekijk Video Tutorial
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
