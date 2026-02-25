import type { ExerciseDatum } from '@/types/log'

export interface WorkoutExercise {
  name: string
  setsReps: string
  why?: string
}

export interface WorkoutDay {
  id: string
  label: string
  exercises: WorkoutExercise[]
}

/** Zelfde workout 3× per week (Ma – Wo – Vr). Focus: controle en ademhaling. */
const CORE_WORKOUT: WorkoutExercise[] = [
  {
    name: 'Dead Bug',
    setsReps: '3 × 12 (totaal)',
    why: 'Houdt de rug plat op de grond; traint diepe buikspieren.',
  },
  {
    name: 'Bird Dog',
    setsReps: '3 × 10 (totaal)',
    why: 'Versterkt de achterkant en core zonder compressie.',
  },
  {
    name: 'Kettlebell Suitcase Carry',
    setsReps: '3 × 30 m per kant',
    why: 'Dwingt de core om recht te blijven tegen gewicht in.',
  },
  {
    name: 'Modified Plank',
    setsReps: '3 × 30–45 sec',
    why: 'Focus op billen knijpen; te zwaar? Dan op de knieën.',
  },
  {
    name: 'Glute Bridges',
    setsReps: '3 × 15',
    why: 'Sterke billen = minder belasting op de onderrug.',
  },
]

export const WORKOUT_SCHEDULE: WorkoutDay[] = [
  { id: 'ma', label: 'Maandag', exercises: CORE_WORKOUT },
  { id: 'wo', label: 'Woensdag', exercises: CORE_WORKOUT },
  { id: 'vr', label: 'Vrijdag', exercises: CORE_WORKOUT },
]

export function toExerciseData(
  exercises: WorkoutExercise[],
  completed: boolean[]
): ExerciseDatum[] {
  return exercises.map((e, i) => ({ name: e.name, completed: completed[i] ?? false }))
}
