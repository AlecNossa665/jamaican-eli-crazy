"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";

type GreetState = "idle" | "loading" | "ready" | "playing" | "done" | "error";

interface GreetingPlayerProps {
  /** Pre-filled name (e.g. from URL param). Leave empty for manual input. */
  initialName?: string;
  /** If true, automatically starts fetching audio as soon as the component mounts with an initialName. */
  autoPlay?: boolean;
}

export function GreetingPlayer({
  initialName = "",
  autoPlay = false,
}: GreetingPlayerProps) {
  const [value, setValue] = useState(initialName);
  const [greetState, setGreetState] = useState<GreetState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [greetedName, setGreetedName] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const hasAutoFetched = useRef(false);

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

  /**
   * Fetches the greeting audio from the API and prepares an Audio element.
   * Does NOT call audio.play() — that must be done from a user gesture.
   * Returns the Audio element if successful, or throws on failure.
   */
  const fetchGreetingAudio = useCallback(
    async (name: string): Promise<HTMLAudioElement> => {
      const response = await fetch("/api/greet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
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

      return audio;
    },
    [],
  );

  /**
   * Attaches "ended" and "error" listeners and plays the audio.
   * Must be called from within a user-gesture call stack.
   */
  const playAudio = useCallback((audio: HTMLAudioElement, name: string) => {
    audio.addEventListener("ended", () => {
      setGreetState("done");
      const slug = encodeURIComponent(name);
      setShareUrl(`${window.location.origin}/bomboclaat/${slug}`);
    });

    audio.addEventListener("error", () => {
      setGreetState("error");
      setErrorMessage("Failed to play audio");
    });

    setGreetState("playing");
    audio.play().catch(() => {
      // If play still fails somehow, surface the error
      setGreetState("error");
      setErrorMessage("Playback was blocked. Please tap the play button.");
    });
  }, []);

  /**
   * Full flow: fetch + play. Used when triggered by a user gesture (form submit).
   */
  const generateGreeting = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      cleanup();
      setGreetState("loading");
      setErrorMessage("");
      setGreetedName(trimmed);
      setShareUrl("");
      setCopied(false);

      try {
        const audio = await fetchGreetingAudio(trimmed);
        playAudio(audio, trimmed);
      } catch (err) {
        console.error("Greet error:", err);
        setGreetState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    },
    [cleanup, fetchGreetingAudio, playAudio],
  );

  /**
   * Fetch-only flow: used for autoPlay so audio is pre-buffered,
   * then waits for a user tap to actually play.
   */
  const prefetchGreeting = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      cleanup();
      setGreetState("loading");
      setErrorMessage("");
      setGreetedName(trimmed);
      setShareUrl("");
      setCopied(false);

      try {
        await fetchGreetingAudio(trimmed);
        // Audio is buffered and ready — wait for user gesture
        setGreetState("ready");
      } catch (err) {
        console.error("Greet prefetch error:", err);
        setGreetState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    },
    [cleanup, fetchGreetingAudio],
  );

  /**
   * Called when the user taps the play button in the "ready" state.
   * This is a direct user gesture so audio.play() is allowed.
   */
  const handleTapToPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      setGreetState("error");
      setErrorMessage("Audio not loaded. Try again.");
      return;
    }
    playAudio(audio, greetedName);
  }, [greetedName, playAudio]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // Form submit is a user gesture, so we can fetch + play directly
      await generateGreeting(value);
    },
    [value, generateGreeting],
  );

  // Auto-fetch (NOT auto-play) on mount when autoPlay + initialName
  useEffect(() => {
    if (autoPlay && initialName && !hasAutoFetched.current) {
      hasAutoFetched.current = true;
      // Defer to avoid synchronous setState inside effect body
      setTimeout(() => prefetchGreeting(initialName), 0);
    }
  }, [autoPlay, initialName, prefetchGreeting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handlePlayAgain = useCallback(() => {
    cleanup();
    setGreetState("idle");
    setShareUrl("");
    setCopied(false);
    setGreetedName("");
    if (!initialName) setValue("");
  }, [initialName, cleanup]);

  const statusContent = () => {
    switch (greetState) {
      case "loading":
        return (
          <span className="flex items-center justify-center gap-2 text-yellow-400">
            <LoadingDots />
            Generating greeting for {greetedName}…
          </span>
        );
      case "ready":
        return (
          <span className="text-zinc-400">
            Greeting ready for {greetedName} — tap play!
          </span>
        );
      case "playing":
        return (
          <span className="flex items-center justify-center gap-2 text-green-400">
            <SpeakerIcon />
            Bomboclaat! Playing greeting for {greetedName}
          </span>
        );
      case "done":
        return (
          <div className="flex flex-col items-center gap-3">
            <span className="text-green-400">
              ✓ Greeting played for {greetedName}
            </span>
            {shareUrl && (
              <div className="flex w-full flex-col items-center gap-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                  Share this greeting
                </p>
                <div className="flex w-full items-center gap-2">
                  <div className="flex-1 truncate rounded-md border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-300">
                    {shareUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="mt-1 text-xs text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300"
                >
                  Generate another
                </button>
              </div>
            )}
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center gap-2">
            <span className="text-red-400">
              {errorMessage || "Something went wrong"}
            </span>
            <button
              type="button"
              onClick={handlePlayAgain}
              className="text-xs text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300"
            >
              Try again
            </button>
          </div>
        );
      default:
        return (
          <span className="text-zinc-600">
            {initialName
              ? "Press Enter to hear the greeting"
              : "Enter a name & press Enter to hear the greeting"}
          </span>
        );
    }
  };

  return (
    <>
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

      {/* Big tap-to-play button when audio is pre-fetched and ready */}
      {greetState === "ready" && (
        <button
          type="button"
          onClick={handleTapToPlay}
          className="group flex flex-col items-center gap-4 focus:outline-none"
        >
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-green-500/40 bg-green-500/10 transition-all group-hover:scale-110 group-hover:border-green-400/60 group-hover:bg-green-500/20 group-active:scale-95">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1 h-10 w-10 text-green-400 transition-colors group-hover:text-green-300"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
          <span className="text-sm font-medium text-zinc-400 transition-colors group-hover:text-zinc-200">
            Tap to play
          </span>
        </button>
      )}

      {greetState !== "done" && greetState !== "ready" ? (
        <form onSubmit={handleSubmit} className="w-full">
          {!initialName && (
            <>
              <label
                htmlFor="landing-input"
                className="mb-3 block text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500"
              >
                Enter a name
              </label>
              <Input
                id="landing-input"
                name="name"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Type a name..."
                disabled={greetState === "loading" || greetState === "playing"}
                className="h-14 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-5 text-base text-zinc-100 shadow-inner placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-500/20 focus-visible:ring-offset-0 focus-visible:ring-offset-[#08090c] disabled:opacity-50"
                autoFocus
              />
            </>
          )}
          <p className="mt-4 text-center text-xs">{statusContent()}</p>
        </form>
      ) : greetState === "done" ? (
        <div className="w-full">
          <div className="text-center text-xs">{statusContent()}</div>
        </div>
      ) : (
        /* "ready" state — status shown below the play button */
        <p className="mt-2 text-center text-xs">{statusContent()}</p>
      )}
    </>
  );
}

/* ── Tiny inline icons ── */

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.75">
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
