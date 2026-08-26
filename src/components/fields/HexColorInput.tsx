"use client";

import { useEffect, useState } from "react";
import { normaliseHex } from "@/lib/color";

const MESSAGE = "Use 3 or 6 hex digits, like #FF6B2C";

interface HexColorInputProps {
  id: string;
  /** Accessible name for the text field and swatch. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Visible `<label htmlFor>` already names the text input. */
  hasExternalLabel?: boolean;
  hintId?: string;
}

/**
 * Swatch + hex text, two-way synced. Invalid text never reaches the config,
 * so a half-typed "#F" leaves the last valid colour on screen.
 */
export function HexColorInput({
  id,
  label,
  value,
  onChange,
  error,
  hasExternalLabel,
  hintId,
}: HexColorInputProps) {
  const [draft, setDraft] = useState(value);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setDraft((current) => (normaliseHex(current) === value ? current : value));
    setLocalError((current) => (normaliseHex(value) ? null : current));
  }, [value]);

  const commit = (raw: string) => {
    setDraft(raw);
    const next = normaliseHex(raw);
    if (next) {
      setLocalError(null);
      onChange(next);
    } else {
      setLocalError(MESSAGE);
    }
  };

  const shownError = localError ?? error;
  const swatchValue = normaliseHex(value) ?? "#000000";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className={`relative inline-flex size-9 shrink-0 overflow-hidden rounded-control border max-md:size-11 ${
            shownError ? "border-danger ring-2 ring-danger/40" : "border-line"
          }`}
          style={{ backgroundColor: swatchValue }}
        >
          <input
            type="color"
            value={swatchValue}
            onChange={(event) => commit(event.target.value)}
            aria-label={`${label} swatch`}
            className="size-full cursor-pointer opacity-0"
          />
        </span>
        <input
          id={id}
          type="text"
          inputMode="text"
          spellCheck={false}
          value={draft}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => {
            const next = normaliseHex(draft);
            if (next) {
              setDraft(next);
              onChange(next);
            }
          }}
          aria-label={hasExternalLabel ? undefined : label}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? `${id}-error` : hintId}
          className={`h-9 min-h-[36px] w-full rounded-control border bg-surface-2 px-2.5 font-mono text-[13px] uppercase text-text transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-1 max-md:h-11 max-md:min-h-[44px] ${
            shownError
              ? "border-danger ring-2 ring-danger/30 focus-visible:outline-danger"
              : "border-line hover:border-[#3A3E44] focus:border-accent focus-visible:outline-accent"
          }`}
        />
      </div>
      {shownError ? (
        <p id={`${id}-error`} className="text-[12px] text-danger">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
