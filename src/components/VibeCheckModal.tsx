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
            icon: <BatteryWarning className="size-8 mb-3 text-muted-foreground" />,
            label: 'Drained',
            desc: 'Need something gentle',
        },
        {
            id: 'balanced',
            icon: <BatteryMedium className="size-8 mb-3 text-muted-foreground" />,
            label: 'Balanced',
            desc: 'Ready for the normal routine',
        },
        {
            id: 'unstoppable',
            icon: <BatteryFull className="size-8 mb-3 text-foreground" />,
            label: 'Unstoppable',
            desc: 'Let\'s crush it',
        },
    ] as const

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-md bg-black/20"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-full max-w-lg card-minimal rounded-[2rem] p-8 text-center relative overflow-hidden bg-white"
                    >
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
                                        ? 'border-charcoal ring-1 ring-charcoal bg-muted/30'
                                        : 'border-border hover:border-muted-foreground/30 bg-white'
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
