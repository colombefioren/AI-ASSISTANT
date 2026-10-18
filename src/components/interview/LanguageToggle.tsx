"use client";

import { interviewLanguages, languageIds, type InterviewLanguage } from "@/lib/languages";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  value: InterviewLanguage;
  onChange: (language: InterviewLanguage) => void;
  disabled?: boolean;
}

export function LanguageToggle({ value, onChange, disabled }: LanguageToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span id="language-label" className="text-sm text-ink-muted">
        Interview language
      </span>
      <div
        role="radiogroup"
        aria-labelledby="language-label"
        className={cn("grid grid-cols-2 rounded-full border border-white/10 p-0.5", disabled && "opacity-60")}
      >
        {languageIds.map((id) => {
          const selected = id === value;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={interviewLanguages[id].label}
              disabled={disabled}
              onClick={() => onChange(id)}
              className={cn(
                "h-7 rounded-full px-3 text-xs font-semibold tracking-wide transition-colors disabled:cursor-not-allowed",
                selected ? "bg-white/10 text-ink" : "text-ink-muted hover:text-ink"
              )}
            >
              {interviewLanguages[id].short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
