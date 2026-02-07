"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { DynamicBackground } from "@/components/landing/dynamic-background";

export default function LandingPage() {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        console.log("Submitted:", value.trim());
      }
    },
    [value]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08090c]">
      {/* Procedural dynamic background – ertdfgcvb.xyz style */}
      <DynamicBackground />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-xl flex-col items-center gap-10">
          {/* Large title */}
          <h1 className="text-center font-semibold tracking-tight text-zinc-100 select-none">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
              bombaclApp
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="w-full">
            <label
              htmlFor="landing-input"
              className="mb-3 block text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500"
            >
              Enter query
            </label>
            <Input
              id="landing-input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type here..."
              className="h-14 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-5 text-base text-zinc-100 shadow-inner placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-500/20 focus-visible:ring-offset-0 focus-visible:ring-offset-[#08090c]"
              autoFocus
            />
            <p className="mt-4 text-center text-xs text-zinc-600">
              Press Enter to continue
            </p>
          </form>
        </div>

        <footer className="absolute bottom-8 left-0 right-0 text-center">
          <span className="text-[11px] font-medium tracking-widest text-zinc-700">
            JAMAICAN ELI CRAZY
          </span>
        </footer>
      </main>
    </div>
  );
}
