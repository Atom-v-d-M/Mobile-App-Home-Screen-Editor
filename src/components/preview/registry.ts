import type { FC } from "react";
import type { Section, SectionType } from "@/lib/schema";
import { CarouselPreviewClient } from "./sections/CarouselPreviewClient";
import { CtaPreview } from "./sections/CtaPreview";
import { TextPreview } from "./sections/TextPreview";

/**
 * Registry, not a switch. A fourth section type is a new renderer file plus one
 * line here — no shell code changes.
 */
export const PREVIEW_RENDERERS: {
  [K in SectionType]: FC<{ section: Extract<Section, { type: K }> }>;
} = {
  carousel: CarouselPreviewClient,
  text: TextPreview,
  cta: CtaPreview,
};
