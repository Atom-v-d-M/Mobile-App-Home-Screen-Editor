"use client";

import type { TextSection } from "@/lib/schema";
import { useConfig, useConfigActions } from "@/state/ConfigContext";
import { AlignControl } from "@/components/fields/AlignControl";
import { ColorField } from "@/components/fields/ColorField";
import { TextAreaField } from "@/components/fields/TextAreaField";
import { TextField } from "@/components/fields/TextField";

export function TextForm({ section }: { section: TextSection }) {
  const { config } = useConfig();
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
          presets={config.theme.palette}
        />
        <ColorField
          label="Description colour"
          value={section.descriptionColor}
          onChange={(descriptionColor) => updateSection(section.id, { descriptionColor })}
          presets={config.theme.palette}
        />
      </div>
      <AlignControl value={section.align} onChange={(align) => updateSection(section.id, { align })} />
    </div>
  );
}
