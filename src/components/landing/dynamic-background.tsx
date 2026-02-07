"use client";

import { useEffect, useRef } from "react";

/**
 * Stacked sin waves – horizontal orientation, deep purple palette.
 * Adapted from Raurir's "Stacked sin waves" (wave varies with x, bands stack vertically).
 */

function wave(t: number, x: number, seeds: [number, number, number], amps: [number, number, number]) {
  return (
    (Math.sin(t + x * seeds[0]) + 1) * amps[0] +
    (Math.sin(t + x * seeds[1]) + 1) * amps[1] +
    Math.sin(t + x * seeds[2]) * amps[2]
  );
}

// Deep purple palette (dark to light) – band indices 0..4
const DEEP_PURPLES = [
  [0x0d, 0x06, 0x18], // 0 – darkest
  [0x1a, 0x0a, 0x2e],
  [0x2d, 0x1b, 0x4e],
  [0x4a, 0x2c, 0x6d],
  [0x6b, 0x3a, 0x8f], // 4 – lightest
];

// Scale factor so wave amplitude fits screen height (original amps ~10,8,5 etc.)
const WAVE_SCALE = 0.15;

export function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      const w = Math.floor(window.innerWidth);
      const h = Math.floor(window.innerHeight);
      time += 0.002;

      const t = time;
      const base = h / 4;

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          // Wave depends on x (horizontal) → boundaries run horizontally, bands stack vertically
          const v0 =
            base +
            wave(t, px, [0.15, 0.13, 0.37], [10, 8, 5]) * 0.9 * WAVE_SCALE;
          const v1 =
            v0 +
            wave(t, px, [0.12, 0.14, 0.27], [3, 6, 5]) * 0.8 * WAVE_SCALE;
          const v2 =
            v1 +
            wave(t, px, [0.089, 0.023, 0.217], [2, 4, 2]) * 0.3 * WAVE_SCALE;
          const v3 =
            v2 +
            wave(t, px, [0.167, 0.054, 0.147], [4, 6, 7]) * 0.4 * WAVE_SCALE;

          const i =
            py < v0 ? 0 : py < v1 ? 1 : py < v2 ? 2 : py < v3 ? 3 : 4;
          const [r, g, b] = DEEP_PURPLES[i];
          const idx = (py * w + px) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full object-cover"
      aria-hidden
    />
  );
}
