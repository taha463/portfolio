import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4_Fehm() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-end bg-[#0F1720]" {...sceneTransitions.slideLeft}>
      <div className="absolute inset-0 w-full h-full">
        <img
          src={`${import.meta.env.BASE_URL}images/fehm.png`}
          className="w-full h-full object-cover opacity-60"
          alt="FEHM.AI"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0F1720] via-[#0F1720]/80 to-transparent"></div>
      </div>
      
      <div className="z-10 pr-[10vw] max-w-[50vw] text-right flex flex-col items-end">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[#F05118] font-body font-bold tracking-widest text-[1vw] mb-4 uppercase">Project 02</div>
          <h2 className="text-[5vw] font-display text-white leading-none mb-6">FEHM.AI</h2>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, x: 30 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.8vw] font-body text-[#EFF1F4] mb-10 leading-snug"
        >
          Multi-Agent AI Tutor
        </motion.p>
        
        <div className="flex flex-col gap-4 items-end">
          {['Adaptive Socratic tutoring', 'Multi-agent orchestration', 'Learning-path graphs'].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 text-white/80 font-body text-[1.2vw]"
            >
              {item}
              <div className="w-2 h-2 rounded-full bg-[#F05118]"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
