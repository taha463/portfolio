import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2_Statement() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center bg-[#0F1720]" {...sceneTransitions.splitHorizontal}>
      <div className="max-w-[70vw] text-center z-10 px-8">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[4vw] font-display text-white leading-tight"
        >
          "Building AI systems that <span className="text-[#F05118] italic">reason and adapt</span>..."
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[3vw] font-body text-[#EFF1F4] mt-8 font-light"
        >
          ...then designing the interfaces people use to interact with them.
        </motion.p>
      </div>
    </motion.div>
  );
}
