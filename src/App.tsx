import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Dashboard } from '@/components/Dashboard'
import { WorkoutView } from '@/components/WorkoutView'
import { WORKOUT_SCHEDULE } from '@/data/workouts'
import type { WorkoutDay } from '@/data/workouts'

type View = 'dashboard' | 'workout'

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)

  const handleSelectDay = (day: WorkoutDay) => {
    setSelectedDay(day)
    setView('workout')
  }

  const handleBack = () => {
    setView('dashboard')
    setSelectedDay(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard
            key="dashboard"
            schedule={WORKOUT_SCHEDULE}
            onSelectDay={handleSelectDay}
          />
        )}
        {view === 'workout' && selectedDay && (
          <WorkoutView
            key={selectedDay.id}
            day={selectedDay}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
