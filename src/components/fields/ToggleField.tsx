"use client";

import { useId } from "react";

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function ToggleField({ label, checked, onChange, hint }: ToggleFieldProps) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-[13px] text-text">
        {label}
        {hint ? <span className="block text-[12px] text-text-muted">{hint}</span> : null}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full border transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          checked ? "border-accent bg-accent" : "border-line bg-surface-2"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white transition-[left] duration-150 ease-out ${
            checked ? "left-[18px]" : "left-[3px]"
          }`}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}
