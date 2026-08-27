import { arrayMove } from "@/lib/array";
import { cloneSection, createDefaultConfig, createSection } from "@/lib/defaults";
import { createId } from "@/lib/id";
import { applyCarouselItemPatch, createCarouselItem, type CarouselItemPatch } from "@/lib/media";
import type { CarouselSection, ScreenConfig, Section, SectionType } from "@/lib/schema";

/**
 * Pure config reducer. No React, no side effects, no Date.now() outside of
 * explicit payloads — import this file directly in tests.
 */
export type ConfigAction =
  | { type: "config/load"; payload: ScreenConfig }
  | { type: "config/reset" }
  | { type: "theme/update"; payload: Partial<ScreenConfig["theme"]> }
  | { type: "screen/update"; payload: Partial<ScreenConfig["screen"]> }
  | { type: "section/add"; payload: { sectionType: SectionType; index?: number } }
  | { type: "section/duplicate"; payload: { id: string } }
  | { type: "section/remove"; payload: { id: string } }
  | { type: "section/reorder"; payload: { from: number; to: number } }
  | { type: "section/update"; payload: { id: string; patch: Partial<Section> } }
  | { type: "item/add"; payload: { sectionId: string; url: string; kind?: "image" | "video" } }
  | { type: "item/update"; payload: { sectionId: string; itemId: string; patch: CarouselItemPatch } }
  | { type: "item/remove"; payload: { sectionId: string; itemId: string } }
  | { type: "item/reorder"; payload: { sectionId: string; from: number; to: number } };

/** Apply a patch to one section, keeping the discriminant untouched. */
function patchSection(section: Section, patch: Partial<Section>): Section {
  const { id: _id, type: _type, ...rest } = patch as Partial<Section> & { id?: string; type?: string };
  void _id;
  void _type;
  return { ...section, ...rest } as Section;
}

/** Replace a carousel section by id; returns the same array if nothing changed. */
function mapCarousel(
  sections: Section[],
  sectionId: string,
  update: (section: CarouselSection) => CarouselSection,
): Section[] {
  const index = sections.findIndex((section) => section.id === sectionId);
  if (index === -1) return sections;

  const current = sections[index];
  if (current.type !== "carousel") return sections;

  const next = update(current);
  if (next === current) return sections;

  const copy = sections.slice();
  copy[index] = next;
  return copy;
}

export function configReducer(state: ScreenConfig, action: ConfigAction): ScreenConfig {
  switch (action.type) {
    case "config/load":
      return action.payload;

    case "config/reset":
      return createDefaultConfig();

    case "theme/update":
      return { ...state, theme: { ...state.theme, ...action.payload } };

    case "screen/update":
      return { ...state, screen: { ...state.screen, ...action.payload } };

    case "section/add": {
      const section = createSection(action.payload.sectionType);
      const sections = state.sections.slice();
      const index = action.payload.index;
      if (index === undefined || index < 0 || index > sections.length) {
        sections.push(section);
      } else {
        sections.splice(index, 0, section);
      }
      return { ...state, sections };
    }

    case "section/duplicate": {
      const index = state.sections.findIndex((section) => section.id === action.payload.id);
      if (index === -1) return state;

      const sections = state.sections.slice();
      sections.splice(index + 1, 0, cloneSection(state.sections[index]));
      return { ...state, sections };
    }

    case "section/remove": {
      const sections = state.sections.filter((section) => section.id !== action.payload.id);
      if (sections.length === state.sections.length) return state;
      return { ...state, sections };
    }

    case "section/reorder": {
      const sections = arrayMove(state.sections, action.payload.from, action.payload.to);
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    case "section/update": {
      const index = state.sections.findIndex((section) => section.id === action.payload.id);
      if (index === -1) return state;

      const current = state.sections[index];
      const patch = action.payload.patch;
      // A patch carrying a different discriminant is not a valid update.
      if (patch.type !== undefined && patch.type !== current.type) return state;

      const sections = state.sections.slice();
      sections[index] = patchSection(current, patch);
      return { ...state, sections };
    }

    case "item/add": {
      const item = createCarouselItem(createId(), action.payload.url, action.payload.kind);
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => ({
        ...section,
        items: [...section.items, item],
      }));
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    case "item/update": {
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => {
        const index = section.items.findIndex((item) => item.id === action.payload.itemId);
        if (index === -1) return section;

        const items = section.items.slice();
        items[index] = applyCarouselItemPatch(items[index], action.payload.patch);
        return { ...section, items };
      });
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    case "item/remove": {
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => {
        const items = section.items.filter((item) => item.id !== action.payload.itemId);
        if (items.length === section.items.length) return section;
        return { ...section, items };
      });
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    case "item/reorder": {
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => {
        const items = arrayMove(section.items, action.payload.from, action.payload.to);
        if (items === section.items) return section;
        return { ...section, items };
      });
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    default:
      return state;
  }
}
