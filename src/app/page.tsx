"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DynamicBackground } from "@/components/landing/dynamic-background";
import { saveName } from "@/app/actions/save-name";

export default function LandingPage() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData();
    formData.set("name", trimmed);

    const result = await saveName(formData);

    if (result.ok) {
      setStatus("success");
      setValue("");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08090c]">
      <DynamicBackground />

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
              Enter name
            </label>
            <Input
              id="landing-input"
              name="name"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Your name"
              disabled={status === "loading"}
              className="h-14 w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-5 text-base text-zinc-100 shadow-inner placeholder:text-zinc-600 focus-visible:border-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-500/20 focus-visible:ring-offset-0 focus-visible:ring-offset-[#08090c] disabled:opacity-60"
              autoFocus
            />
            {status === "success" && (
              <p className="mt-4 text-center text-sm text-emerald-400">
                Name saved.
              </p>
            )}
            {status === "error" && (
              <p className="mt-4 text-center text-sm text-red-400">
                {errorMessage}
              </p>
            )}
            {status === "idle" && (
              <p className="mt-4 text-center text-xs text-zinc-600">
                Press Enter to submit
              </p>
            )}
            {status === "loading" && (
              <p className="mt-4 text-center text-xs text-zinc-500">
                Saving…
              </p>
            )}
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
