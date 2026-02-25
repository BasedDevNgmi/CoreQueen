import { supabase } from '@/lib/supabase'

const PENDING_KEY = 'coreroutine_pending_logs'

export interface PendingLogRow {
  user_id: string
  exercise_data: { name: string; completed: boolean }[]
  notes: string | null
  feeling: string | null
}

export function getPendingLogs(): PendingLogRow[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PendingLogRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function setPendingLogs(logs: PendingLogRow[]) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(logs))
  } catch {
    // ignore
  }
}

export function addPendingLog(row: PendingLogRow) {
  const logs = getPendingLogs()
  logs.push(row)
  setPendingLogs(logs)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('coreroutine_pending_change'))
  }
}

export function getPendingCount(): number {
  return getPendingLogs().length
}

export async function flushPendingLogs(): Promise<{ flushed: number; remaining: number }> {
  const logs = getPendingLogs()
  if (logs.length === 0 || !supabase) return { flushed: 0, remaining: 0 }
  let flushed = 0
  const remaining: PendingLogRow[] = []
  for (const row of logs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('logs').insert(row as any)
    if (error) {
      remaining.push(row)
    } else {
      flushed++
    }
  }
  setPendingLogs(remaining)
  return { flushed, remaining: remaining.length }
}
