import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toDateString } from '@/lib/calendar'
import { addPendingLog } from '@/lib/offlineLogs'
import type { ExerciseDatum, LogRow } from '@/types/log'

const USER_ID = 'default'

export function useLogs() {
  const fetchLogs = useCallback(
    async (limit = 50): Promise<LogRow[]> => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('logs')
        .select('id, created_at, feeling, notes, exercise_data')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) return []
      return (data ?? []) as LogRow[]
    },
    []
  )

  const insertLog = useCallback(
    async (exerciseData: ExerciseDatum[], notes?: string, feeling?: string) => {
      const row = {
        user_id: USER_ID,
        exercise_data: exerciseData,
        notes: notes ?? null,
        feeling: feeling ?? null,
      }
      if (!supabase) return { error: new Error('Supabase not configured') }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('logs').insert(row as any)
      if (error) {
        addPendingLog(row)
        return { error }
      }
      return { error: null }
    },
    []
  )

  const fetchLogsForDateRange = useCallback(
    async (start: Date, end: Date): Promise<{ completedDates: Set<string> }> => {
      if (!supabase) return { completedDates: new Set() }
      const startISO = new Date(start)
      startISO.setHours(0, 0, 0, 0)
      const endISO = new Date(end)
      endISO.setHours(23, 59, 59, 999)
      const { data: logs, error } = await supabase
        .from('logs')
        .select('created_at')
        .gte('created_at', startISO.toISOString())
        .lte('created_at', endISO.toISOString())
      if (error) return { completedDates: new Set() }
      const completedDates = new Set<string>()
      const rows = (logs ?? []) as { created_at: string }[]
      for (const row of rows) {
        if (row?.created_at) {
          completedDates.add(toDateString(new Date(row.created_at)))
        }
      }
      return { completedDates }
    },
    []
  )

  return { insertLog, fetchLogsForDateRange, fetchLogs }
}
