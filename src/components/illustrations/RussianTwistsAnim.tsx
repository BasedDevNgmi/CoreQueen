import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function RussianTwistsAnim({ className }: { className?: string }) {
    // Static: Butt on floor, Knees bent, feet hovering
    // Animated: Torso and Arms twisting side to side
    return (
        <div className={cn("relative w-full aspect-square flex items-center justify-center bg-transparent", className)}>
            <svg
                viewBox="0 0 200 200"
                className="w-full h-full max-w-[200px] overflow-visible drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* Floor Line */}
                <line x1="20" y1="160" x2="180" y2="160" strokeOpacity="0.2" strokeWidth="1" />

                {/* Static Lower Body (Butt on floor, Knees bent) */}
                <path d="M 80,155 C 90,155 120,130 130,120 L 150,140" className="text-charcoal" />

                {/* Static Head (Moves slightly but mostly anchored to torso) */}
                <motion.circle
                    cx="60" cy="80" r="8" className="text-charcoal"
                    animate={{
                        cx: [60, 55, 60, 65, 60]
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />

                {/* Animated Torso & Arms (Twisting side to side) */}
                <motion.path
                    className="text-primary"
                    animate={{
                        d: [
                            "M 65,90 C 70,120 75,145 80,155 M 65,100 L 95,110", // Center
                            "M 60,95 C 65,120 75,145 80,155 M 65,100 L 70,125", // Twist Left (hands down)
                            "M 65,90 C 70,120 75,145 80,155 M 65,100 L 95,110", // Center
                            "M 70,95 C 75,120 75,145 80,155 M 65,100 L 110,120", // Twist Right (hands extended over knees)
                            "M 65,90 C 70,120 75,145 80,155 M 65,100 L 95,110", // Center
                        ]
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />
            </svg>
        </div>
    )
}
