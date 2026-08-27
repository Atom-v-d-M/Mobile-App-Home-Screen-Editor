import type { CarouselSection } from "./schema";

/** Aspect ratios shared by the preview renderer and the editor controls. */
export const ASPECT_RATIOS: Record<CarouselSection["aspect"], string> = {
  portrait: "3 / 4",
  landscape: "16 / 9",
  square: "1 / 1",
};

export const ASPECT_LABELS: Record<CarouselSection["aspect"], string> = {
  portrait: "Portrait",
  landscape: "Landscape",
  square: "Square",
};

export const SECTION_LABELS = {
  carousel: "Media carousel",
  text: "Text block",
  cta: "CTA button",
} as const;

export const STORAGE_KEY_CONFIG = "reactiv-home-editor:v1";
export const STORAGE_KEY_PANEL = "reactiv-home-editor:panel:v1";
export const STORAGE_KEY_DEVICE = "reactiv-home-editor:device:v1";
export const AUTOSAVE_DELAY_MS = 300;

export const MD_BREAKPOINT = "(min-width: 768px)";
