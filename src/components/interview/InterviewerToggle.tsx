"use client";

import { motion, useReducedMotion } from "motion/react";
import { interviewerIds, interviewers, type InterviewerId } from "@/lib/interviewers";
import { cn } from "@/lib/utils";

interface InterviewerToggleProps {
  value: InterviewerId;
  onChange: (id: InterviewerId) => void;
  disabled?: boolean;
}

/** Switches interviewers, like the original male/female toggle. */
export function InterviewerToggle({ value, onChange, disabled }: InterviewerToggleProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="radiogroup"
      aria-label="Choose interviewer"
      className={cn("relative grid grid-cols-2 rounded-full border border-white/10 p-1", disabled && "opacity-60")}
    >
      {interviewerIds.map((id) => {
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={cn(
              "relative h-8 rounded-full px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed sm:px-4",
              selected ? "text-accent-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            {selected && (
              <motion.span
                layoutId="interviewer-toggle"
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-accent-gradient"
              />
            )}
            <span className="relative whitespace-nowrap">
              <span className="sm:hidden">{interviewers[id].name}</span>
              <span className="hidden sm:inline">{interviewers[id].displayName}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
