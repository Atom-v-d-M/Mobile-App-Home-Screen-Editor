"use client";

import { useCallback } from "react";
import { createDefaultConfig } from "@/lib/defaults";
import { downloadText } from "@/lib/download";
import { exportFilename, isSameShape, parseConfig, serializeConfig, MAX_IMPORT_BYTES } from "@/lib/io";
import { useConfig, useConfigActions } from "@/state/ConfigContext";
import { useUi } from "@/state/UiContext";

/** Import and export live together: both are just ScreenConfig in and out. */
export function useConfigIo() {
  const { config } = useConfig();
  const { loadConfig } = useConfigActions();
  const { showToast, setImportError } = useUi();

  const exportConfig = useCallback(() => {
    downloadText(exportFilename(), serializeConfig(config));
    showToast("Screen exported");
  }, [config, showToast]);

  const importFile = useCallback(
    async (file: File) => {
      setImportError(null);

      if (file.size > MAX_IMPORT_BYTES) {
        setImportError({ message: "That file is over 2 MB. Import a smaller screen file.", details: [] });
        return;
      }

      const edited = !isSameShape(config, createDefaultConfig());
      if (edited && !window.confirm("Replace your current screen? This can't be undone.")) return;

      let raw: string;
      try {
        raw = await file.text();
      } catch {
        setImportError({ message: "That file couldn't be read. Try exporting it again.", details: [] });
        return;
      }

      const result = parseConfig(raw);
      if (!result.ok) {
        // State is untouched on any failure.
        setImportError({ message: result.message, details: result.details });
        return;
      }

      loadConfig(result.config);
      showToast(`Imported ${file.name}`);
    },
    [config, loadConfig, setImportError, showToast],
  );

  return { exportConfig, importFile };
}
