"use client";

import { useEffect, useId, useState } from "react";
import { ExternalLink } from "lucide-react";
import { FieldShell, errorInputClass, inputClass } from "./FieldShell";

interface UrlFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Validates on blur so "htt" doesn't shout mid-type. */
export function UrlField({ label, value, onChange, error, hint, placeholder }: UrlFieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);

  useEffect(() => setTouched(false), [value]);

  const valid = isValidUrl(value);
  const shownError = error ?? (touched && !valid ? "Use a full URL, like https://www.example.com" : undefined);

  return (
    <FieldShell id={id} label={label} error={shownError} hint={hint}>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="url"
          inputMode="url"
          spellCheck={false}
          value={value}
          placeholder={placeholder ?? "https://"}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${inputClass} ${shownError ? errorInputClass : ""}`}
        />
        {valid ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open ${value} in a new tab`}
            className="grid size-9 shrink-0 place-items-center rounded-control border border-line bg-surface-2 text-text-muted transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </div>
    </FieldShell>
  );
}
