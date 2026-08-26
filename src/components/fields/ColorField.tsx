"use client";

import { useId } from "react";
import { normaliseHex } from "@/lib/color";
import { HexColorInput } from "./HexColorInput";
import { FieldShell } from "./FieldShell";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets: string[];
  error?: string;
  hint?: string;
}

export function ColorField({ label, value, onChange, presets, error, hint }: ColorFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <FieldShell id={id} label={label} hint={hint}>
      <HexColorInput
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        hasExternalLabel
        hintId={hintId}
      />
      {presets.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset, index) => (
            <button
              key={`${preset}-${index}`}
              type="button"
              onClick={() => onChange(preset)}
              aria-label={`Use ${preset}`}
              aria-pressed={normaliseHex(value) === preset}
              className={`size-6 rounded-[7px] border transition-transform duration-150 ease-out hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-8 ${
                normaliseHex(value) === preset ? "border-accent" : "border-line"
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      ) : null}
    </FieldShell>
  );
}
