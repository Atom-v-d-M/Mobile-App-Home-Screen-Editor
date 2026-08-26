"use client";

import { useConfig } from "@/state/ConfigContext";
import { PanelShell } from "@/components/workspace/PanelShell";
import { AddBar } from "./AddBar";
import { ImportErrorCard } from "./ImportErrorCard";
import { ScreenSettings } from "./ScreenSettings";
import { SectionList } from "./SectionList";
import { ThemeSettings } from "./ThemeSettings";

export function EditorPanel() {
  const { config } = useConfig();

  return (
    <PanelShell title="Editor" target="editor">
      <div className="flex flex-col gap-3 p-3">
        <ImportErrorCard />
        <ThemeSettings />
        <ScreenSettings />
        <AddBar />

        {config.sections.length === 0 ? (
          <p className="rounded-panel border border-dashed border-line px-3 py-6 text-center text-[13px] text-text-muted">
            Add a section to start building
          </p>
        ) : (
          <SectionList />
        )}
      </div>
    </PanelShell>
  );
}
