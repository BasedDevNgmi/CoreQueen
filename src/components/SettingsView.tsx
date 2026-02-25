import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getReminderTime,
  setReminderTime,
  getSoundEnabled,
  setSoundEnabled,
  getTheme,
  setTheme,
  getSystemPrefersDark,
  type Theme,
} from '@/lib/settings'
import type { Locale } from '@/lib/settings'
import { useTranslation } from '@/lib/i18n'

interface SettingsViewProps {
  onBack: () => void
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
    root.classList.remove('dark')
  } else if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    const dark = getSystemPrefersDark()
    root.classList.toggle('dark', dark)
    root.classList.toggle('light', !dark)
  }
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { t, locale, setLocale: setLocaleState } = useTranslation()
  const [reminderTime, setReminderTimeState] = useState(getReminderTime() ?? '')
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled())
  const [theme, setThemeState] = useState<Theme>(getTheme())

  useEffect(() => {
    applyThemeToDocument(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyThemeToDocument('system')
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [theme])

  const handleReminderChange = (value: string) => {
    setReminderTimeState(value)
    setReminderTime(value || null)
  }

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabledState(enabled)
    setSoundEnabled(enabled)
  }

  const handleThemeChange = (next: Theme) => {
    setThemeState(next)
    setTheme(next)
  }

  const handleLocaleChange = (next: Locale) => {
    setLocaleState(next)
  }

  const segment = (_key: Theme | Locale, active: boolean) =>
    `min-h-[44px] rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(255,0,127,0.3)]'
        : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10'
    }`

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8 flex min-h-[44px] items-center justify-between sm:mb-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="-ml-2 text-muted-foreground hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{t('settings.title')}</h2>
        <div className="w-9" />
      </header>

      <div className="space-y-8 sm:space-y-10">
        {/* Reminder */}
        <section className="rounded-2xl border border-border/80 bg-card/50 p-5 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
          <label className="block text-sm font-semibold text-foreground">
            {t('settings.reminderLabel')}
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => handleReminderChange(e.target.value)}
            className="mt-3 min-h-[48px] w-full rounded-xl border border-input bg-background/80 px-4 py-3 text-base text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/10 dark:bg-white/5"
          />
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            {t('settings.reminderHint')}
          </p>
        </section>

        {/* Sound */}
        <section className="flex min-h-[56px] items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/50 px-5 py-4 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:px-6">
          <span className="text-sm font-semibold text-foreground">{t('settings.soundHaptic')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={() => handleSoundChange(!soundEnabled)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
              soundEnabled ? 'bg-primary shadow-[0_0_14px_rgba(255,0,127,0.4)]' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                soundEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </section>

        {/* Theme */}
        <section className="rounded-2xl border border-border/80 bg-card/50 p-5 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
          <p className="mb-4 text-sm font-semibold text-foreground">{t('settings.theme')}</p>
          <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10 dark:bg-black/20">
            {(['dark', 'light', 'system'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleThemeChange(mode)}
                className={segment(mode, theme === mode)}
              >
                {mode === 'dark' ? t('settings.dark') : mode === 'light' ? t('settings.light') : t('settings.system')}
              </button>
            ))}
          </div>
        </section>

        {/* Language */}
        <section className="rounded-2xl border border-border/80 bg-card/50 p-5 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-6">
          <p className="mb-4 text-sm font-semibold text-foreground">{t('settings.language')}</p>
          <div className="inline-flex gap-2 rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10 dark:bg-black/20">
            <button
              type="button"
              onClick={() => handleLocaleChange('nl')}
              className={segment('nl', locale === 'nl')}
            >
              {t('settings.nl')}
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange('en')}
              className={segment('en', locale === 'en')}
            >
              {t('settings.en')}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
