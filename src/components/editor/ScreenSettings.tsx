"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ColorField } from "@/components/fields/ColorField";
import { useConfig, useConfigActions } from "@/state/ConfigContext";

export function ScreenSettings() {
  const { config } = useConfig();
  const { updateScreen } = useConfigActions();
  const [open, setOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-panel border border-line bg-surface-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="screen-settings-body"
        className="flex min-h-[44px] w-full items-center gap-2 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      >
        <span className="flex-1 text-[13px] text-text">Screen settings</span>
        <span
          aria-hidden="true"
          className="size-4 rounded-[5px] border border-line"
          style={{ backgroundColor: config.screen.backgroundColor }}
        />
        <ChevronDown
          aria-hidden="true"
          className={`size-4 text-text-muted transition-transform duration-150 ease-out ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div id="screen-settings-body" className="border-t border-line bg-surface px-3 py-4">
          <ColorField
            label="Background"
            value={config.screen.backgroundColor}
            onChange={(backgroundColor) => updateScreen({ backgroundColor })}
            presets={config.theme.palette}
          />
        </div>
      ) : null}
    </section>
  );
}
