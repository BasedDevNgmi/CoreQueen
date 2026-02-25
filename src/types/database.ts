export interface Database {
  public: {
    Tables: {
      logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          exercise_data: { name: string; completed: boolean }[]
          notes: string | null
          feeling: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string
          exercise_data: { name: string; completed: boolean }[]
          notes?: string | null
          feeling?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          exercise_data?: { name: string; completed: boolean }[]
          notes?: string | null
          feeling?: string | null
        }
      }
    }
  }
}
