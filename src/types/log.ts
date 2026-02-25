export interface ExerciseDatum {
  name: string
  completed: boolean
}

export interface LogRow {
  id?: string
  created_at?: string
  user_id: string
  exercise_data: ExerciseDatum[]
  notes?: string
  feeling?: string
}
