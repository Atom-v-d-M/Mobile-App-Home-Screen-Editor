"use client";

import { useRef } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { useConfigIo } from "@/hooks/useConfigIo";
import { useConfigActions } from "@/state/ConfigContext";
import { useUi } from "@/state/UiContext";

const buttonClass =
  "inline-flex h-9 min-h-[36px] items-center gap-2 rounded-control border border-line bg-surface-2 px-3 text-[13px] text-text transition-colors duration-150 ease-out hover:border-[#3A3E44] hover:bg-[#24272B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:h-11 max-md:min-h-[44px]";

export function Toolbar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { exportConfig, importFile } = useConfigIo();
  const { resetConfig } = useConfigActions();
  const { setImportError, setExpandedSectionId, showToast } = useUi();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 md:px-4">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-accent text-[13px] font-semibold text-white"
      >
        R
      </span>
      <h1 className="truncate text-[13px] font-medium tracking-[-0.01em] text-text">Mobile Home Screen Editor</h1>

      <div className="ml-auto flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-label="Import screen JSON"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFile(file);
            event.target.value = "";
          }}
        />
        <button type="button" className={buttonClass} onClick={() => inputRef.current?.click()}>
          <Upload aria-hidden="true" className="size-4 text-text-muted" />
          <span className="max-sm:sr-only">Import</span>
        </button>
        <button type="button" className={buttonClass} onClick={exportConfig}>
          <Download aria-hidden="true" className="size-4 text-text-muted" />
          <span className="max-sm:sr-only">Export</span>
        </button>
        <button
          type="button"
          className={`${buttonClass} w-9 justify-center px-0 max-md:w-11`}
          aria-label="Reset screen"
          onClick={() => {
            if (!window.confirm("Reset to the starter screen? This can't be undone.")) return;
            resetConfig();
            setExpandedSectionId(null);
            setImportError(null);
            showToast("Screen reset");
          }}
        >
          <RotateCcw aria-hidden="true" className="size-4 text-text-muted" />
        </button>
      </div>
    </header>
  );
}
