import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function DeadBugAnim({ className }: { className?: string }) {
    // A modern, continuous-line abstract representation of the Dead Bug.
    // We have a static torso/head, and we animate the right arm and left leg.

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
                {/* Static Base: Floor Line */}
                <line x1="20" y1="160" x2="180" y2="160" strokeOpacity="0.2" strokeWidth="1" />

                {/* Static Body: Head, Torso, resting Left Arm, resting Right Leg */}
                <path
                    d="M 50,150 
             C 50,140 60,135 70,140 
             C 80,145 90,140 100,145 
             C 110,150 120,150 130,145"
                    className="text-charcoal"
                />
                {/* Head */}
                <circle cx="45" cy="145" r="8" className="text-charcoal" />

                {/* Animated Right Arm (extends back) */}
                <motion.path
                    d="M 85,140 L 70,100"
                    className="text-primary"
                    animate={{
                        d: [
                            "M 85,140 L 70,100", // Start: Arm up
                            "M 85,140 L 30,135", // End: Arm extended back behind head
                            "M 85,140 L 70,100", // Return
                        ]
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />

                {/* Animated Left Leg (extends forward) */}
                <motion.path
                    d="M 120,145 L 130,100 L 150,110" // Start: Knee bent, foot up
                    className="text-primary"
                    animate={{
                        d: [
                            "M 120,145 L 130,100 L 150,110", // Start: Knee bent
                            "M 120,145 L 150,140 L 170,140", // End: Leg straight hovering over floor
                            "M 120,145 L 130,100 L 150,110", // Return
                        ]
                    }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                    }}
                />

                {/* Static Left Arm (points straight up) */}
                <path d="M 80,140 L 90,95" className="text-charcoal opacity-40" />

                {/* Static Right Leg (knee bent) */}
                <path d="M 115,145 L 110,105 L 130,115" className="text-charcoal opacity-40" />

            </svg>
        </div>
    )
}
