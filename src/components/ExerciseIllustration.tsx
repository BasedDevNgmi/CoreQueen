

// Lazy load the animations so they only parse when needed
const DeadBugAnim = lazy(() => import('./illustrations/DeadBugAnim').then(m => ({ default: m.DeadBugAnim })))
const GluteBridgeAnim = lazy(() => import('./illustrations/GluteBridgeAnim').then(m => ({ default: m.GluteBridgeAnim })))
const PlankAnim = lazy(() => import('./illustrations/PlankAnim').then(m => ({ default: m.PlankAnim })))
const BirdDogAnim = lazy(() => import('./illustrations/BirdDogAnim').then(m => ({ default: m.BirdDogAnim })))
const HollowBodyAnim = lazy(() => import('./illustrations/HollowBodyAnim').then(m => ({ default: m.HollowBodyAnim })))
const RussianTwistsAnim = lazy(() => import('./illustrations/RussianTwistsAnim').then(m => ({ default: m.RussianTwistsAnim })))

const ANIMATION_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    DeadBugAnim,
    GluteBridgeAnim,
    PlankAnim,
    BirdDogAnim,
    HollowBodyAnim,
    RussianTwistsAnim,
}

export function ExerciseIllustration({
    animationComponent,
    fallbackImageUrl,
    alt
}: {
    animationComponent?: string
    fallbackImageUrl?: string
    alt: string
}) {
    if (animationComponent && ANIMATION_MAP[animationComponent]) {
        const Component = ANIMATION_MAP[animationComponent]
        return (
            <div className="w-full h-48 bg-white rounded-xl border border-border flex items-center justify-center overflow-hidden">
                <Suspense fallback={<div className="w-full h-full bg-muted animate-pulse" />}>
                    <Component className="w-full h-full max-w-[160px]" />
                </Suspense>
            </div>
        )
    }

    if (fallbackImageUrl) {
        return (
            <div className="w-full h-48 bg-muted rounded-xl border border-border flex items-center justify-center overflow-hidden">
                <img src={fallbackImageUrl} alt={alt} className="w-full h-full object-cover mix-blend-multiply" />
            </div>
        )
    }

    return null
}
