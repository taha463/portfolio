import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene7_Outro() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center bg-[#0F1720]" {...sceneTransitions.morphExpand}>
      <div className="text-center z-10 px-8 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -90 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0, rotate: -90 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 bg-[#F05118] rounded-full mx-auto mb-10 flex items-center justify-center text-white"
        >
          <span className="font-display text-5xl italic">MT</span>
        </motion.div>
        
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%", opacity: 0 }}
            animate={phase >= 2 ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[6vw] font-display font-medium text-white leading-none mb-6"
          >
            Muhammad Taha
          </motion.h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#EFF1F4]/80 font-body text-[1.5vw]"
        >
          Available for new opportunities.
        </motion.div>
      </div>
    </motion.div>
  );
}
