import { DynamicBackground } from "@/components/landing/dynamic-background";

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
  `,
  backgroundSize: "64px 64px",
} as const;

interface LandingLayoutProps {
  children: React.ReactNode;
  /** Optional subtitle below the title (e.g. "Incoming greeting for X") */
  subtitle?: React.ReactNode;
}

export function LandingLayout({ children, subtitle }: LandingLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08090c]">
      <DynamicBackground />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={GRID_STYLE}
      />
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex w-full max-w-xl flex-col items-center gap-10">
          <h1 className="text-center font-semibold tracking-tight text-zinc-100 select-none">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
              bombaclApp
            </span>
          </h1>
          {subtitle && (
            <div className="text-center text-sm text-zinc-400">{subtitle}</div>
          )}
          {children}
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
