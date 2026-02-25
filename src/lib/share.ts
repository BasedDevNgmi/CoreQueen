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
  const part = `CoreQueen – ${formatShareDate(date)} – ${opts.exerciseCount} exercises`
  return opts.feeling ? `${part} – feeling ${opts.feeling}` : part
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
        title: 'CoreQueen',
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
