import { DynamicBackground } from "@/components/landing/dynamic-background";

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(255,215,0,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,215,0,.04) 1px, transparent 1px)
  `,
  backgroundSize: "64px 64px",
} as const;

interface LandingLayoutProps {
  children: React.ReactNode;
  /** Optional subtitle below the title (e.g. "Di spirits have a message for X") */
  subtitle?: React.ReactNode;
}

export function LandingLayout({ children, subtitle }: LandingLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050a03]">
      <DynamicBackground />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={GRID_STYLE}
      />

      {/* Radial gold vignette for that incense-smoke-in-the-temple feel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(180,140,20,0.08) 0%, transparent 70%)",
        }}
      />

      <main className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-xl flex-col items-center gap-8">
          {/* Mystical Oracle Title */}
          <div className="flex flex-col items-center gap-3 select-none">
            {/* Decorative top flourish */}
            <span
              className="text-lg tracking-[0.5em] text-amber-600/60"
              aria-hidden
            >
              ✦ ✦ ✦
            </span>

            <h1
              className="text-center font-bold tracking-tight text-amber-100"
              style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}
            >
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[0_0_30px_rgba(180,140,20,0.3)]">
                bombaclApp
              </span>
            </h1>

            {/* Oracle tagline */}
            <p
              className="text-center text-sm tracking-[0.25em] uppercase text-amber-500/70"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Di Rasta Oracle Awaits
            </p>

            {/* Decorative divider */}
            <div className="flex items-center gap-3 mt-1">
              <span className="block h-px w-12 bg-gradient-to-r from-transparent via-green-600/40 to-transparent" />
              <span className="text-xs text-green-500/50">🌿</span>
              <span className="block h-px w-12 bg-gradient-to-r from-transparent via-green-600/40 to-transparent" />
            </div>
          </div>

          {subtitle && (
            <div
              className="text-center text-sm text-amber-300/70 italic"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {subtitle}
            </div>
          )}

          {children}
        </div>

        <footer className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1 text-center">
          <span className="text-[10px] tracking-[0.3em] text-green-700/50">
            ☽ ★ ☾
          </span>
          <span
            className="text-[11px] font-medium tracking-[0.25em] text-amber-800/50"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            JAMAICAN ELI CRAZY
          </span>
          <span className="text-[9px] tracking-[0.2em] text-green-800/40 italic">
            Jah guide &amp; protect
          </span>
        </footer>
      </main>
    </div>
  );
}
