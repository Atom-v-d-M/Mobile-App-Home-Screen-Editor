"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { ASPECT_RATIOS } from "@/lib/constants";
import type { CarouselSection } from "@/lib/schema";

function Slide({ url, alt, aspect }: { url: string; alt: string; aspect: CarouselSection["aspect"] }) {
  const [broken, setBroken] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-[12px] bg-black/5"
      style={{ aspectRatio: ASPECT_RATIOS[aspect] }}
    >
      {broken ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-black/15 text-black/40">
          <ImageOff aria-hidden="true" className="size-5" />
          <span className="px-3 text-center text-[11px]">Image didn&apos;t load</span>
        </div>
      ) : (
        // Plain <img>: users paste arbitrary hosts, next/image would need remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export function CarouselPreview({ section }: { section: CarouselSection }) {
  if (section.images.length === 0) {
    return (
      <div className="px-4 py-3">
        <div
          className="flex items-center justify-center rounded-[12px] border border-dashed border-black/20 text-[12px] text-black/40"
          style={{ aspectRatio: ASPECT_RATIOS[section.aspect] }}
        >
          No images yet
        </div>
      </div>
    );
  }

  // A single image needs no swiping.
  if (section.images.length === 1) {
    const [image] = section.images;
    return (
      <div className="px-4 py-3">
        <Slide url={image.url} alt={image.alt} aspect={section.aspect} />
      </div>
    );
  }

  return (
    <div className="reactiv-carousel py-3">
      <Swiper
        // Reinitialise when the slide set or the ratio changes.
        key={`${section.images.length}-${section.aspect}`}
        modules={[Pagination]}
        slidesPerView={1.1}
        spaceBetween={12}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        loop={section.loop}
        pagination={section.showPagination ? { clickable: true } : false}
      >
        {section.images.map((image) => (
          <SwiperSlide key={image.id}>
            <Slide url={image.url} alt={image.alt} aspect={section.aspect} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
