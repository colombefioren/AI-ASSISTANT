import { useId } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Greenroom mark: a speech bubble shaped like a G whose crossbar is a voice
 * waveform. Kept in sync with src/app/icon.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  const fill = `${id}-fill`;
  const shine = `${id}-shine`;
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-8 shrink-0", className)}>
      <defs>
        <linearGradient id={fill} x1="8" y1="6" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={shine} x1="32" y1="0" x2="32" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#${fill})`} />
      <rect x=".75" y=".75" width="62.5" height="62.5" rx="17.25" fill="none" stroke={`url(#${shine})`} strokeWidth="1.5" />
      <g fill="none" stroke="#fff" strokeWidth="5.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M43.2 18.6A18 18 0 1 0 49 32" />
        <path d="M17.2 43.6 11.5 53 24.8 48.9Z" fill="#fff" />
      </g>
      <g fill="#fff">
        <rect x="24.4" y="28" width="4.4" height="8" rx="2.2" />
        <rect x="31" y="23.5" width="4.4" height="17" rx="2.2" />
        <rect x="37.6" y="27" width="4.4" height="10" rx="2.2" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${brand.name} home`}
      className={cn("group inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.02em] text-ink", className)}
    >
      <LogoMark className="transition-transform duration-300 ease-out group-hover:-rotate-6" />
      <span>
        Green<span className="text-accent">room</span>
      </span>
    </Link>
  );
}
