"use client";

import type { FC } from "react";
import { Plus } from "lucide-react";
import type { Section } from "@/lib/schema";
import { useConfig, useConfigActions } from "@/state/ConfigContext";
import { PREVIEW_RENDERERS } from "./registry";
import { SectionErrorBoundary } from "./SectionErrorBoundary";

export function PreviewScreen() {
  const { config } = useConfig();
  const { addSection } = useConfigActions();

  if (config.sections.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-[14px] text-black/55">Add a section to start building</p>
        <button
          type="button"
          onClick={() => addSection("carousel")}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-accent px-4 text-[14px] font-medium text-white transition-opacity duration-150 ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add a section
        </button>
      </div>
    );
  }

  return (
    <div className="pb-10 pt-2">
      {config.sections.map((section) => {
        const Renderer = PREVIEW_RENDERERS[section.type] as FC<{ section: Section }>;
        return (
          <SectionErrorBoundary key={section.id}>
            <div data-testid="preview-section" data-section-type={section.type}>
              <Renderer section={section} />
            </div>
          </SectionErrorBoundary>
        );
      })}
    </div>
  );
}
