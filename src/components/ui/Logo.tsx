import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * AIC mark: a speech bubble drawn as an open C (for Coach) with a voice
 * waveform inside. Served as a static file so its gradient ids never clash or
 * cause hydration mismatches. Same artwork as src/app/icon.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/aic-mark.svg"
      alt=""
      width={64}
      height={64}
      unoptimized
      priority
      className={cn("size-8 shrink-0", className)}
    />
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${brand.fullName} home`}
      className={cn("group inline-flex items-center gap-2.5 text-ink", className)}
    >
      <LogoMark className="transition-transform duration-300 ease-out group-hover:-rotate-6" />
      <span className="text-[19px] font-bold tracking-[-0.03em]">
        AI<span className="text-accent">C</span>
      </span>
      <span aria-hidden className="hidden h-4 w-px bg-white/15 md:block" />
      <span className="hidden text-[13px] font-medium text-ink-muted md:block">{brand.fullName}</span>
    </Link>
  );
}
