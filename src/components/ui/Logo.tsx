import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink", className)}
    >
      <span aria-hidden className="grid size-6 place-items-center rounded-[7px] bg-accent">
        <span className="size-2 rounded-full bg-accent-ink" />
      </span>
      {brand.name}
    </Link>
  );
}
