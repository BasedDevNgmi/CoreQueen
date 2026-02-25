import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getReminderTime, setReminderTime, getSoundEnabled, setSoundEnabled, getTheme, setTheme, type Theme } from '@/lib/settings'

interface SettingsViewProps {
  onBack: () => void
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const [reminderTime, setReminderTimeState] = useState(getReminderTime() ?? '')
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled())
  const [theme, setThemeState] = useState<Theme>(getTheme())

  useEffect(() => {
    setReminderTimeState(getReminderTime() ?? '')
    setSoundEnabledState(getSoundEnabled())
    setThemeState(getTheme())
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const handleReminderChange = (value: string) => {
    setReminderTimeState(value)
    setReminderTime(value || null)
  }

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabledState(enabled)
    setSoundEnabled(enabled)
  }

  const handleThemeChange = (t: Theme) => {
    setThemeState(t)
    setTheme(t)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
      <div className="mb-4 flex min-h-[44px] items-center justify-between sm:mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-bold text-foreground sm:text-xl">Settings</h2>
        <div className="w-9" />
      </div>

      <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            Reminder time (workout days)
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => handleReminderChange(e.target.value)}
            className="mt-2 min-h-[44px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            You’ll see an in-app reminder when you open the app after this time on Mon/Wed/Fri.
          </p>
        </div>
        <div className="flex min-h-[44px] items-center justify-between gap-4">
          <span className="text-sm font-medium text-foreground">Sound & haptic on completion</span>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => handleSoundChange(!soundEnabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#FF007F] focus:ring-offset-2 focus:ring-offset-background sm:h-6 sm:w-11 ${
              soundEnabled ? 'bg-[#FF007F]' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition sm:h-4 sm:w-4 ${
                soundEnabled ? 'left-7 sm:left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
        <div className="flex min-h-[44px] flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Theme</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`min-h-[40px] rounded-lg px-4 py-2 text-sm ${theme === 'dark' ? 'bg-[#FF007F] text-white' : 'bg-white/10 text-muted-foreground hover:bg-white/15'}`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`min-h-[40px] rounded-lg px-4 py-2 text-sm ${theme === 'light' ? 'bg-[#FF007F] text-white' : 'bg-white/10 text-muted-foreground hover:bg-white/15'}`}
            >
              Light
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
