"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import type { Align } from "@/lib/schema";
import { SegmentedControl } from "./SegmentedControl";

const ALIGN_OPTIONS = [
  { value: "left" as const, label: "Left", glyph: <AlignLeft aria-hidden="true" className="size-3.5" /> },
  { value: "center" as const, label: "Center", glyph: <AlignCenter aria-hidden="true" className="size-3.5" /> },
  { value: "right" as const, label: "Right", glyph: <AlignRight aria-hidden="true" className="size-3.5" /> },
];

export function AlignControl({
  label = "Alignment",
  value,
  onChange,
}: {
  label?: string;
  value: Align;
  onChange: (value: Align) => void;
}) {
  return <SegmentedControl label={label} value={value} options={ALIGN_OPTIONS} onChange={onChange} />;
}
