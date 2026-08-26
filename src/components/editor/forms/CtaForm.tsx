"use client";

import { AlertTriangle } from "lucide-react";
import { contrastRatio } from "@/lib/color";
import type { CtaSection } from "@/lib/schema";
import { useConfigActions } from "@/state/ConfigContext";
import { AlignControl } from "@/components/fields/AlignControl";
import { ColorField } from "@/components/fields/ColorField";
import { TextField } from "@/components/fields/TextField";
import { ToggleField } from "@/components/fields/ToggleField";
import { UrlField } from "@/components/fields/UrlField";

export function CtaForm({ section }: { section: CtaSection }) {
  const { updateSection } = useConfigActions();
  const ratio = contrastRatio(section.labelColor, section.backgroundColor);
  const lowContrast = ratio < 3;

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Label"
        value={section.label}
        onChange={(label) => updateSection(section.id, { label })}
        placeholder="Shop the drop"
      />
      <UrlField
        label="Link"
        value={section.href}
        onChange={(href) => updateSection(section.id, { href })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Background"
          value={section.backgroundColor}
          onChange={(backgroundColor) => updateSection(section.id, { backgroundColor })}
        />
        <ColorField
          label="Label colour"
          value={section.labelColor}
          onChange={(labelColor) => updateSection(section.id, { labelColor })}
        />
      </div>
      {lowContrast ? (
        <p className="flex items-start gap-2 text-[12px] text-text-muted">
          <AlertTriangle aria-hidden="true" className="mt-px size-4 shrink-0 text-[#E0A33A]" />
          Low contrast ({ratio.toFixed(1)}:1). The label may be hard to read on this background.
        </p>
      ) : null}
      <ToggleField
        label="Full width"
        checked={section.fullWidth}
        onChange={(fullWidth) => updateSection(section.id, { fullWidth })}
      />
      {!section.fullWidth ? (
        <AlignControl value={section.align} onChange={(align) => updateSection(section.id, { align })} />
      ) : null}
    </div>
  );
}
