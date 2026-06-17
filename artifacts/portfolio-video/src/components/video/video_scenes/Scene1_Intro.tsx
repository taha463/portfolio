import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1_Intro() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center bg-[#FCFCFC]" {...sceneTransitions.clipPolygon}>
      <div className="absolute inset-0 w-full h-full">
        <img
          src={`${import.meta.env.BASE_URL}images/hero.png`}
          className="w-full h-full object-cover opacity-30"
          alt="hero"
        />
      </div>
      
      <div className="text-center z-10 px-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-[#F05118] rounded-full mx-auto mb-8 flex items-center justify-center text-white"
        >
          <span className="font-display text-4xl italic">MT</span>
        </motion.div>
        
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={phase >= 2 ? { y: 0 } : { y: "100%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[6vw] font-display font-medium text-[#0F1720] leading-none mb-4"
          >
            Muhammad Taha
          </motion.h1>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 text-[#F05118] font-body text-[1.5vw] uppercase tracking-widest"
        >
          <span>AI Engineer</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F05118]"></span>
          <span>Product Designer</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
