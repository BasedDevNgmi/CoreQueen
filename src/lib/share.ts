import { t } from '@/lib/i18n'

function formatShareDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
}

export function buildWorkoutSummaryText(opts: {
  exerciseCount: number
  feeling?: string
  date?: Date
}): string {
  const date = opts.date ?? new Date()
  const part = `${t('share.appName')} – ${formatShareDate(date)} – ${opts.exerciseCount} ${t('share.exercises')}`
  return opts.feeling ? `${part} – ${t('share.feeling')} ${opts.feeling}` : part
}

export async function shareWorkoutSummary(opts: {
  exerciseCount: number
  feeling?: string
  date?: Date
}): Promise<void> {
  const text = buildWorkoutSummaryText(opts)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: t('share.appName'),
        text,
      })
      return
    } catch {
      // User cancelled or share failed; fall back to copy
    }
  }
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // ignore
  }
}
