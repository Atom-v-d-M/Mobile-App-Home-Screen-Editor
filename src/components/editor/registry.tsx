import type { FC } from "react";
import { GalleryHorizontalEnd, MousePointerClick, Type, type LucideIcon } from "lucide-react";
import { ASPECT_LABELS } from "@/lib/constants";
import type { Section, SectionType } from "@/lib/schema";
import { CarouselForm } from "./forms/CarouselForm";
import { CtaForm } from "./forms/CtaForm";
import { TextForm } from "./forms/TextForm";

interface EditorEntry<K extends SectionType> {
  label: string;
  addLabel: string;
  icon: LucideIcon;
  Form: FC<{ section: Extract<Section, { type: K }> }>;
  summary: (section: Extract<Section, { type: K }>) => string;
}

/** Registry, not a switch: a new type is a new form file plus one entry. */
export const EDITOR_REGISTRY: { [K in SectionType]: EditorEntry<K> } = {
  carousel: {
    label: "Image carousel",
    addLabel: "Carousel",
    icon: GalleryHorizontalEnd,
    Form: CarouselForm,
    summary: (section) =>
      `${section.images.length} ${section.images.length === 1 ? "image" : "images"} · ${ASPECT_LABELS[
        section.aspect
      ].toLowerCase()}`,
  },
  text: {
    label: "Text block",
    addLabel: "Text",
    icon: Type,
    Form: TextForm,
    summary: (section) => section.title || section.description || "Empty text block",
  },
  cta: {
    label: "CTA button",
    addLabel: "CTA",
    icon: MousePointerClick,
    Form: CtaForm,
    summary: (section) => section.label || "Untitled button",
  },
};

export const SECTION_ORDER: SectionType[] = ["carousel", "text", "cta"];
