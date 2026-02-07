"use client";

import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * Hotlink-style background (ertdfgcvb)
 * 3D Open Simplex Noise driven by (x, y, time). Value mapped to deep purple palette.
 * @see https://github.com/ertdfgcvb (Function hotlink example)
 */

// Deep purple palette – noise value 0..1 maps to these (dark → light)
const DEEP_PURPLES = [
  [0x0d, 0x06, 0x18],
  [0x1a, 0x0a, 0x2e],
  [0x2d, 0x1b, 0x4e],
  [0x4a, 0x2c, 0x6d],
  [0x6b, 0x3a, 0x8f],
];

const S = 0.03; // scale (from Hotlink: coord.x * s)
const TIME_SCALE = 0.0007; // context.time * 0.0007

export function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise3D = createNoise3D();

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
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += TIME_SCALE * 16; // ~60fps: 0.0007 * 16 ≈ 0.011 per frame
      const t = time;

      const aspect = w / h;
      // Render at reduced resolution for performance, then scale up
      const rw = Math.max(1, Math.floor(w / 3));
      const rh = Math.max(1, Math.floor(h / 3));

      const imageData = ctx.createImageData(rw, rh);
      const data = imageData.data;

      for (let j = 0; j < rh; j++) {
        for (let i = 0; i < rw; i++) {
          // Hotlink: x = coord.x * s, y = coord.y * s / aspect + t
          const x = i * S;
          const y = (j * S) / aspect + t;
          const n = noise3D(x, y, t);
          const value = n * 0.5 + 0.5; // 0..1
          const idx = Math.min(
            Math.floor(value * DEEP_PURPLES.length),
            DEEP_PURPLES.length - 1
          );
          const [r, g, b] = DEEP_PURPLES[idx];
          const off = (j * rw + i) * 4;
          data[off] = r;
          data[off + 1] = g;
          data[off + 2] = b;
          data[off + 3] = 255;
        }
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = rw;
      offscreen.height = rh;
      const octx = offscreen.getContext("2d");
      if (!octx) return;
      octx.putImageData(imageData, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(offscreen, 0, 0, rw, rh, 0, 0, w, h);

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
