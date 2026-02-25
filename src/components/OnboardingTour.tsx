import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n'

const TOUR_DONE_KEY = 'corequeen_tour_done'

function useTourSteps() {
  const { t } = useTranslation()
  return [
    { titleKey: 'tour.step1Title' as const, bodyKey: 'tour.step1Body' as const },
    { titleKey: 'tour.step2Title' as const, bodyKey: 'tour.step2Body' as const },
    { titleKey: 'tour.step3Title' as const, bodyKey: 'tour.step3Body' as const },
  ].map((s) => ({ title: t(s.titleKey), body: t(s.bodyKey) }))
}

interface OnboardingTourProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingTour({ open, onOpenChange }: OnboardingTourProps) {
  const { t } = useTranslation()
  const steps = useTourSteps()
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      try {
        localStorage.setItem(TOUR_DONE_KEY, 'true')
      } catch {
        // ignore
      }
      onOpenChange(false)
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-popover text-foreground">
        <DialogHeader>
          <DialogTitle className="text-white">{steps[step].title}</DialogTitle>
          <DialogDescription>{steps[step].body}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="flex justify-center gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition ${
                  i === step ? 'bg-primary' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-primary hover:bg-neon-pink-hover"
            onClick={handleNext}
          >
            {isLast ? t('tour.done') : t('tour.next')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function shouldShowTour(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(TOUR_DONE_KEY) !== 'true'
  } catch {
    return true
  }
}
