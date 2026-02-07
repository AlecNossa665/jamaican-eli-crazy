"use client";

import { DynamicBackground } from "@/components/landing/dynamic-background";
import { Input } from "@/components/ui/input";
import { useCallback, useRef, useState } from "react";

type GreetState = "idle" | "loading" | "playing" | "error";

export default function LandingPage() {
  const [value, setValue] = useState("");
  const [greetState, setGreetState] = useState<GreetState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [greetedName, setGreetedName] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;

      cleanup();
      setGreetState("loading");
      setErrorMessage("");
      setGreetedName(trimmed);

      try {
        const response = await fetch("/api/greet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `Request failed (${response.status})`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener("ended", () => {
          setGreetState("idle");
        });

        audio.addEventListener("error", () => {
          setGreetState("error");
          setErrorMessage("Failed to play audio");
        });

        setGreetState("playing");
        await audio.play();
      } catch (err) {
        console.error("Greet error:", err);
        setGreetState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    },
    [value, cleanup],
  );

  const statusLabel = () => {
    switch (greetState) {
      case "loading":
        return (
          <span className="flex items-center justify-center gap-2 text-yellow-400">
            <LoadingDots />
            Generating greeting for {greetedName}…
          </span>
        );
      case "playing":
        return (
          <span className="flex items-center justify-center gap-2 text-green-400">
            <SpeakerIcon />
            Bomboclaat! Playing greeting for {greetedName}
          </span>
        );
      case "error":
        return (
          <span className="text-red-400">
            {errorMessage || "Something went wrong"}
          </span>
        );
      default:
        return (
          <span className="text-zinc-600">
            Enter a name &amp; press Enter to hear the greeting
          </span>
        );
    }
  };

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

          {/* Pulsing ring when playing */}
          {greetState === "playing" && (
            <div className="flex items-center justify-center">
              <div className="absolute h-32 w-32 animate-ping rounded-full bg-green-500/10" />
              <div className="absolute h-24 w-24 animate-pulse rounded-full bg-green-500/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500/30">
                <SpeakerIcon className="h-8 w-8 text-green-400" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <label
              htmlFor="landing-input"
              className="mb-3 block text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500"
            >
              Enter a name
            </label>
            <Input
              id="landing-input"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type a name..."
              disabled={greetState === "loading"}
              className="h-14 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-5 text-base text-zinc-100 shadow-inner placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-500/20 focus-visible:ring-offset-0 focus-visible:ring-offset-[#08090c] disabled:opacity-50"
              autoFocus
            />
            <p className="mt-4 text-center text-xs">{statusLabel()}</p>
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

/* ── Tiny inline icons ── */

function LoadingDots() {
  return (
    <span className="inline-flex gap-[3px]">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-yellow-400 [animation-delay:300ms]" />
    </span>
  );
}

function SpeakerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
