"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ImageOff, VideoOff } from "lucide-react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { ASPECT_RATIOS } from "@/lib/constants";
import type { CarouselItem, CarouselSection, CarouselVideoItem } from "@/lib/schema";

function Frame({
  aspect,
  children,
}: {
  aspect: CarouselSection["aspect"];
  children: ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[12px] bg-black/5"
      style={{ aspectRatio: ASPECT_RATIOS[aspect] }}
    >
      {children}
    </div>
  );
}

function Broken({ message, icon }: { message: string; icon: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-black/15 text-black/40">
      {icon}
      <span className="px-3 text-center text-[11px]">{message}</span>
    </div>
  );
}

function ImageSlide({ url, alt, aspect }: { url: string; alt: string; aspect: CarouselSection["aspect"] }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);

  return (
    <Frame aspect={aspect}>
      {broken ? (
        <Broken message="Image didn't load" icon={<ImageOff aria-hidden="true" className="size-5" />} />
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
    </Frame>
  );
}

function slideWantsPlayback(video: HTMLVideoElement) {
  const slide = video.closest(".swiper-slide");
  return !slide || slide.classList.contains("swiper-slide-active");
}

function tryPlay(video: HTMLVideoElement) {
  video.muted = true;
  video.setAttribute("muted", "");
  video.playsInline = true;
  void video.play().catch(() => {
    // Rejected until the element has data, or if the slide is no longer active.
  });
}

function syncCarouselVideos(root: HTMLElement) {
  root.querySelectorAll("video").forEach((video) => {
    if (slideWantsPlayback(video)) tryPlay(video);
    else video.pause();
  });
}

/** Loop clones are DOM copies, so React handlers never fire on them. */
function bindPlaybackRetries(root: HTMLElement) {
  root.querySelectorAll("video").forEach((video) => {
    if (video.dataset.playbackBound === "true") return;
    video.dataset.playbackBound = "true";
    const kick = () => {
      if (slideWantsPlayback(video)) tryPlay(video);
    };
    video.addEventListener("canplay", kick);
    video.addEventListener("loadeddata", kick);
  });
}

function syncAndBind(root: HTMLElement | undefined | null) {
  if (!root) return;
  bindPlaybackRetries(root);
  syncCarouselVideos(root);
}

function VideoSlide({ item, aspect }: { item: CarouselVideoItem; aspect: CarouselSection["aspect"] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [item.url]);

  const kick = useCallback(() => {
    const node = ref.current;
    if (!node || broken) return;
    if (slideWantsPlayback(node)) tryPlay(node);
    else node.pause();
  }, [broken]);

  useEffect(() => {
    kick();
  }, [item.url, kick]);

  return (
    <Frame aspect={aspect}>
      {broken ? (
        <Broken message="Video didn't load" icon={<VideoOff aria-hidden="true" className="size-5" />} />
      ) : (
        <video
          ref={ref}
          src={item.url}
          poster={item.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          aria-label={item.alt || undefined}
          onCanPlay={kick}
          onLoadedData={kick}
          onError={() => setBroken(true)}
          className="pointer-events-none h-full w-full object-cover [&::-webkit-media-controls]:hidden"
        />
      )}
    </Frame>
  );
}

function Slide({ item, aspect }: { item: CarouselItem; aspect: CarouselSection["aspect"] }) {
  if (item.kind === "video") {
    return <VideoSlide item={item} aspect={aspect} />;
  }
  return <ImageSlide url={item.url} alt={item.alt} aspect={aspect} />;
}

export function CarouselPreview({ section }: { section: CarouselSection }) {
  if (section.items.length === 0) {
    return (
      <div className="px-4 py-3">
        <div
          className="flex items-center justify-center rounded-[12px] border border-dashed border-black/20 text-[12px] text-black/40"
          style={{ aspectRatio: ASPECT_RATIOS[section.aspect] }}
        >
          No media yet
        </div>
      </div>
    );
  }

  if (section.items.length === 1) {
    const [item] = section.items;
    return (
      <div className="px-4 py-3">
        <Slide item={item} aspect={section.aspect} />
      </div>
    );
  }

  return (
    <div className="reactiv-carousel py-3">
      <Swiper
        // Reinitialise when the slide set or the ratio changes.
        key={`${section.items.length}-${section.aspect}-${section.loop}`}
        modules={[Pagination]}
        slidesPerView={1.1}
        spaceBetween={12}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        loop={section.loop}
        pagination={section.showPagination ? { clickable: true } : false}
        onSwiper={(swiper) => {
          const root = swiper.el;
          syncAndBind(root);
          requestAnimationFrame(() => syncAndBind(root));
        }}
        onSlideChange={(swiper) => syncAndBind(swiper.el)}
        onSlideChangeTransitionEnd={(swiper) => syncAndBind(swiper?.el)}
      >
        {section.items.map((item) => (
          <SwiperSlide key={item.id}>
            <Slide item={item} aspect={section.aspect} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
