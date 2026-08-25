"use client";

import type { TextSection } from "@/lib/schema";

export function TextPreview({ section }: { section: TextSection }) {
  return (
    <div className="px-4 py-3" style={{ textAlign: section.align }}>
      {section.title ? (
        <h3
          className="text-[17px] font-semibold leading-tight tracking-[-0.01em] break-words hyphens-auto"
          style={{ color: section.titleColor, textWrap: "pretty" }}
        >
          {section.title}
        </h3>
      ) : null}
      {section.description ? (
        <p
          className="mt-1.5 text-[13px] leading-[1.5] break-words hyphens-auto"
          style={{ color: section.descriptionColor, textWrap: "pretty" }}
        >
          {section.description}
        </p>
      ) : null}
    </div>
  );
}
