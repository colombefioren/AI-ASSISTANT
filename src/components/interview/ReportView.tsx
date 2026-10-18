import { ArrowUpRight, Check } from "lucide-react";
import { formatDuration } from "@/lib/format";
import type { SessionReport } from "@/lib/report";
import { cn } from "@/lib/utils";

export function ReportView({ report, compact = false }: { report: SessionReport; compact?: boolean }) {
  const metrics = [
    { label: "Duration", value: formatDuration(report.durationSec) },
    { label: "Answers", value: String(report.answers) },
    { label: "Words per answer", value: String(report.avgAnswerWords) },
    { label: "Fillers per 100 words", value: String(report.fillersPer100) },
  ];

  return (
    <div className="grid gap-8">
      <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-5", !compact && "sm:grid-cols-4")}>
        {metrics.map((metric) => (
          <div key={metric.label} className="border-l-2 border-accent/40 pl-3">
            <dt className="text-xs text-ink-muted">{metric.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{metric.value}</dd>
          </div>
        ))}
      </dl>

      <div className={cn("grid gap-8", !compact && "md:grid-cols-2")}>
        <ReportList title="What went well" items={report.strengths} empty="Nothing stood out yet. Longer answers give more to work with." icon="check" />
        <ReportList title="Work on next" items={report.improvements} empty="No clear issues found in this session." icon="arrow" />
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        Generated from your transcript with simple, transparent rules. Treat it as a guide, not a grade.
      </p>
    </div>
  );
}

function ReportList({ title, items, empty, icon }: { title: string; items: string[]; empty: string; icon: "check" | "arrow" }) {
  const Icon = icon === "check" ? Check : ArrowUpRight;
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-3 grid gap-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed">
              <Icon className={cn("mt-0.5 size-4 shrink-0", icon === "check" ? "text-accent" : "text-ink-muted")} aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">{empty}</p>
      )}
    </section>
  );
}
