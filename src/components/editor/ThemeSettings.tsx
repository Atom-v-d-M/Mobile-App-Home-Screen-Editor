"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PaletteField } from "@/components/fields/PaletteField";
import { useConfig, useConfigActions } from "@/state/ConfigContext";

export function ThemeSettings() {
  const { config } = useConfig();
  const { updateTheme } = useConfigActions();
  const [open, setOpen] = useState(false);
  const palette = config.theme.palette;

  return (
    <section className="overflow-hidden rounded-panel border border-line bg-surface-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="theme-settings-body"
        className="flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      >
        <span className="flex-1 text-[13px] text-text">Theme settings</span>
        {palette.length > 0 ? (
          <span className="flex shrink-0 gap-0.5" aria-hidden="true">
            {palette.slice(0, 6).map((color, index) => (
              <span
                key={`${index}-${color}`}
                className="size-3.5 rounded-[4px] border border-line"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 text-text-muted transition-transform duration-150 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div id="theme-settings-body" className="border-t border-line bg-surface px-3 py-4">
          <PaletteField
            label="Colour palette"
            value={palette}
            onChange={(next) => updateTheme({ palette: next })}
          />
        </div>
      ) : null}
    </section>
  );
}
