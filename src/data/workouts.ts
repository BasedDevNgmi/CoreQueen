import type { ExerciseDatum } from '@/types/log'

export interface WorkoutExercise {
  name: string
  setsReps: string
  why?: string
  cues?: string[]
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
    cues: ['Rug plat op de grond', 'Adem uit bij beweging'],
  },
  {
    name: 'Bird Dog',
    setsReps: '3 × 10 (totaal)',
    why: 'Versterkt de achterkant en core zonder compressie.',
    cues: ['Buik aanspannen', 'Rug recht houden'],
  },
  {
    name: 'Kettlebell Suitcase Carry',
    setsReps: '3 × 30 m per kant',
    why: 'Dwingt de core om recht te blijven tegen gewicht in.',
    cues: ['Schouders recht', 'Core recht tegen het gewicht'],
  },
  {
    name: 'Modified Plank',
    setsReps: '3 × 30–45 sec',
    why: 'Focus op billen knijpen; te zwaar? Dan op de knieën.',
    cues: ['Billen aanspannen', 'Te zwaar? Op de knieën'],
  },
  {
    name: 'Glute Bridges',
    setsReps: '3 × 15',
    why: 'Sterke billen = minder belasting op de onderrug.',
    cues: ['Billen knijpen bovenaan', 'Rug niet overstrekken'],
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
