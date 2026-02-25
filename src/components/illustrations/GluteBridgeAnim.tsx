import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function GluteBridgeAnim({ className }: { className?: string }) {
    // Static: Head, shoulders, arms on floor, feet planted
    // Animated: Hips lifting up and down
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

                {/* Static Head & Shoulders */}
                <circle cx="45" cy="148" r="8" className="text-charcoal" />
                <path d="M 50,153 C 50,150 60,156 70,156" className="text-charcoal" />

                {/* Static Arms resting on floor */}
                <path d="M 60,155 L 110,155" className="text-charcoal opacity-40" />

                {/* Static Feet planted */}
                <path d="M 145,155 L 155,155" className="text-charcoal" />

                {/* Animated Torso & Legs (Hips pushing up) */}
                <motion.path
                    className="text-primary"
                    animate={{
                        d: [
                            "M 70,156 L 110,155 L 145,155", // Start: Hips on floor
                            "M 70,156 L 110,100 L 145,155", // End: Hips pressed up creating a bridge
                            "M 70,156 L 110,155 L 145,155", // Return to floor
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
