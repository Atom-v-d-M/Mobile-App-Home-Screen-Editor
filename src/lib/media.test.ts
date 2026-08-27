import { describe, expect, it } from "vitest";
import { applyCarouselItemPatch, createCarouselItem, inferMediaKind } from "./media";
import type { CarouselItem } from "./schema";

describe("inferMediaKind", () => {
  it("treats common video extensions as video, including query strings", () => {
    expect(inferMediaKind("https://cdn.example/clip.mp4")).toBe("video");
    expect(inferMediaKind("https://cdn.example/clip.webm")).toBe("video");
    expect(inferMediaKind("https://cdn.example/clip.mov?token=1")).toBe("video");
  });

  it("defaults everything else to image, including extensionless CDNs", () => {
    expect(inferMediaKind("https://picsum.photos/seed/a/800/800")).toBe("image");
    expect(inferMediaKind("https://cdn.example/photo.jpg")).toBe("image");
    expect(inferMediaKind("not a url")).toBe("image");
  });
});

describe("createCarouselItem", () => {
  it("infers kind from the URL when none is given", () => {
    expect(createCarouselItem("1", "https://x.dev/a.png")).toMatchObject({ kind: "image", alt: "" });
    expect(createCarouselItem("2", "https://x.dev/a.mp4")).toMatchObject({ kind: "video", alt: "" });
  });

  it("lets an explicit kind override the URL heuristic", () => {
    expect(createCarouselItem("1", "https://x.dev/a.mp4", "image").kind).toBe("image");
  });
});

describe("applyCarouselItemPatch", () => {
  const image: CarouselItem = { id: "1", kind: "image", url: "https://x.dev/a.png", alt: "Coat" };
  const video: CarouselItem = {
    id: "2",
    kind: "video",
    url: "https://x.dev/a.mp4",
    alt: "Runway",
    poster: "https://x.dev/p.jpg",
  };

  it("rebuilds as video without carrying a poster from an image", () => {
    expect(applyCarouselItemPatch(image, { kind: "video" })).toEqual({
      id: "1",
      kind: "video",
      url: "https://x.dev/a.png",
      alt: "Coat",
    });
  });

  it("drops poster when switching back to image", () => {
    expect(applyCarouselItemPatch(video, { kind: "image" })).toEqual({
      id: "2",
      kind: "image",
      url: "https://x.dev/a.mp4",
      alt: "Runway",
    });
  });

  it("omits an empty poster and keeps a real one", () => {
    expect(applyCarouselItemPatch(video, { poster: "  " })).toEqual({
      id: "2",
      kind: "video",
      url: "https://x.dev/a.mp4",
      alt: "Runway",
    });
    expect(applyCarouselItemPatch(video, { poster: "https://x.dev/new.jpg" })).toMatchObject({
      poster: "https://x.dev/new.jpg",
    });
  });
});
