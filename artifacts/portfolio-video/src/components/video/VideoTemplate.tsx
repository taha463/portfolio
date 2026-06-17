import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1_Intro } from './video_scenes/Scene1_Intro';
import { Scene2_Statement } from './video_scenes/Scene2_Statement';
import { Scene3_Aegis } from './video_scenes/Scene3_Aegis';
import { Scene4_Fehm } from './video_scenes/Scene4_Fehm';
import { Scene5_Mizan } from './video_scenes/Scene5_Mizan';
import { Scene6_Design } from './video_scenes/Scene6_Design';
import { Scene7_Outro } from './video_scenes/Scene7_Outro';

export const SCENE_DURATIONS: Record<string, number> = {
  intro: 5000,
  statement: 5000,
  aegis: 6000,
  fehm: 6000,
  mizan: 6000,
  design: 8000,
  outro: 6000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  intro: Scene1_Intro,
  statement: Scene2_Statement,
  aegis: Scene3_Aegis,
  fehm: Scene4_Fehm,
  mizan: Scene5_Mizan,
  design: Scene6_Design,
  outro: Scene7_Outro,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-light)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[80vw] h-[80vw] rounded-full blur-[100px] opacity-10"
          style={{ background: 'var(--color-primary)' }}
          animate={{
            x: ['-20%', '10%', '-10%', '-20%'],
            y: ['-20%', '-10%', '10%', '-20%'],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
