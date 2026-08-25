"use client";

import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import type { TextSection } from "@/lib/schema";
import { useConfigActions } from "@/state/ConfigContext";
import { ColorField } from "@/components/fields/ColorField";
import { SegmentedControl } from "@/components/fields/SegmentedControl";
import { TextAreaField } from "@/components/fields/TextAreaField";
import { TextField } from "@/components/fields/TextField";

const ALIGN_OPTIONS = [
  { value: "left" as const, label: "Left", glyph: <AlignLeft aria-hidden="true" className="size-3.5" /> },
  { value: "center" as const, label: "Center", glyph: <AlignCenter aria-hidden="true" className="size-3.5" /> },
  { value: "right" as const, label: "Right", glyph: <AlignRight aria-hidden="true" className="size-3.5" /> },
];

export function TextForm({ section }: { section: TextSection }) {
  const { updateSection } = useConfigActions();

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Title"
        value={section.title}
        onChange={(title) => updateSection(section.id, { title })}
        placeholder="Autumn capsule"
      />
      <TextAreaField
        label="Description"
        value={section.description}
        onChange={(description) => updateSection(section.id, { description })}
        placeholder="Describe the drop"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Title colour"
          value={section.titleColor}
          onChange={(titleColor) => updateSection(section.id, { titleColor })}
        />
        <ColorField
          label="Description colour"
          value={section.descriptionColor}
          onChange={(descriptionColor) => updateSection(section.id, { descriptionColor })}
        />
      </div>
      <SegmentedControl
        label="Alignment"
        value={section.align}
        options={ALIGN_OPTIONS}
        onChange={(align) => updateSection(section.id, { align })}
      />
    </div>
  );
}
