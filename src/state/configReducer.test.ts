import { describe, expect, it, vi } from "vitest";
import { createDefaultConfig } from "@/lib/defaults";
import { screenConfigSchema, type CarouselSection, type ScreenConfig } from "@/lib/schema";
import { configReducer, type ConfigAction } from "@/state/configReducer";

// Deterministic ids: crypto.randomUUID is only reachable through lib/id.
vi.mock("@/lib/id", () => {
  let n = 0;
  return { createId: () => `id-${++n}` };
});

const base = (): ScreenConfig => createDefaultConfig();
const carouselOf = (state: ScreenConfig) => state.sections[0] as CarouselSection;

describe("configReducer", () => {
  it("seeds a populated, schema-valid screen", () => {
    const state = base();
    expect(screenConfigSchema.safeParse(state).success).toBe(true);
    expect(state.sections).toHaveLength(3);
  });

  it("returns the same state object for an unknown action", () => {
    const state = base();
    expect(configReducer(state, { type: "nope" } as unknown as ConfigAction)).toBe(state);
  });

  it("replaces state on load and reseeds on reset", () => {
    const state = base();
    const incoming: ScreenConfig = { ...base(), meta: { name: "Imported" } };
    expect(configReducer(state, { type: "config/load", payload: incoming })).toBe(incoming);
    expect(configReducer(incoming, { type: "config/reset" }).meta.name).toBe("Untitled screen");
  });

  it("updates the screen without touching sections", () => {
    const state = base();
    const next = configReducer(state, { type: "screen/update", payload: { backgroundColor: "#000" } });
    expect(next.screen.backgroundColor).toBe("#000");
    expect(next.sections).toBe(state.sections);
    expect(state.screen.backgroundColor).toBe("#FFFFFF");
  });

  it("updates the theme palette without rewriting applied colours", () => {
    const state = base();
    const next = configReducer(state, { type: "theme/update", payload: { palette: ["#000000"] } });
    expect(next.theme.palette).toEqual(["#000000"]);
    expect(next.sections).toBe(state.sections);
    expect(next.screen).toBe(state.screen);
    expect(state.sections[1]).toMatchObject({ type: "text", titleColor: "#111111" });
    expect(state.theme.palette).toHaveLength(6);
  });

  it("appends a section, or inserts at an index", () => {
    const state = base();
    const appended = configReducer(state, { type: "section/add", payload: { sectionType: "cta" } });
    expect(appended.sections).toHaveLength(4);
    expect(appended.sections[3].type).toBe("cta");

    const inserted = configReducer(state, { type: "section/add", payload: { sectionType: "text", index: 1 } });
    expect(inserted.sections[1].type).toBe("text");
  });

  it("duplicates a section under the source with a new id", () => {
    const state = base();
    const source = state.sections[1];
    const next = configReducer(state, { type: "section/duplicate", payload: { id: source.id } });

    expect(next.sections).toHaveLength(4);
    expect(next.sections[1]).toBe(source);
    expect(next.sections[2]).toMatchObject({ type: "text", title: "Autumn capsule" });
    expect(next.sections[2].id).not.toBe(source.id);
    expect(next.sections[0]).toBe(state.sections[0]);
    expect(next.sections[3]).toBe(state.sections[2]);
  });

  it("duplicates a carousel with new item ids and the same content", () => {
    const state = base();
    const source = state.sections[0] as CarouselSection;
    const next = configReducer(state, { type: "section/duplicate", payload: { id: source.id } });
    const clone = next.sections[1] as CarouselSection;

    expect(clone).toMatchObject({ type: "carousel", aspect: source.aspect, loop: source.loop });
    expect(clone.id).not.toBe(source.id);
    expect(clone.items.map((item) => item.url)).toEqual(source.items.map((item) => item.url));
    expect(clone.items.map((item) => item.id)).not.toEqual(source.items.map((item) => item.id));

    const ids = [source.id, clone.id, ...source.items.map((item) => item.id), ...clone.items.map((item) => item.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("appends when duplicating the last section and ignores a missing id", () => {
    const state = base();
    const last = state.sections[2];
    const next = configReducer(state, { type: "section/duplicate", payload: { id: last.id } });

    expect(next.sections).toHaveLength(4);
    expect(next.sections[3]).toMatchObject({ type: "cta", label: "Shop the drop" });
    expect(next.sections[3].id).not.toBe(last.id);
    expect(configReducer(state, { type: "section/duplicate", payload: { id: "ghost" } })).toBe(state);
  });

  it("removes by id and ignores a missing id", () => {
    const state = base();
    const id = state.sections[1].id;
    expect(configReducer(state, { type: "section/remove", payload: { id } }).sections).toHaveLength(2);
    expect(configReducer(state, { type: "section/remove", payload: { id: "ghost" } })).toBe(state);
  });

  it("reorders sections and refuses out-of-range moves", () => {
    const state = base();
    const moved = configReducer(state, { type: "section/reorder", payload: { from: 0, to: 2 } });
    expect(moved.sections.map((s) => s.type)).toEqual(["text", "cta", "carousel"]);
    expect(configReducer(state, { type: "section/reorder", payload: { from: 0, to: 9 } })).toBe(state);
    expect(configReducer(state, { type: "section/reorder", payload: { from: 1, to: 1 } })).toBe(state);
  });

  it("patches a section without changing its discriminant", () => {
    const state = base();
    const id = state.sections[1].id;
    const next = configReducer(state, { type: "section/update", payload: { id, patch: { title: "New" } } });
    expect(next.sections[1]).toMatchObject({ type: "text", title: "New" });
    expect(state.sections[1]).toMatchObject({ title: "Autumn capsule" });
  });

  it("ignores a patch whose type does not match the target section", () => {
    const state = base();
    const id = state.sections[1].id;
    expect(configReducer(state, { type: "section/update", payload: { id, patch: { type: "cta" } } })).toBe(state);
  });

  it("adds, updates, removes and reorders carousel items", () => {
    const state = base();
    const sectionId = state.sections[0].id;

    const added = configReducer(state, {
      type: "item/add",
      payload: { sectionId, url: "https://picsum.photos/seed/reactiv-4/800/800" },
    });
    expect(carouselOf(added).items).toHaveLength(4);
    expect(carouselOf(added).items[3]).toMatchObject({ kind: "image", url: "https://picsum.photos/seed/reactiv-4/800/800" });

    const itemId = carouselOf(state).items[0].id;
    const updated = configReducer(state, {
      type: "item/update",
      payload: { sectionId, itemId, patch: { alt: "Front" } },
    });
    expect(carouselOf(updated).items[0].alt).toBe("Front");
    expect(carouselOf(state).items[0].alt).toBe("");

    const removed = configReducer(state, { type: "item/remove", payload: { sectionId, itemId } });
    expect(carouselOf(removed).items).toHaveLength(2);

    const reordered = configReducer(state, { type: "item/reorder", payload: { sectionId, from: 0, to: 2 } });
    expect(carouselOf(reordered).items[2].id).toBe(itemId);
  });

  it("infers video from a file URL and rebuilds kind without mixing shapes", () => {
    const state = base();
    const sectionId = state.sections[0].id;

    const added = configReducer(state, {
      type: "item/add",
      payload: { sectionId, url: "https://cdn.example/look.mp4" },
    });
    const video = carouselOf(added).items.at(-1);
    expect(video).toMatchObject({ kind: "video", url: "https://cdn.example/look.mp4", alt: "" });
    expect(video && "poster" in video).toBe(false);

    const withPoster = configReducer(added, {
      type: "item/update",
      payload: { sectionId, itemId: video!.id, patch: { poster: "https://cdn.example/still.jpg" } },
    });
    expect(carouselOf(withPoster).items.at(-1)).toMatchObject({
      kind: "video",
      poster: "https://cdn.example/still.jpg",
    });

    const asImage = configReducer(withPoster, {
      type: "item/update",
      payload: { sectionId, itemId: video!.id, patch: { kind: "image" } },
    });
    expect(carouselOf(asImage).items.at(-1)).toEqual({
      id: video!.id,
      kind: "image",
      url: "https://cdn.example/look.mp4",
      alt: "",
    });
  });

  it("ignores item actions aimed at a missing or non-carousel section", () => {
    const state = base();
    const textId = state.sections[1].id;
    expect(configReducer(state, { type: "item/add", payload: { sectionId: textId, url: "https://x.dev/a.png" } })).toBe(state);
    expect(configReducer(state, { type: "item/remove", payload: { sectionId: "ghost", itemId: "x" } })).toBe(state);
    expect(
      configReducer(state, { type: "item/reorder", payload: { sectionId: state.sections[0].id, from: 0, to: 7 } }),
    ).toBe(state);
  });

  it("gives every added section a unique id", () => {
    let state = base();
    state = configReducer(state, { type: "section/add", payload: { sectionType: "text" } });
    state = configReducer(state, { type: "section/add", payload: { sectionType: "text" } });
    const ids = state.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves sibling sections referentially equal on update", () => {
    const state = base();
    const next = configReducer(state, {
      type: "section/update",
      payload: { id: state.sections[1].id, patch: { title: "Changed" } },
    });
    expect(next.sections[0]).toBe(state.sections[0]);
    expect(next.sections[2]).toBe(state.sections[2]);
    expect(next.sections[1]).not.toBe(state.sections[1]);
  });

  it("refuses a negative destination index", () => {
    const state = base();
    expect(configReducer(state, { type: "section/reorder", payload: { from: 0, to: -1 } })).toBe(state);
  });

  it("targets the right carousel when two exist", () => {
    let state = configReducer(base(), { type: "section/add", payload: { sectionType: "carousel" } });
    const first = state.sections[0] as CarouselSection;
    const second = state.sections[3] as CarouselSection;

    state = configReducer(state, {
      type: "item/add",
      payload: { sectionId: second.id, url: "https://picsum.photos/seed/second/800/800" },
    });
    expect((state.sections[0] as CarouselSection).items).toHaveLength(first.items.length);
    expect((state.sections[3] as CarouselSection).items).toHaveLength(second.items.length + 1);

    state = configReducer(state, {
      type: "item/remove",
      payload: { sectionId: first.id, itemId: first.items[0].id },
    });
    expect((state.sections[0] as CarouselSection).items).toHaveLength(first.items.length - 1);
    expect((state.sections[3] as CarouselSection).items).toHaveLength(second.items.length + 1);
  });
});
