import type { CarouselItem } from "./schema";

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;

/** Best-effort default when pasting a URL. The stored `kind` is still explicit. */
export function inferMediaKind(url: string): CarouselItem["kind"] {
  try {
    if (VIDEO_EXT.test(new URL(url).pathname)) return "video";
  } catch {
    // Not a parseable URL — treat as an image until the author says otherwise.
  }
  return "image";
}

export function createCarouselItem(id: string, url: string, kind?: CarouselItem["kind"]): CarouselItem {
  const resolved = kind ?? inferMediaKind(url);
  if (resolved === "video") return { id, kind: "video", url, alt: "" };
  return { id, kind: "image", url, alt: "" };
}

/** Live editor patch: `kind` rebuilds the item so image/video shapes cannot mix. */
export type CarouselItemPatch = {
  kind?: CarouselItem["kind"];
  url?: string;
  alt?: string;
  poster?: string;
};

export function applyCarouselItemPatch(item: CarouselItem, patch: CarouselItemPatch): CarouselItem {
  const kind = patch.kind ?? item.kind;
  const url = patch.url ?? item.url;
  const alt = patch.alt ?? item.alt;

  if (kind === "video") {
    const fromPatch = Object.prototype.hasOwnProperty.call(patch, "poster");
    const posterValue = fromPatch ? patch.poster : item.kind === "video" ? item.poster : undefined;
    const poster = posterValue?.trim() ? posterValue.trim() : undefined;
    return poster ? { id: item.id, kind: "video", url, alt, poster } : { id: item.id, kind: "video", url, alt };
  }

  return { id: item.id, kind: "image", url, alt };
}
