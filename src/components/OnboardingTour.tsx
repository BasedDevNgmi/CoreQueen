import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const TOUR_DONE_KEY = 'corequeen_tour_done'

const STEPS = [
  { title: 'Your week', body: 'This is your 3× per week schedule. Monday, Wednesday, and Friday are workout days.' },
  { title: 'Tap to start', body: 'Tap a workout day to open your exercise list. Rest days are for recovery.' },
  { title: 'Check off & log', body: 'Check off each exercise (with a little celebration!), then tap "Log session" to save how you feel.' },
]

interface OnboardingTourProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardingTour({ open, onOpenChange }: OnboardingTourProps) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1

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
      <DialogContent className="border-white/10 bg-[#1a1a1a] text-foreground">
        <DialogHeader>
          <DialogTitle className="text-white">{STEPS[step].title}</DialogTitle>
          <DialogDescription>{STEPS[step].body}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="flex justify-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition ${
                  i === step ? 'bg-[#FF007F]' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-[#FF007F] hover:bg-[#ff3399]"
            onClick={handleNext}
          >
            {isLast ? 'Done' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function useTourDone(): boolean {
  const [done, setDone] = useState(true)
  useEffect(() => {
    try {
      setDone(localStorage.getItem(TOUR_DONE_KEY) === 'true')
    } catch {
      setDone(false)
    }
  }, [])
  return done
}

export function shouldShowTour(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(TOUR_DONE_KEY) !== 'true'
  } catch {
    return true
  }
}
