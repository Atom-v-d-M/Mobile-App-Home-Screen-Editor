"use client";

import type { ReactNode } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  glyph?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-control border border-line bg-surface-2 p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`flex min-h-[32px] flex-1 items-center justify-center gap-1.5 rounded-[7px] px-2 text-[12px] transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:min-h-[44px] ${
                active ? "bg-[#2E3237] text-text" : "text-text-muted hover:text-text"
              }`}
            >
              {option.glyph}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Ratio glyph: a small outlined rectangle at the given proportion. */
export function RatioGlyph({ ratio }: { ratio: number }) {
  const height = 14;
  const width = Math.max(6, Math.round(height * ratio));
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-[2px] border border-current opacity-80"
      style={{ width, height }}
    />
  );
}
