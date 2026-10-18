import { cn } from "@/lib/utils";

// Deterministic positions so server and client render the same markup.
const PARTICLES = Array.from({ length: 26 }, (_, i) => {
  // Integer hash, identical on every JS engine.
  const r = (n: number) => (((i + 1) * 9301 + n * 49297) % 233280) / 233280;
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    top: `${(r(2) * 100).toFixed(2)}%`,
    size: 2 + Math.round(r(3) * 4),
    duration: `${18 + Math.round(r(4) * 22)}s`,
    delay: `-${Math.round(r(5) * 30)}s`,
    opacity: 0.15 + r(6) * 0.35,
  };
});

/**
 * Page backdrop from the original design, refined: a sky glow from the top,
 * a faint grid that fades out, and slow drifting particles.
 */
export function Backdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas", className)}>
      <div className="absolute inset-x-0 -top-40 h-[640px] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(var(--accent)/0.18),transparent_70%)]" />
      <div className="absolute -left-40 top-1/3 size-[520px] rounded-full bg-accent-deep/10 blur-[120px]" />
      <div className="absolute -right-40 bottom-0 size-[520px] rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(70%_55%_at_50%_0%,black,transparent)]" />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle absolute rounded-full bg-accent"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
