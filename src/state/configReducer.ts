import { arrayMove } from "@/lib/array";
import { cloneSection, createDefaultConfig, createSection } from "@/lib/defaults";
import { createId } from "@/lib/id";
import type { CarouselImage, CarouselSection, ScreenConfig, Section, SectionType } from "@/lib/schema";

/**
 * Pure config reducer. No React, no side effects, no Date.now() outside of
 * explicit payloads — import this file directly in tests.
 */
export type ConfigAction =
  | { type: "config/load"; payload: ScreenConfig }
  | { type: "config/reset" }
  | { type: "screen/update"; payload: Partial<ScreenConfig["screen"]> }
  | { type: "section/add"; payload: { sectionType: SectionType; index?: number } }
  | { type: "section/duplicate"; payload: { id: string } }
  | { type: "section/remove"; payload: { id: string } }
  | { type: "section/reorder"; payload: { from: number; to: number } }
  | { type: "section/update"; payload: { id: string; patch: Partial<Section> } }
  | { type: "image/add"; payload: { sectionId: string; url: string } }
  | { type: "image/update"; payload: { sectionId: string; imageId: string; patch: Partial<CarouselImage> } }
  | { type: "image/remove"; payload: { sectionId: string; imageId: string } }
  | { type: "image/reorder"; payload: { sectionId: string; from: number; to: number } };

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

    case "image/add": {
      const image: CarouselImage = { id: createId(), url: action.payload.url, alt: "" };
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => ({
        ...section,
        images: [...section.images, image],
      }));
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    case "image/update": {
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => {
        const index = section.images.findIndex((image) => image.id === action.payload.imageId);
        if (index === -1) return section;

        const images = section.images.slice();
        const { id: _id, ...rest } = action.payload.patch;
        void _id;
        images[index] = { ...images[index], ...rest };
        return { ...section, images };
      });
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    case "image/remove": {
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => {
        const images = section.images.filter((image) => image.id !== action.payload.imageId);
        if (images.length === section.images.length) return section;
        return { ...section, images };
      });
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    case "image/reorder": {
      const sections = mapCarousel(state.sections, action.payload.sectionId, (section) => {
        const images = arrayMove(section.images, action.payload.from, action.payload.to);
        if (images === section.images) return section;
        return { ...section, images };
      });
      if (sections === state.sections) return state;
      return { ...state, sections };
    }

    default:
      return state;
  }
}
