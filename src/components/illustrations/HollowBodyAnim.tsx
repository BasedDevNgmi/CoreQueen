import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function HollowBodyAnim({ className }: { className?: string }) {
    // Static: Low back pressed into the floor.
    // Animated: Arms and Legs lowering and raising slightly.
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

                {/* Static Low Back (Touching Floor) */}
                <path d="M 90,155 L 110,155" className="text-charcoal" />

                {/* Static Head */}
                <circle cx="50" cy="135" r="8" className="text-charcoal" />

                {/* Animated Upper Body (Shoulders and Arms) */}
                <motion.path
                    className="text-primary"
                    animate={{
                        d: [
                            "M 90,155 C 80,150 60,145 30,120", // Start: Held low
                            "M 90,155 C 80,145 60,135 30,100", // End: Held higher
                            "M 90,155 C 80,150 60,145 30,120", // Return
                        ]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />

                {/* Animated Lower Body (Legs straight out) */}
                <motion.path
                    className="text-primary"
                    animate={{
                        d: [
                            "M 110,155 L 170,145", // Start: Held low
                            "M 110,155 L 170,125", // End: Held higher
                            "M 110,155 L 170,145", // Return
                        ]
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />
            </svg>
        </div>
    )
}
