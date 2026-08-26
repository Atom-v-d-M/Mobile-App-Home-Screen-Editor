"use client";

import { useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import { nextPaletteColor } from "@/lib/color";
import { HexColorInput } from "./HexColorInput";

interface PaletteFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}

export function PaletteField({ label, value, onChange }: PaletteFieldProps) {
  const id = useId();
  const legendId = `${id}-legend`;

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend id={legendId} className="px-0 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
        {label}
      </legend>
      <ul className="flex flex-col gap-2" aria-labelledby={legendId}>
        {value.map((color, index) => {
          const rowId = `${id}-${index}`;
          const name = `Palette colour ${index + 1}`;
          return (
            <li key={index} className="flex items-start gap-2">
              <HexColorInput
                id={rowId}
                label={name}
                value={color}
                onChange={(next) => onChange(value.map((entry, i) => (i === index ? next : entry)))}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={`Remove ${name}`}
                className="grid size-9 shrink-0 place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...value, nextPaletteColor(value)])}
        className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-control border border-dashed border-line bg-surface-2 px-2 text-[13px] text-text transition-colors duration-150 ease-out hover:border-[#3A3E44] hover:bg-[#24272B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:min-h-[44px]"
      >
        <Plus aria-hidden="true" className="size-3.5 text-text-muted" />
        Add colour
      </button>
    </fieldset>
  );
}
