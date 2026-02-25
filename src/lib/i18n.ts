import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getLocale, setLocale as persistLocale, type Locale } from '@/lib/settings'

export type { Locale }

const translations: Record<Locale, Record<string, string>> = {
  nl: {
    'app.pendingLogsOne': '1 log in de wachtrij — wordt gesynchroniseerd zodra je online bent',
    'app.pendingLogsMany': 'logs in de wachtrij — wordt gesynchroniseerd zodra je online bent',
    'app.syncNow': 'Nu syncen',
    'dashboard.title': 'Core Routine',
    'dashboard.heroThisWeek': 'DEZE WEEK',
    'dashboard.heroYourCore': 'Jouw Core',
    'dashboard.heroRoutine': 'Routine',
    'dashboard.heroDesc': 'Drie dagen per week. Kort, effectief, en speciaal voor jou ontworpen. Zet hem op!',
    'dashboard.weeklyProgress': 'WEKELIJKSE VOORTGANG',
    'dashboard.dayLabel': 'DAG',
    'dashboard.duration15': '15 min',
    'dashboard.intensityLight': 'Licht',
    'dashboard.intensityMedium': 'Medium',
    'dashboard.intensityHard': 'Zwaar',
    'dashboard.workout': 'Workout',
    'nav.home': 'HOME',
    'nav.history': 'GESCHIEDENIS',
    'dashboard.history': 'Geschiedenis',
    'dashboard.logRest': 'Log rust',
    'calendar.mon': 'MA',
    'calendar.tue': 'DI',
    'calendar.wed': 'WO',
    'calendar.thu': 'DO',
    'calendar.fri': 'VR',
    'calendar.sat': 'ZA',
    'calendar.sun': 'ZO',
    'workout.back': 'Terug',
    'workout.exercises': 'Oefeningen',
    'workout.logSession': 'Log sessie',
    'workout.rest': 'Rust',
    'workout.skip': 'Overslaan',
    'history.title': 'Geschiedenis',
    'history.json': 'JSON',
    'history.csv': 'CSV',
    'history.loading': 'Laden…',
    'history.empty': 'Nog geen sessies. Log een workout om ze hier te zien.',
    'history.exercises': 'oefeningen',
    'settings.title': 'Instellingen',
    'settings.reminderLabel': 'Herinneringstijd (workoutdagen)',
    'settings.reminderHint': 'Je ziet een herinnering in de app wanneer je de app na dit tijdstip opent op ma/wo/vr.',
    'settings.soundHaptic': 'Geluid & trilling bij voltooien',
    'settings.theme': 'Thema',
    'settings.dark': 'Donker',
    'settings.light': 'Licht',
    'settings.system': 'Systeem',
    'settings.language': 'Taal',
    'settings.nl': 'NL',
    'settings.en': 'EN',
    'logSession.title': 'Log sessie',
    'logSession.description': 'Hoe voelde je je? Kies een emoji en voeg eventueel notities toe.',
    'logSession.feeling': 'Gevoel',
    'logSession.notes': 'Notities (optioneel)',
    'logSession.notesPlaceholder': 'Hoe ging het?',
    'logSession.cancel': 'Annuleren',
    'logSession.save': 'Opslaan',
    'logSession.saving': 'Opslaan…',
    'exerciseDetail.why': 'Waarom',
    'exerciseDetail.cues': 'Cues',
    'tour.step1Title': 'Je week',
    'tour.step1Body': 'Dit is je 3× per week schema. Maandag, woensdag en vrijdag zijn workoutdagen.',
    'tour.step2Title': 'Tik om te starten',
    'tour.step2Body': 'Tik op een workoutdag om je oefenlijst te openen. Rustdagen zijn voor herstel.',
    'tour.step3Title': 'Vink af & log',
    'tour.step3Body': 'Vink elke oefening af (met een feestje!), tik daarna op "Log sessie" om op te slaan hoe je je voelde.',
    'tour.next': 'Volgende',
    'tour.done': 'Klaar',
    'share.appName': 'Core Routine',
    'share.feeling': 'gevoel',
    'share.exercises': 'oefeningen',
    'vibe.title': 'Energie Check',
    'vibe.subtitle': 'Luister naar je lichaam. Hoe voel je je vandaag?',
    'vibe.drained': 'Uitgeput',
    'vibe.drainedDesc': 'Heb iets rustigs nodig',
    'vibe.balanced': 'Gezond',
    'vibe.balancedDesc': 'Klaar voor de normale routine',
    'vibe.unstoppable': 'Niet te stoppen',
    'vibe.unstoppableDesc': 'Laten we knallen',
    'app.restorativeSession': 'Herstellende Sessie',
  },
  en: {
    'app.pendingLogsOne': '1 log pending — will sync when online',
    'app.pendingLogsMany': 'logs pending — will sync when online',
    'app.syncNow': 'Sync now',
    'dashboard.title': 'Core Routine',
    'dashboard.heroThisWeek': 'THIS WEEK',
    'dashboard.heroYourCore': 'Your Core',
    'dashboard.heroRoutine': 'Routine',
    'dashboard.heroDesc': 'Three days a week. Short, effective, and designed just for you. You\'ve got this!',
    'dashboard.weeklyProgress': 'WEEKLY PROGRESS',
    'dashboard.dayLabel': 'DAY',
    'dashboard.duration15': '15 min',
    'dashboard.intensityLight': 'Light',
    'dashboard.intensityMedium': 'Medium',
    'dashboard.intensityHard': 'Hard',
    'dashboard.workout': 'Workout',
    'nav.home': 'HOME',
    'nav.history': 'HISTORY',
    'dashboard.history': 'History',
    'dashboard.logRest': 'Log rest',
    'calendar.mon': 'Mon',
    'calendar.tue': 'Tue',
    'calendar.wed': 'Wed',
    'calendar.thu': 'Thu',
    'calendar.fri': 'Fri',
    'calendar.sat': 'Sat',
    'calendar.sun': 'Sun',
    'workout.back': 'Back',
    'workout.exercises': 'Exercises',
    'workout.logSession': 'Log session',
    'workout.rest': 'Rest',
    'workout.skip': 'Skip',
    'history.title': 'History',
    'history.json': 'JSON',
    'history.csv': 'CSV',
    'history.loading': 'Loading…',
    'history.empty': 'No sessions yet. Log a workout to see it here.',
    'history.exercises': 'exercises',
    'settings.title': 'Settings',
    'settings.reminderLabel': 'Reminder time (workout days)',
    'settings.reminderHint': "You'll see an in-app reminder when you open the app after this time on Mon/Wed/Fri.",
    'settings.soundHaptic': 'Sound & haptic on completion',
    'settings.theme': 'Theme',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.system': 'System',
    'settings.language': 'Language',
    'settings.nl': 'NL',
    'settings.en': 'EN',
    'logSession.title': 'Log session',
    'logSession.description': 'How did you feel? Pick an emoji and add notes if you like.',
    'logSession.feeling': 'Feeling',
    'logSession.notes': 'Notes (optional)',
    'logSession.notesPlaceholder': 'How did it go?',
    'logSession.cancel': 'Cancel',
    'logSession.save': 'Save',
    'logSession.saving': 'Saving…',
    'exerciseDetail.why': 'Why',
    'exerciseDetail.cues': 'Cues',
    'tour.step1Title': 'Your week',
    'tour.step1Body': 'This is your 3× per week schedule. Monday, Wednesday, and Friday are workout days.',
    'tour.step2Title': 'Tap to start',
    'tour.step2Body': 'Tap a workout day to open your exercise list. Rest days are for recovery.',
    'tour.step3Title': 'Check off & log',
    'tour.step3Body': 'Check off each exercise (with a little celebration!), then tap "Log session" to save how you feel.',
    'tour.next': 'Next',
    'tour.done': 'Done',
    'share.appName': 'Core Routine',
    'share.feeling': 'feeling',
    'share.exercises': 'exercises',
    'vibe.title': 'Energy Check',
    'vibe.subtitle': 'Listen to your body. How are you feeling today?',
    'vibe.drained': 'Drained',
    'vibe.drainedDesc': 'Need something gentle',
    'vibe.balanced': 'Balanced',
    'vibe.balancedDesc': 'Ready for the normal routine',
    'vibe.unstoppable': 'Unstoppable',
    'vibe.unstoppableDesc': 'Let\'s crush it',
    'app.restorativeSession': 'Restorative Session',
  },
}

export function t(key: string): string {
  const locale = getLocale()
  return translations[locale][key] ?? key
}

/** For Intl APIs (e.g. toLocaleDateString). */
export function getLocaleForIntl(): string {
  return getLocale() === 'en' ? 'en-GB' : 'nl-NL'
}

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  localeForIntl: string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale)
  const setLocale = useCallback((next: Locale) => {
    persistLocale(next)
    setLocaleState(next)
  }, [])
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => translations[locale][key] ?? key,
      localeForIntl: locale === 'en' ? 'en-GB' : 'nl-NL',
    }),
    [locale, setLocale]
  )
  return React.createElement(I18nContext.Provider, { value }, children)
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return {
      locale: getLocale(),
      setLocale: persistLocale,
      t,
      localeForIntl: getLocaleForIntl(),
    }
  }
  return ctx
}
