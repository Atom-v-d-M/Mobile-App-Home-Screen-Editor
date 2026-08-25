"use client";

import dynamic from "next/dynamic";
import { ASPECT_RATIOS } from "@/lib/constants";
import type { CarouselSection } from "@/lib/schema";

/** Swiper measures the DOM on init, so it renders client-side only. */
const CarouselPreviewImpl = dynamic(() => import("./CarouselPreview").then((mod) => mod.CarouselPreview), {
  ssr: false,
  loading: () => (
    <div className="px-4 py-3">
      <div className="rounded-[12px] bg-black/5" style={{ aspectRatio: ASPECT_RATIOS.square }} />
    </div>
  ),
});

export function CarouselPreviewClient({ section }: { section: CarouselSection }) {
  return <CarouselPreviewImpl section={section} />;
}
