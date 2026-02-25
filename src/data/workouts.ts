import type { ExerciseDatum } from '@/types/log'

export interface WorkoutExercise {
  name: string
  setsReps: string
  why?: string
  cues?: string[]
  imageUrl?: string
  videoUrl?: string
  animationComponent?: string
}

export interface WorkoutDay {
  id: string
  dayIndex: number // 0 = Mon, 1 = Tue, etc.
  title: string
  duration: string
  intensity: 'Light' | 'Medium' | 'Hard'
  exercises: WorkoutExercise[]
}

/* WEEK 1: Foundation & Stability (Activation) */
const W1_D1: WorkoutExercise[] = [
  { name: 'Dead Bug', setsReps: '3 × 12', why: 'Traint diepe buikspieren plat op de grond.', imageUrl: '/assets/exercises/dead_bug.png', videoUrl: 'https://youtube.com/shorts/IajDDSRXhOw', animationComponent: 'DeadBugAnim' },
  { name: 'Glute Bridges', setsReps: '3 × 15', why: 'Activeert billen en verlicht de onderrug.', imageUrl: '/assets/exercises/glute_bridge.png', videoUrl: 'https://youtube.com/shorts/q2O-s-Ym8C0', animationComponent: 'GluteBridgeAnim' },
  { name: 'Modified Plank (Knees)', setsReps: '3 × 30 sec', why: 'Basis uithoudingsvermogen voor de core.', imageUrl: '/assets/exercises/modified_plank.png', videoUrl: 'https://youtube.com/shorts/YeBsgzO5y88', animationComponent: 'PlankAnim' },
]
const W1_D2: WorkoutExercise[] = [
  { name: 'Bird Dog', setsReps: '3 × 10', why: 'Versterkt de achterkant en core zonder compressie.', imageUrl: '/assets/exercises/bird_dog.png', videoUrl: 'https://youtube.com/shorts/wiFNA3sqjCA', animationComponent: 'BirdDogAnim' },
  { name: 'Side Plank (Knees)', setsReps: '3 × 20 sec per kant', why: 'Traint de schuine buikspieren zachtjes.', imageUrl: '/assets/exercises/side_plank.png', videoUrl: 'https://youtube.com/shorts/K2V-xIiyqB8' },
  { name: 'Heel Taps', setsReps: '3 × 20', why: 'Isoleert lagere buikspieren.', imageUrl: '/assets/exercises/heel_taps.png', videoUrl: 'https://youtube.com/shorts/32V-NqKqQjc' },
]
const W1_D3: WorkoutExercise[] = [
  { name: 'Dead Bug', setsReps: '3 × 15', why: 'Traint diepe buikspieren plat op de grond.', imageUrl: '/assets/exercises/dead_bug.png', videoUrl: 'https://youtube.com/shorts/IajDDSRXhOw', animationComponent: 'DeadBugAnim' },
  { name: 'Kettlebell Suitcase Carry', setsReps: '3 × 30 m', why: 'Core recht houden tegen weerstand in.', imageUrl: '/assets/exercises/kettlebell_carry.png', videoUrl: 'https://youtube.com/shorts/XJ-zDtd5aN8' },
]

/* WEEK 2: Core Activation (Building) */
const W2_D1: WorkoutExercise[] = [
  { name: 'Hollow Body Hold (Bent Knees)', setsReps: '3 × 20 sec', why: 'Traint de voorste core stevig.', imageUrl: '/assets/exercises/hollow_body_hold.png', videoUrl: 'https://youtube.com/shorts/p1x8N9vF628', animationComponent: 'HollowBodyAnim' },
  { name: 'Glute Bridges (Single Leg, assisted)', setsReps: '3 × 10 per kant', why: 'Bouwt asymmetrische kracht in de bil.', imageUrl: '/assets/exercises/glute_bridge.png', videoUrl: 'https://youtube.com/shorts/5xT9cMqyJ0U', animationComponent: 'GluteBridgeAnim' },
  { name: 'Full Plank', setsReps: '3 × 30 sec', why: 'Standaard kern uithoudingsvermogen.', imageUrl: '/assets/exercises/modified_plank.png', videoUrl: 'https://youtube.com/shorts/pSHjTRCQxIw', animationComponent: 'PlankAnim' },
]
const W2_D2: WorkoutExercise[] = [...W1_D2, { name: 'Dead Bug', setsReps: '3 × 12', imageUrl: '/assets/exercises/dead_bug.png', videoUrl: 'https://youtube.com/shorts/IajDDSRXhOw', animationComponent: 'DeadBugAnim' }]
const W2_D3: WorkoutExercise[] = [...W1_D3, { name: 'Bird Dog', setsReps: '3 × 12', imageUrl: '/assets/exercises/bird_dog.png', videoUrl: 'https://youtube.com/shorts/wiFNA3sqjCA', animationComponent: 'BirdDogAnim' }]

/* WEEK 3: Progression (Intensity up) */
const W3_D1: WorkoutExercise[] = [
  { name: 'Hollow Body Hold', setsReps: '4 × 20 sec', why: 'Traint de voorste core stevig.', imageUrl: '/assets/exercises/hollow_body_hold.png', videoUrl: 'https://youtube.com/shorts/p1x8N9vF628', animationComponent: 'HollowBodyAnim' },
  { name: 'Russian Twists', setsReps: '3 × 20', why: 'Rotatiekracht voor schuine buikspieren.', imageUrl: '/assets/exercises/russian_twists.png', videoUrl: 'https://youtube.com/shorts/wkD8rjkodUI', animationComponent: 'RussianTwistsAnim' },
]
const W3_D2: WorkoutExercise[] = [...W2_D2]
const W3_D3: WorkoutExercise[] = [...W2_D3]

/* WEEK 4-6: Power & Control (We will reuse some arrays here for brevity in the plan) */

export const WORKOUT_SCHEDULE_6_WEEKS: Record<number, WorkoutDay[]> = {
  1: [
    { id: 'w1d1', dayIndex: 0, title: 'Foundation Level 1', duration: '15 min', intensity: 'Light', exercises: W1_D1 },
    { id: 'w1d2', dayIndex: 2, title: 'Stability Level 1', duration: '15 min', intensity: 'Light', exercises: W1_D2 },
    { id: 'w1d3', dayIndex: 4, title: 'Endurance Level 1', duration: '15 min', intensity: 'Medium', exercises: W1_D3 },
  ],
  2: [
    { id: 'w2d1', dayIndex: 0, title: 'Foundation Level 2', duration: '18 min', intensity: 'Medium', exercises: W2_D1 },
    { id: 'w2d2', dayIndex: 2, title: 'Stability Level 2', duration: '18 min', intensity: 'Medium', exercises: W2_D2 },
    { id: 'w2d3', dayIndex: 4, title: 'Endurance Level 2', duration: '18 min', intensity: 'Hard', exercises: W2_D3 },
  ],
  3: [
    { id: 'w3d1', dayIndex: 0, title: 'Core Power Level 1', duration: '20 min', intensity: 'Hard', exercises: W3_D1 },
    { id: 'w3d2', dayIndex: 2, title: 'Stability Level 3', duration: '20 min', intensity: 'Hard', exercises: W3_D2 },
    { id: 'w3d3', dayIndex: 4, title: 'Endurance Level 3', duration: '25 min', intensity: 'Hard', exercises: W3_D3 },
  ],
  // Cloning W3 for W4-W6 for now as placeholders. The progression logic will function identically.
  4: [
    { id: 'w4d1', dayIndex: 0, title: 'Core Power Level 2', duration: '25 min', intensity: 'Hard', exercises: W3_D1 },
    { id: 'w4d2', dayIndex: 2, title: 'Dynamic Stability', duration: '25 min', intensity: 'Hard', exercises: W3_D2 },
    { id: 'w4d3', dayIndex: 4, title: 'Peak Endurance 1', duration: '30 min', intensity: 'Hard', exercises: W3_D3 },
  ],
  5: [
    { id: 'w5d1', dayIndex: 0, title: 'Core Power Level 3', duration: '30 min', intensity: 'Hard', exercises: W3_D1 },
    { id: 'w5d2', dayIndex: 2, title: 'Dynamic Stability 2', duration: '30 min', intensity: 'Hard', exercises: W3_D2 },
    { id: 'w5d3', dayIndex: 4, title: 'Peak Endurance 2', duration: '30 min', intensity: 'Hard', exercises: W3_D3 },
  ],
  6: [
    { id: 'w6d1', dayIndex: 0, title: 'Elite Core', duration: '35 min', intensity: 'Hard', exercises: W3_D1 },
    { id: 'w6d2', dayIndex: 2, title: 'Elite Stability', duration: '35 min', intensity: 'Hard', exercises: W3_D2 },
    { id: 'w6d3', dayIndex: 4, title: 'Elite Endurance', duration: '35 min', intensity: 'Hard', exercises: W3_D3 },
  ],
}

// Fallback for types that expected the old structure
export const WORKOUT_SCHEDULE = WORKOUT_SCHEDULE_6_WEEKS[1]

/** Gentle restorative flow if the user lacks energy */
export const RESTORATIVE_FLOW: WorkoutExercise[] = [
  {
    name: 'Child\'s Pose',
    setsReps: '2 min',
    why: 'Ontspant de ademhaling en verlengt de wervelkolom.',
    cues: ['Adem naar je onderrug', 'Laat spanning los'],
  },
  {
    name: 'Cat-Cow',
    setsReps: '10-15 herhalingen',
    why: 'Maakt de wervelkolom soepel en verlicht spanning.',
    cues: ['Beweeg op je adem', 'Blijf in je comfortzone'],
  },
  {
    name: 'Supine Twist',
    setsReps: '1 min per kant',
    why: 'Milde rotatie om de ruggengraat te voeden.',
    cues: ['Houd beide schouders op de vloer', 'Ontspan in de draai'],
  },
  {
    name: 'Savasana (Corpse Pose)',
    setsReps: '3-5 min',
    why: 'Volledige rust om het lichaam te laten integreren.',
    cues: ['Voel het gewicht van je lichaam', 'Geen inspanning meer'],
  },
]

export function toExerciseData(
  exercises: WorkoutExercise[],
  completed: boolean[]
): ExerciseDatum[] {
  return exercises.map((e, i) => ({ name: e.name, completed: completed[i] ?? false }))
}
