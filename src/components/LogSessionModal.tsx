import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useLogs } from '@/hooks/useLogs'
import { shareWorkoutSummary } from '@/lib/share'
import type { ExerciseDatum } from '@/types/log'

const FEELINGS = ['💪', '🔥', '✨', '😊', '😤', '👑']

interface LogSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseData: ExerciseDatum[]
  onSuccess: () => void
}

export function LogSessionModal({
  open,
  onOpenChange,
  exerciseData,
  onSuccess,
}: LogSessionModalProps) {
  const [feeling, setFeeling] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { insertLog } = useLogs()

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    const { error: err } = await insertLog(exerciseData, notes || undefined, feeling || undefined)
    if (err) {
      setLoading(false)
      setError(err.message)
      return
    }
    await shareWorkoutSummary({
      exerciseCount: exerciseData.length,
      feeling: feeling || undefined,
      date: new Date(),
    })
    setLoading(false)
    onOpenChange(false)
    setFeeling('')
    setNotes('')
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-popover text-foreground">
        <DialogHeader>
          <DialogTitle className="text-white">Log session</DialogTitle>
          <DialogDescription>
            How did you feel? Pick an emoji and add notes if you like.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Feeling</p>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFeeling(emoji)}
                  className={`flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border text-2xl transition-all focus:outline-none focus:ring-2 focus:ring-[#FF007F] focus:ring-offset-2 focus:ring-offset-background ${
                    feeling === emoji
                      ? 'border-[#FF007F] bg-[#FF007F]/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-muted-foreground">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go?"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-[#FF007F] focus:outline-none focus:ring-2 focus:ring-[#FF007F]/30"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] flex-1 border-white/10 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            className="min-h-[44px] flex-1 bg-[#FF007F] hover:bg-[#ff3399] sm:flex-initial"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
