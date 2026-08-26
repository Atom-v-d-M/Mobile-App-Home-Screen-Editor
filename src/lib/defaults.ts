import { DEFAULT_COLOR_PALETTE } from "./color";
import { createId } from "./id";
import type { ScreenConfig, Section, SectionType } from "./schema";

/** Deep copy a section with fresh ids (section and nested carousel images). */
export function cloneSection(section: Section): Section {
  if (section.type === "carousel") {
    return {
      ...section,
      id: createId(),
      images: section.images.map((image) => ({ ...image, id: createId() })),
    };
  }
  return { ...section, id: createId() };
}

/** A new section of the given type, with sane, immediately-visible content. */
export function createSection(type: SectionType): Section {
  switch (type) {
    case "carousel":
      return {
        id: createId(),
        type: "carousel",
        images: [
          { id: createId(), url: "https://picsum.photos/seed/reactiv-1/800/800", alt: "" },
        ],
        aspect: "square",
        showPagination: true,
        loop: false,
      };
    case "text":
      return {
        id: createId(),
        type: "text",
        title: "Section title",
        description: "Describe the drop, the collection, or the offer.",
        titleColor: "#111111",
        descriptionColor: "#5A5F66",
        align: "left",
      };
    case "cta":
      return {
        id: createId(),
        type: "cta",
        label: "Shop the drop",
        href: "https://www.reactiv.ai",
        backgroundColor: "#FF6B2C",
        labelColor: "#FFFFFF",
        fullWidth: true,
        align: "center",
      };
  }
}

/** Seed screen. First load is never blank. */
export function createDefaultConfig(): ScreenConfig {
  return {
    version: 1,
    meta: { name: "Untitled screen" },
    theme: { palette: [...DEFAULT_COLOR_PALETTE] },
    screen: { backgroundColor: "#FFFFFF" },
    sections: [
      {
        id: createId(),
        type: "carousel",
        images: [
          { id: createId(), url: "https://picsum.photos/seed/reactiv-1/800/800", alt: "" },
          { id: createId(), url: "https://picsum.photos/seed/reactiv-2/800/800", alt: "" },
          { id: createId(), url: "https://picsum.photos/seed/reactiv-3/800/800", alt: "" },
        ],
        aspect: "square",
        showPagination: true,
        loop: false,
      },
      {
        id: createId(),
        type: "text",
        title: "Autumn capsule",
        description: "Twelve pieces, made in limited runs. Available in the app first.",
        titleColor: "#111111",
        descriptionColor: "#5A5F66",
        align: "left",
      },
      {
        id: createId(),
        type: "cta",
        label: "Shop the drop",
        href: "https://www.reactiv.ai",
        backgroundColor: "#FF6B2C",
        labelColor: "#FFFFFF",
        fullWidth: true,
        align: "center",
      },
    ],
  };
}
