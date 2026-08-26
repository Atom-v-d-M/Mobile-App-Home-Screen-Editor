"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useUi, type FullscreenTarget } from "@/state/UiContext";

interface PanelShellProps {
  title: string;
  target: Exclude<FullscreenTarget, "none">;
  children: ReactNode;
  headerRight?: ReactNode;
  /** Preview is a fixed canvas; the editor list needs to scroll. */
  overflow?: "auto" | "hidden";
}

export function PanelShell({ title, target, children, headerRight, overflow = "auto" }: PanelShellProps) {
  const { fullscreen, setFullscreen } = useUi();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasFullscreen = useRef(false);

  const isFullscreen = fullscreen === target;

  // Esc exits fullscreen.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setFullscreen("none");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, setFullscreen]);

  // Returning from fullscreen restores focus to the button that opened it.
  useEffect(() => {
    if (isFullscreen) {
      wasFullscreen.current = true;
    } else if (wasFullscreen.current) {
      wasFullscreen.current = false;
      buttonRef.current?.focus();
    }
  }, [isFullscreen]);

  return (
    <section
      aria-label={title}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex h-dvh flex-col bg-surface"
          : "flex h-full min-h-0 flex-col bg-surface"
      }
    >
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-line px-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">{title}</h2>
        <div className="ml-auto flex items-center gap-2">
          {headerRight}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setFullscreen(isFullscreen ? "none" : target)}
            aria-pressed={isFullscreen}
            className="grid size-8 place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
          >
            {isFullscreen ? (
              <Minimize2 aria-hidden="true" className="size-4" />
            ) : (
              <Maximize2 aria-hidden="true" className="size-4" />
            )}
            <span className="sr-only">{isFullscreen ? "Exit full screen" : "Full screen"}</span>
          </button>
        </div>
      </div>
      <div
        className={
          overflow === "hidden"
            ? "min-h-0 flex-1 overflow-hidden overscroll-none"
            : "min-h-0 flex-1 overflow-auto overscroll-contain"
        }
      >
        {children}
      </div>
    </section>
  );
}
