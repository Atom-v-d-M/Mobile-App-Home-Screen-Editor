"use client";

import type { ReactNode } from "react";

/** Shared label / hint / error scaffold for every field. */
export function FieldShell({
  id,
  label,
  error,
  hint,
  children,
  labelSuffix,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  labelSuffix?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          {label}
        </label>
        {labelSuffix}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[12px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-9 min-h-[36px] w-full rounded-control border border-line bg-surface-2 px-2.5 text-[13px] text-text placeholder:text-text-muted/60 transition-colors duration-150 ease-out hover:border-[#3A3E44] focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent max-md:h-11 max-md:min-h-[44px]";

export const errorInputClass = "border-danger focus:border-danger focus-visible:outline-danger";
