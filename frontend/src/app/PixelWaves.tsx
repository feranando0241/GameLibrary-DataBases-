import { useEffect, useRef } from 'react';

// Decorative background: dithered pixel ripples spreading from the top-left corner.
// One small canvas, ~24 fps, a single fill per brightness level. Tweak these to taste:
const CELL = 12; // grid spacing (px)
const DOT = 4; // pixel size (px)
const FPS = 24;
const COLOR = '166, 173, 186'; // --muted (#A6ADBA)
const LEVELS = [0.05, 0.1, 0.16]; // alpha per brightness step; last = wave crest
const DENSITY = 0.45; // share of cells lit at a crest
const WAVELENGTH = 0.35; // ripple frequency (higher = tighter rings)
const SPEED = 1.6; // ripple speed

export function PixelWaves() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cols = 0;
    let rows = 0;
    let seeds = new Float32Array(0);
    let raf = 0;
    let last = 0;

    const draw = (ms: number) => {
      const t = ms / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const paths = LEVELS.map(() => new Path2D());
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Main rings from the corner + a slow diagonal swell so it reads as water, not a target
          const w =
            0.5 +
            0.35 * Math.sin(Math.hypot(x, y) * WAVELENGTH - t * SPEED) +
            0.15 * Math.sin((x * 0.6 - y * 0.8) * 0.18 + t * 0.7);
          if (seeds[y * cols + x] > w * DENSITY) continue; // dither: crests dense, troughs empty
          const level = Math.min(LEVELS.length - 1, Math.floor(w * LEVELS.length));
          paths[level].rect(x * CELL, y * CELL, DOT, DOT);
        }
      }
      paths.forEach((p, i) => {
        ctx.fillStyle = `rgba(${COLOR}, ${LEVELS[i]})`;
        ctx.fill(p);
      });
    };

    const resize = () => {
      // CSS-pixel resolution on purpose: cheaper, and image-rendering keeps dots crisp on HiDPI
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / CELL);
      rows = Math.ceil(canvas.height / CELL);
      seeds = Float32Array.from({ length: cols * rows }, Math.random);
      draw(last);
    };

    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop); // rAF pauses itself in hidden tabs
      if (ms - last < 1000 / FPS) return;
      last = ms;
      draw(ms);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!still) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
