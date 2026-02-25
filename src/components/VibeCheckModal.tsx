import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BatteryWarning, BatteryMedium, BatteryFull } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface VibeCheckModalProps {
    open: boolean
    onComplete: (vibe: 'drained' | 'balanced' | 'unstoppable') => void
}

export function VibeCheckModal({ open, onComplete }: VibeCheckModalProps) {
    const { t } = useTranslation()
    const [selected, setSelected] = useState<'drained' | 'balanced' | 'unstoppable' | null>(null)

    const vibes = [
        {
            id: 'drained',
            icon: <BatteryWarning className="size-8 mb-3 opacity-80" />,
            label: 'Drained',
            desc: 'Need something gentle',
            color: 'from-[rgba(255,255,255,0.1)] to-[rgba(218,168,206,0.2)]',
        },
        {
            id: 'balanced',
            icon: <BatteryMedium className="size-8 mb-3 opacity-80" />,
            label: 'Balanced',
            desc: 'Ready for the normal routine',
            color: 'from-[rgba(255,255,255,0.15)] to-[rgba(212,155,184,0.3)]',
        },
        {
            id: 'unstoppable',
            icon: <BatteryFull className="size-8 mb-3 opacity-80" />,
            label: 'Unstoppable',
            desc: 'Let\'s crush it',
            color: 'from-[rgba(255,255,255,0.2)] to-[rgba(178,152,205,0.4)]',
        },
    ] as const

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-[40px] bg-black/40"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full max-w-lg card-glass rounded-[2rem] p-8 text-center relative overflow-hidden"
                    >
                        {/* Soft inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                        <h2 className="font-display text-4xl mb-2 text-foreground relative z-10">{t('vibe.title')}</h2>
                        <p className="text-muted-foreground mb-8 text-lg relative z-10">{t('vibe.subtitle')}</p>

                        <div className="grid gap-4 sm:grid-cols-3 relative z-10">
                            {vibes.map((v) => (
                                <motion.button
                                    key={v.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setSelected(v.id)
                                        setTimeout(() => onComplete(v.id), 400) // slight delay for animation
                                    }}
                                    className={`relative flex flex-col items-center justify-center rounded-2xl p-6 text-center transition-all duration-300 border ${selected === v.id
                                        ? 'border-primary ring-2 ring-primary/50 bg-gradient-to-b ' + v.color
                                        : 'border-white/10 hover:border-white/30 bg-white/5'
                                        }`}
                                >
                                    {v.icon}
                                    <span className="font-bold text-lg mb-1">{t(`vibe.${v.id}`)}</span>
                                    <span className="text-xs text-muted-foreground leading-tight">{t(`vibe.${v.id}Desc`)}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
