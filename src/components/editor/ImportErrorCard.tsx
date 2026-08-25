"use client";

import { AlertCircle, X } from "lucide-react";
import { useUi } from "@/state/UiContext";

/** Persistent and dismissable — import failures outlive a toast. */
export function ImportErrorCard() {
  const { importError, setImportError } = useUi();
  if (!importError) return null;

  return (
    <div role="alert" className="rounded-panel border border-danger/50 bg-danger/8 p-3">
      <div className="flex items-start gap-2">
        <AlertCircle aria-hidden="true" className="mt-px size-4 shrink-0 text-danger" />
        <p className="flex-1 text-[13px] text-text">{importError.message}</p>
        <button
          type="button"
          onClick={() => setImportError(null)}
          aria-label="Dismiss import error"
          className="grid size-6 shrink-0 place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      </div>
      {importError.details.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1 pl-6">
          {importError.details.map((detail) => (
            <li key={detail} className="font-mono text-[11px] leading-[1.5] text-text-muted">
              {detail}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
