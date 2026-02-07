"use client";

import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

/**
 * Rasta Prophet – Mystic Background
 * 3D Open Simplex Noise with a deep green / gold / red Rastafari palette.
 * Feels like gazing into incense smoke under a tropical canopy at dusk.
 */

// Rasta palette – noise value 0..1 maps to these (dark → light)
const RASTA_PALETTE = [
  [0x05, 0x0a, 0x03], // near-black jungle floor
  [0x0c, 0x1e, 0x08], // deep forest green
  [0x1a, 0x3a, 0x0e], // rich green
  [0x3a, 0x2a, 0x05], // earthy gold-brown
  [0x6b, 0x5a, 0x0a], // warm gold
  [0x8c, 0x6d, 0x0f], // bright gold
  [0x5c, 0x1a, 0x0a], // deep red ember
  [0x7a, 0x22, 0x10], // burning red
];

const S = 0.025; // scale – slightly tighter than before for more texture
const TIME_SCALE = 0.0005; // slower drift for a meditative, prophetic feel

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
      // Reset transform (setting width/height clears context; be explicit so scale never stacks)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      // Redraw immediately so there’s no blank or wrong-size frame after resize
      draw();
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      time += TIME_SCALE * 16; // ~60fps
      const t = time;

      const aspect = w / h;
      const rw = Math.max(1, Math.floor(w / 3));
      const rh = Math.max(1, Math.floor(h / 3));

      const imageData = ctx.createImageData(rw, rh);
      const data = imageData.data;

      for (let j = 0; j < rh; j++) {
        for (let i = 0; i < rw; i++) {
          const x = i * S;
          const y = (j * S) / aspect + t;

          // Layer two noise octaves for richer texture
          const n1 = noise3D(x, y, t);
          const n2 = noise3D(x * 2.5, y * 2.5, t * 1.3) * 0.35;
          const n = n1 + n2;
          const value = n * 0.4 + 0.5; // remap to ~0..1

          const clamped = Math.max(0, Math.min(value, 0.999));
          const idx = Math.min(
            Math.floor(clamped * RASTA_PALETTE.length),
            RASTA_PALETTE.length - 1,
          );

          // Interpolate between current and next palette entry for smoothness
          const frac = clamped * RASTA_PALETTE.length - idx;
          const nextIdx = Math.min(idx + 1, RASTA_PALETTE.length - 1);
          const [r1, g1, b1] = RASTA_PALETTE[idx];
          const [r2, g2, b2] = RASTA_PALETTE[nextIdx];

          const r = Math.round(r1 + (r2 - r1) * frac);
          const g = Math.round(g1 + (g2 - g1) * frac);
          const b = Math.round(b1 + (b2 - b1) * frac);

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
