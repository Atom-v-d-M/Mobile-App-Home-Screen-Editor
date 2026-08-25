"use client";

import { useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useConfig, useConfigActions } from "@/state/ConfigContext";
import { useUi } from "@/state/UiContext";
import { EDITOR_REGISTRY, SECTION_ORDER } from "./registry";

export function AddBar() {
  const { config } = useConfig();
  const { addSection } = useConfigActions();
  const { setExpandedSectionId } = useUi();
  const pending = useRef(false);

  // The reducer owns id creation, so expand whatever landed last.
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    const last = config.sections[config.sections.length - 1];
    if (last) setExpandedSectionId(last.id);
  }, [config.sections, setExpandedSectionId]);

  return (
    <div className="flex gap-2">
      {SECTION_ORDER.map((type) => {
        const entry = EDITOR_REGISTRY[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => {
              pending.current = true;
              addSection(type);
            }}
            className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-control border border-line bg-surface-2 px-2 text-[13px] text-text transition-colors duration-150 ease-out hover:border-[#3A3E44] hover:bg-[#24272B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:min-h-[44px]"
          >
            <Plus aria-hidden="true" className="size-3.5 text-text-muted" />
            {entry.addLabel}
          </button>
        );
      })}
    </div>
  );
}
