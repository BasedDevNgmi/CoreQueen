import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function BirdDogAnim({ className }: { className?: string }) {
    // Static: Left Arm, Right Leg planted on floor. Head & Torso mostly static.
    // Animated: Right Arm and Left Leg extending out, then pulling in.
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

                {/* Static Left Arm (Planted) */}
                <path d="M 70,110 L 60,155 L 55,155" className="text-charcoal opacity-40" />

                {/* Static Right Leg (Planted Knee) */}
                <path d="M 120,110 L 130,155 L 140,155" className="text-charcoal opacity-40" />

                {/* Static Head & Torso */}
                <circle cx="50" cy="100" r="8" className="text-charcoal" />
                <path d="M 60,110 L 120,110" className="text-charcoal" />

                {/* Animated Right Arm (Extending forward) */}
                <motion.path
                    className="text-primary"
                    animate={{
                        d: [
                            "M 60,110 L 50,155 L 45,155", // Start: Hand on floor
                            "M 60,110 L 25,100", // End: Arm extended straight out
                            "M 60,110 L 50,155 L 45,155", // Return
                        ]
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />

                {/* Animated Left Leg (Extending backward) */}
                <motion.path
                    className="text-primary"
                    animate={{
                        d: [
                            "M 120,110 L 140,155 L 150,155", // Start: Knee on floor
                            "M 120,110 L 165,100", // End: Leg extended straight back
                            "M 120,110 L 140,155 L 150,155", // Return
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
