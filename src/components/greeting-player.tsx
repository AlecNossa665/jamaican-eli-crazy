"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";

type GreetState = "idle" | "loading" | "ready" | "playing" | "done" | "error";

interface GreetingPlayerProps {
  /** Pre-filled name (e.g. from URL param). Leave empty for manual input. */
  initialName?: string;
  /** If true, automatically starts fetching audio as soon as the component mounts with an initialName. */
  autoPlay?: boolean;
  /** The type of greeting - determines API endpoint and share URL */
  greetingType?: "bomboclaat" | "pussyclaat";
  /** If true, hides the share URL */
  hideShareUrl?: boolean;
}

export function GreetingPlayer({
  initialName = "",
  autoPlay = false,
  greetingType = "bomboclaat",
  hideShareUrl = false,
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

  const fetchGreetingAudio = useCallback(
    async (name: string): Promise<HTMLAudioElement> => {
      const apiEndpoint =
        greetingType === "pussyclaat" ? "/api/greet-pussyclaat" : "/api/greet";
      const response = await fetch(apiEndpoint, {
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
    [greetingType],
  );

  const playAudio = useCallback(
    (audio: HTMLAudioElement, name: string) => {
      audio.addEventListener(
        "ended",
        () => {
          setGreetState("done");
          if (!hideShareUrl) {
            const slug = encodeURIComponent(name);
            setShareUrl(`${window.location.origin}/${greetingType}/${slug}`);
          }
        },
        { once: true },
      );

      audio.addEventListener(
        "error",
        () => {
          setGreetState("error");
          setErrorMessage("Di spirits couldn't carry di message. Try again.");
        },
        { once: true },
      );

      setGreetState("playing");
      audio.play().catch(() => {
        setGreetState("error");
        setErrorMessage(
          "Di Oracle need yuh permission fi speak. Tap di play button, seen?",
        );
      });
    },
    [greetingType, hideShareUrl],
  );

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
          err instanceof Error
            ? err.message
            : "Di spirits dem gone silent. Try again.",
        );
      }
    },
    [cleanup, fetchGreetingAudio, playAudio],
  );

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
        setGreetState("ready");
      } catch (err) {
        console.error("Greet prefetch error:", err);
        setGreetState("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Di spirits dem gone silent. Try again.",
        );
      }
    },
    [cleanup, fetchGreetingAudio],
  );

  const handleTapToPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      setGreetState("error");
      setErrorMessage("Di prophecy neva load. Seek again, bredren.");
      return;
    }
    playAudio(audio, greetedName);
  }, [greetedName, playAudio]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await generateGreeting(value);
    },
    [value, generateGreeting],
  );

  // Auto-fetch on mount when autoPlay + initialName
  useEffect(() => {
    if (autoPlay && initialName && !hasAutoFetched.current) {
      hasAutoFetched.current = true;
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
    if (initialName && autoPlay) {
      window.location.href = "/";
    } else {
      cleanup();
      setGreetState("idle");
      setShareUrl("");
      setCopied(false);
      setGreetedName("");
      if (!initialName) setValue("");
    }
  }, [initialName, autoPlay, cleanup]);

  const statusContent = () => {
    switch (greetState) {
      case "loading":
        return (
          <span className="flex items-center justify-center gap-2 text-amber-400">
            <IncenseSmoke />
            <span className="italic">
              Di spirits dem a channel fi{" "}
              <span className="font-semibold text-amber-300">
                {greetedName}
              </span>
              …
            </span>
          </span>
        );
      case "ready":
        return (
          <span className="text-green-400/80 italic">
            Di prophecy ready fi{" "}
            <span className="font-semibold text-green-300">{greetedName}</span>{" "}
            — tap fi receive it!
          </span>
        );
      case "playing":
        return (
          <span className="flex items-center justify-center gap-2 text-green-400">
            <SpeakerIcon />
            <span className="italic">
              🔥 {greetingType === "pussyclaat" ? "Pussyclaat!" : "Bomboclaat!"}{" "}
              Di Prophet speaks to{" "}
              <span className="font-semibold text-green-300">
                {greetedName}
              </span>
              …
            </span>
          </span>
        );
      case "done":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-amber-600/60" aria-hidden>
                ✦ ✦ ✦
              </span>
              <span className="text-green-400 italic">
                Di Oracle has spoken fi{" "}
                <span className="font-semibold text-green-300">
                  {greetedName}
                </span>
              </span>
              <span className="text-[10px] text-amber-600/50 tracking-widest uppercase">
                So it go, seen?
              </span>
            </div>
            {!hideShareUrl && shareUrl && (
              <div className="flex w-full flex-col items-center gap-2">
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.2em] text-amber-600/60"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Spread di Prophecy
                </p>
                <div className="flex w-full items-center gap-2">
                  <div className="flex-1 truncate rounded-lg border border-green-800/40 bg-green-950/50 px-3 py-2 text-sm text-amber-200/80">
                    {shareUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg border border-amber-700/40 bg-amber-900/30 px-4 py-3 text-sm text-amber-300/90 transition-all hover:border-amber-500/60 hover:bg-amber-800/40 hover:text-amber-200 hover:shadow-[0_0_12px_rgba(180,140,20,0.15)] active:scale-[0.98]"
                  >
                    {copied ? "Blessed! ✓" : "Copy Link"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="mt-2 min-h-[44px] py-2 text-xs text-green-600/70 underline underline-offset-2 transition-colors hover:text-green-400 active:opacity-80"
                >
                  Seek another prophecy
                </button>
              </div>
            )}
            {hideShareUrl && (
              <button
                type="button"
                onClick={handlePlayAgain}
                className="mt-1 min-h-[44px] py-2 text-xs text-green-600/70 underline underline-offset-2 transition-colors hover:text-green-400 active:opacity-80"
              >
                Seek another prophecy
              </button>
            )}
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center gap-2">
            <span className="text-red-400">
              🔥 {errorMessage || "Di spirits dem gone silent."}
            </span>
            <button
              type="button"
              onClick={handlePlayAgain}
              className="min-h-[44px] py-2 text-xs text-amber-600/70 underline underline-offset-2 transition-colors hover:text-amber-400 active:opacity-80"
            >
              Try seek di Oracle again
            </button>
          </div>
        );
      default:
        return (
          <span className="text-green-700/70 italic">
            {initialName
              ? "Press Enter fi hear di prophecy"
              : "Whisper a name to di Oracle… den press Enter"}
          </span>
        );
    }
  };

  return (
    <>
      {/* Mystical pulsing ring when playing */}
      {greetState === "playing" && (
        <div className="flex items-center justify-center">
          <div className="absolute h-36 w-36 animate-ping rounded-full bg-green-500/10" />
          <div className="absolute h-28 w-28 animate-pulse rounded-full bg-amber-500/10" />
          <div className="absolute h-20 w-20 animate-pulse rounded-full bg-green-500/15 [animation-delay:300ms]" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600/30 to-amber-600/30 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
            <SpeakerIcon className="h-8 w-8 text-amber-300" />
          </div>
        </div>
      )}

      {/* Big tap-to-play button when audio is pre-fetched and ready */}
      {greetState === "ready" && (
        <button
          type="button"
          onClick={handleTapToPlay}
          className="group flex min-h-[44px] min-w-[44px] flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a03] sm:gap-4"
        >
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-500/30 bg-gradient-to-br from-green-600/10 to-amber-600/10 transition-all group-hover:scale-110 group-hover:border-amber-400/50 group-hover:shadow-[0_0_50px_rgba(180,140,20,0.2)] group-active:scale-95 sm:h-28 sm:w-28 touch-manipulation">
            {/* Inner glow ring */}
            <div className="absolute inset-2 rounded-full border border-green-500/20 group-hover:border-green-400/30" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="ml-1 h-12 w-12 text-amber-400 transition-colors group-hover:text-amber-300 drop-shadow-[0_0_8px_rgba(180,140,20,0.4)]"
            >
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
          <span
            className="text-sm font-medium tracking-[0.15em] uppercase text-amber-500/70 transition-colors group-hover:text-amber-300"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Receive Di Prophecy
          </span>
        </button>
      )}

      {greetState !== "done" && greetState !== "ready" ? (
        <form onSubmit={handleSubmit} className="w-full">
          {!initialName && (
            <>
              <label
                htmlFor="landing-input"
                className="mb-3 block text-center text-xs font-medium uppercase tracking-[0.25em] text-amber-600/60"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Speak a name unto di Oracle
              </label>
              <div className="relative">
                <Input
                  id="landing-input"
                  name="name"
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Whisper a name…"
                  disabled={
                    greetState === "loading" || greetState === "playing"
                  }
                  className="h-14 min-h-[44px] w-full touch-manipulation rounded-lg border border-green-800/40 bg-green-950/40 px-5 text-base text-amber-100 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] placeholder:text-green-700/50 placeholder:italic focus-visible:border-amber-600/50 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:ring-offset-0 focus-visible:ring-offset-[#050a03] disabled:opacity-50"
                  autoFocus
                />
                {/* Subtle glow under the input */}
                <div className="pointer-events-none absolute -bottom-1 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
              </div>
            </>
          )}
          <p className="mt-4 text-center text-xs">{statusContent()}</p>
        </form>
      ) : greetState === "done" ? (
        <div className="w-full">
          <div className="text-center text-xs">{statusContent()}</div>
        </div>
      ) : (
        <p className="mt-2 text-center text-xs">{statusContent()}</p>
      )}
    </>
  );
}

/* ── Tiny inline icons ── */

function IncenseSmoke() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:300ms]" />
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
