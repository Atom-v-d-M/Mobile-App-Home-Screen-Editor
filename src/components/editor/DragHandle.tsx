"use client";

import { GripVertical } from "lucide-react";
import type { ButtonHTMLAttributes, Ref } from "react";

interface DragHandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  handleRef?: Ref<HTMLButtonElement>;
  compact?: boolean;
}

/** The only drag activator. A real button, so keyboard dragging works. */
export function DragHandle({ label, handleRef, compact = false, className = "", ...rest }: DragHandleProps) {
  return (
    <button
      ref={handleRef}
      type="button"
      aria-label={label}
      className={`grid shrink-0 cursor-grab touch-none place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:cursor-grabbing ${
        compact ? "size-8 max-md:size-11" : "size-8 max-md:size-11"
      } ${className}`}
      {...rest}
    >
      <GripVertical aria-hidden="true" className="size-4" />
    </button>
  );
}
