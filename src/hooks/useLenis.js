import { useEffect } from 'react';
import Lenis from 'lenis';

export const useLenis = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.2,
      lerp: 0.08
    });

    let frameId = 0;

    const update = (time) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(update);
    };

    frameId = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);
};
