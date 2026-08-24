"use client";

import { useEffect, useId, useRef } from "react";
import { FieldShell, errorInputClass } from "./FieldShell";

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  counterFrom?: number;
}

export function TextAreaField({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder,
  counterFrom = 120,
}: TextAreaFieldProps) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [value]);

  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      labelSuffix={
        value.length > counterFrom ? (
          <span className="ml-auto font-mono text-[11px] tabular-nums text-text-muted">{value.length}</span>
        ) : null
      }
    >
      <textarea
        id={id}
        ref={ref}
        rows={2}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`min-h-[72px] w-full resize-none overflow-hidden rounded-control border border-line bg-surface-2 px-2.5 py-2 text-[13px] leading-[1.5] text-text placeholder:text-text-muted/60 transition-colors duration-150 ease-out hover:border-[#3A3E44] focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
          error ? errorInputClass : ""
        }`}
      />
    </FieldShell>
  );
}
