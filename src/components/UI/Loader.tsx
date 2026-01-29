import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';

export function Loader() {
    const { progress } = useProgress();

    return (
        <AnimatePresence>
            {progress < 100 && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-deep-charcoal text-white pointer-events-none"
                >
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.2 }}
                        />
                    </div>
                    <div className="mt-4 font-display text-sm tracking-widest text-white/50 uppercase">
                        Loading NeuroAtlas
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
