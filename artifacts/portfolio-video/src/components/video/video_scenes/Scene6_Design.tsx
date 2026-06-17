import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene6_Design() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center bg-[#EFF1F4]" {...sceneTransitions.zoomThrough}>
      <div className="absolute inset-0 w-full h-full">
        <img
          src={`${import.meta.env.BASE_URL}images/ux.png`}
          className="w-full h-full object-cover opacity-30"
          alt="UX"
        />
        <div className="absolute inset-0 bg-[#EFF1F4]/70"></div>
      </div>
      
      <div className="z-10 w-[80vw] mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div className="text-[#F05118] font-body font-bold tracking-widest text-[1.2vw] mb-4 uppercase">UX / Product Design</div>
          <h2 className="text-[4vw] font-display text-[#0F1720] leading-none mb-6 italic">Human-Centered Interfaces</h2>
        </motion.div>
        
        <div className="flex gap-16 w-full justify-center">
          <motion.div
            initial={{ opacity: 0, x: -40, rotateY: 20 }}
            animate={phase >= 2 ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: -40, rotateY: 20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-10 shadow-xl rounded-2xl w-[35vw] text-left border border-black/5"
            style={{ perspective: 1000 }}
          >
            <h3 className="text-[2.5vw] font-display text-[#0F1720] mb-4">Interview Prep App</h3>
            <p className="text-[1.2vw] font-body text-[#0F1720]/70 mb-6">AI mock-interviews with progress analytics.</p>
            <div className="flex flex-wrap gap-3">
              {['User Research', 'Wireframing', 'Prototyping'].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-[#EFF1F4] text-[#0F1720] rounded-full text-[0.9vw] font-body">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -20 }}
            animate={phase >= 3 ? { opacity: 1, x: 0, rotateY: 0 } : { opacity: 0, x: 40, rotateY: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-10 shadow-xl rounded-2xl w-[35vw] text-left border border-black/5"
            style={{ perspective: 1000 }}
          >
            <h3 className="text-[2.5vw] font-display text-[#0F1720] mb-4">First Aid Guide</h3>
            <p className="text-[1.2vw] font-body text-[#0F1720]/70 mb-6">Emergency medical guide focusing on visual hierarchy and accessibility.</p>
            <div className="flex flex-wrap gap-3">
              {['Accessibility', 'UI Design', 'Information Architecture'].map((tag, i) => (
                <span key={i} className="px-4 py-2 bg-[#EFF1F4] text-[#0F1720] rounded-full text-[0.9vw] font-body">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
