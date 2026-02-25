const REMINDER_TIME_KEY = 'corequeen_reminder_time'
const SOUND_ENABLED_KEY = 'corequeen_sound_enabled'
const THEME_KEY = 'corequeen_theme'

export function getReminderTime(): string | null {
  try {
    return localStorage.getItem(REMINDER_TIME_KEY)
  } catch {
    return null
  }
}

export function setReminderTime(value: string | null) {
  try {
    if (value) localStorage.setItem(REMINDER_TIME_KEY, value)
    else localStorage.removeItem(REMINDER_TIME_KEY)
  } catch {
    // ignore
  }
}

export function getSoundEnabled(): boolean {
  try {
    const v = localStorage.getItem(SOUND_ENABLED_KEY)
    return v !== 'false'
  } catch {
    return true
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false')
  } catch {
    // ignore
  }
}

export type Theme = 'dark' | 'light'

export function getTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore
  }
}
