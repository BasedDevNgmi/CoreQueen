import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ExerciseDatum } from '@/types/log'

const USER_ID = 'default'

export function useLogs() {
  const insertLog = useCallback(
    async (exerciseData: ExerciseDatum[], notes?: string, feeling?: string) => {
      if (!supabase) return { error: new Error('Supabase not configured') }
      const row = {
        user_id: USER_ID,
        exercise_data: exerciseData,
        notes: notes ?? null,
        feeling: feeling ?? null,
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
const { error } = await supabase.from('logs').insert(row as any)
      return { error }
    },
    []
  )
  return { insertLog }
}
