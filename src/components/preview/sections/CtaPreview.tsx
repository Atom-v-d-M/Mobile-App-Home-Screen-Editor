"use client";

import type { CtaSection } from "@/lib/schema";
import { useUi } from "@/state/UiContext";

export function CtaPreview({ section }: { section: CtaSection }) {
  const { showToast } = useUi();

  return (
    <div className="px-4 py-3">
      <button
        type="button"
        // Never navigate from the preview — it would discard unsaved edits.
        onClick={() => showToast(`Would open ${section.href}`)}
        className={`flex min-h-[44px] items-center justify-center rounded-[12px] px-5 text-[15px] font-medium transition-opacity duration-150 ease-out hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          section.fullWidth ? "w-full" : "mx-auto w-auto"
        }`}
        style={{ backgroundColor: section.backgroundColor, color: section.labelColor }}
      >
        <span className="truncate">{section.label}</span>
      </button>
    </div>
  );
}
