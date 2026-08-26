"use client";

import { useState } from "react";
import { PanelResizeHandle } from "react-resizable-panels";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  /** Left/top panel size as a percentage — used for the live readout. */
  ratio: number;
}

/**
 * The signature element. A hairline that thickens and turns accent on
 * hover/drag, with a pill grip and a live ratio readout while dragging.
 * Wraps the library handle so role="separator" and arrow-key resize survive.
 */
export function ResizeHandle({ direction, ratio }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const isHorizontal = direction === "horizontal";
  const left = Math.round(ratio);
  const right = 100 - left;

  return (
    <PanelResizeHandle
      onDragging={setDragging}
      className={`group relative z-20 shrink-0 bg-transparent touch-none focus-visible:outline-none ${
        isHorizontal ? "w-3 cursor-col-resize" : "h-10 cursor-row-resize"
      }`}
    >
      {/* hairline */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bg-line transition-all duration-150 ease-out group-hover:bg-accent group-focus-visible:bg-accent ${
          dragging ? "bg-accent" : ""
        } ${
          isHorizontal
            ? `inset-y-0 left-1/2 -translate-x-1/2 ${dragging ? "w-[3px]" : "w-px group-hover:w-[3px] group-focus-visible:w-[3px]"}`
            : `inset-x-0 top-1/2 -translate-y-1/2 ${dragging ? "h-[3px]" : "h-px group-hover:h-[3px] group-focus-visible:h-[3px]"}`
        }`}
      />
      {/* pill grip */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-150 ease-out ${
          dragging ? "bg-accent" : "bg-line group-hover:bg-accent-dim"
        } ${isHorizontal ? "h-8 w-[3px]" : "h-[3px] w-8"}`}
      />
      {/* live ratio readout */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-ink px-2 py-1 font-mono text-[11px] tabular-nums text-text transition-opacity duration-150 ease-out ${
          dragging ? "opacity-100" : "opacity-0"
        }`}
      >
        {left} / {right}
      </span>
    </PanelResizeHandle>
  );
}
