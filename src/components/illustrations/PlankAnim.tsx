import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function PlankAnim({ className }: { className?: string }) {
    // Static: Forearms and Toes on floor.
    // Animated: Body drops slightly, then core tightens and lifts up into perfect plank.
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

                {/* Static Forearms / Elbows */}
                <path d="M 40,156 L 60,156 L 75,115" className="text-charcoal" />

                {/* Static Head */}
                <circle cx="85" cy="110" r="8" className="text-charcoal" />

                {/* Static Toes */}
                <path d="M 160,156 L 165,156" className="text-charcoal" />

                {/* Animated Torso/Legs (Core engaging) */}
                <motion.path
                    className="text-primary"
                    animate={{
                        d: [
                            "M 75,115 C 110,135 140,135 160,156", // Start: Hips sagging slightly
                            "M 75,115 C 110,120 140,130 160,156", // End: Core engaged, straight line
                            "M 75,115 C 110,135 140,135 160,156", // Return
                        ]
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />
            </svg>
        </div>
    )
}
