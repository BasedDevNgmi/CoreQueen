import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Dashboard } from '@/components/Dashboard'
import { WORKOUT_SCHEDULE } from '@/data/workouts'
import type { WorkoutDay } from '@/data/workouts'

const WorkoutView = lazy(() =>
  import('@/components/WorkoutView').then((m) => ({ default: m.WorkoutView }))
)
const HistoryView = lazy(() =>
  import('@/components/HistoryView').then((m) => ({ default: m.HistoryView }))
)
const SettingsView = lazy(() =>
  import('@/components/SettingsView').then((m) => ({ default: m.SettingsView }))
)
import { flushPendingLogs, getPendingCount } from '@/lib/offlineLogs'
import { Button } from '@/components/ui/button'
import { OnboardingTour, shouldShowTour } from '@/components/OnboardingTour'
import { useTranslation } from '@/lib/i18n'

type View = 'dashboard' | 'workout' | 'history' | 'settings'

function App() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>('dashboard')
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)
  const [pendingCount, setPendingCount] = useState(() => getPendingCount())
  const [tourOpen, setTourOpen] = useState(false)

  useEffect(() => {
    if (shouldShowTour()) setTourOpen(true)
  }, [])

  const refreshPendingCount = useCallback(() => {
    flushPendingLogs().then((r) => setPendingCount(r.remaining))
  }, [])

  useEffect(() => {
    refreshPendingCount()
    window.addEventListener('online', refreshPendingCount)
    return () => window.removeEventListener('online', refreshPendingCount)
  }, [refreshPendingCount])

  useEffect(() => {
    const onPendingChange = () => setPendingCount(getPendingCount())
    window.addEventListener('corequeen_pending_change', onPendingChange)
    return () => window.removeEventListener('corequeen_pending_change', onPendingChange)
  }, [])

  const handleSyncNow = refreshPendingCount

  const handleSelectDay = useCallback((day: WorkoutDay) => {
    setSelectedDay(day)
    setView('workout')
  }, [])

  const handleBack = useCallback(() => {
    setView('dashboard')
    setSelectedDay(null)
  }, [])

  const handleOpenHistory = useCallback(() => setView('history'), [])
  const handleOpenTour = useCallback(() => setTourOpen(true), [])
  const handleOpenSettings = useCallback(() => setView('settings'), [])
  const handleBackToDashboard = useCallback(() => setView('dashboard'), [])

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pt-[env(safe-area-inset-top)]">
      {pendingCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-primary/20 px-4 py-2 text-sm text-white sm:flex-nowrap">
          <span className="min-w-0 flex-1">
            {pendingCount === 1 ? t('app.pendingLogsOne') : `${pendingCount} ${t('app.pendingLogsMany')}`}
          </span>
          <Button size="sm" variant="outline" className="shrink-0 border-white/30" onClick={handleSyncNow}>
            {t('app.syncNow')}
          </Button>
        </div>
      )}
      <main className="pb-[env(safe-area-inset-bottom)]">
        <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading…</div>}>
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
            <Dashboard
            key="dashboard"
            schedule={WORKOUT_SCHEDULE}
            onSelectDay={handleSelectDay}
            onOpenHistory={handleOpenHistory}
            onOpenTour={handleOpenTour}
            onOpenSettings={handleOpenSettings}
          />
        )}
        {view === 'workout' && selectedDay && (
          <WorkoutView
            key={selectedDay.id}
            day={selectedDay}
            onBack={handleBack}
          />
        )}
        {view === 'history' && (
          <HistoryView key="history" onBack={handleBackToDashboard} />
        )}
        {view === 'settings' && (
          <SettingsView key="settings" onBack={handleBackToDashboard} />
        )}
          </AnimatePresence>
        </Suspense>
      </main>
      <OnboardingTour open={tourOpen} onOpenChange={setTourOpen} />
    </div>
  )
}

export default App
