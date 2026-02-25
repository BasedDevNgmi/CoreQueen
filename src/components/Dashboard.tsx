import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { WorkoutDay } from '@/data/workouts'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface DashboardProps {
  schedule: WorkoutDay[]
  onSelectDay: (day: WorkoutDay) => void
}

export function Dashboard({ schedule, onSelectDay }: DashboardProps) {
  return (
    <motion.div
      className="mx-auto max-w-2xl space-y-6 px-4 py-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
          CoreQueen
        </h1>
        <p className="mt-2 text-muted-foreground">3× per week — controle & ademhaling</p>
      </motion.div>

      <motion.div className="grid gap-4 sm:grid-cols-1" variants={container}>
        {schedule.map((day) => (
          <motion.div key={day.id} variants={item}>
            <Card
              className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-[#FF007F]/40 hover:bg-white/10"
              onClick={() => onSelectDay(day)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                  <Dumbbell className="size-5 text-[#FF007F]" />
                  {day.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {day.exercises.length} exercises
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
