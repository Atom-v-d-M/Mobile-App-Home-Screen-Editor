"use client";

import type { FC, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, Trash2 } from "lucide-react";
import type { Section } from "@/lib/schema";
import { useConfig, useConfigActions } from "@/state/ConfigContext";
import { useUi } from "@/state/UiContext";
import { EDITOR_REGISTRY } from "./registry";

/** Clone in place, then expand whatever landed under the source. */
function DuplicateControl({
  sectionId,
  label,
  disabled,
}: {
  sectionId: string;
  label: string;
  disabled?: boolean;
}) {
  const { config } = useConfig();
  const { duplicateSection } = useConfigActions();
  const { setExpandedSectionId } = useUi();
  const pending = useRef(false);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    const index = config.sections.findIndex((section) => section.id === sectionId);
    const clone = index === -1 ? undefined : config.sections[index + 1];
    if (clone) setExpandedSectionId(clone.id);
  }, [config.sections, sectionId, setExpandedSectionId]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        pending.current = true;
        duplicateSection(sectionId);
      }}
      aria-label={`Duplicate ${label}`}
      className="grid size-8 place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11 disabled:pointer-events-none"
    >
      <Copy aria-hidden="true" className="size-4" />
    </button>
  );
}

/** Delete asks once, inline, and forgets after 3 seconds. No modal. */
function DeleteControl({ sectionId, label }: { sectionId: string; label: string }) {
  const { removeSection } = useConfigActions();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label={`Delete ${label}`}
        className="grid size-8 place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => removeSection(sectionId)}
        className="h-8 rounded-control border border-danger/60 px-2 text-[12px] text-danger transition-colors duration-150 ease-out hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger max-md:h-11"
      >
        Delete?
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="h-8 rounded-control px-2 text-[12px] text-text-muted transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:h-11"
      >
        Cancel
      </button>
    </span>
  );
}

interface SectionCardProps {
  section: Section;
  /** The drag activator. Rendered in the reserved gutter at the far left. */
  handle?: ReactNode;
  /** The lifted copy inside <DragOverlay> — never interactive, never expanded. */
  overlay?: boolean;
}

export function SectionCard({ section, handle, overlay = false }: SectionCardProps) {
  const { expandedSectionId, setExpandedSectionId } = useUi();
  const entry = EDITOR_REGISTRY[section.type];
  const Icon = entry.icon;
  const Form = entry.Form as FC<{ section: Section }>;
  const summary = (entry.summary as (s: Section) => string)(section);
  const expanded = !overlay && expandedSectionId === section.id;
  const bodyId = `section-body-${section.id}`;

  const body = (
    <>
      <div className="flex items-center gap-2 pl-1 pr-2">
        {handle ?? <span aria-hidden="true" className="w-6 shrink-0" />}
        <button
          type="button"
          disabled={overlay}
          onClick={() => setExpandedSectionId(expanded ? null : section.id)}
          aria-expanded={expanded}
          aria-controls={bodyId}
          className="flex min-h-[48px] flex-1 items-center gap-2.5 py-2 pr-2 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
        >
          <Icon aria-hidden="true" className="size-4 shrink-0 text-text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] text-text">{entry.label}</span>
            <span className="block truncate text-[12px] text-text-muted">{summary}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-4 shrink-0 text-text-muted transition-transform duration-150 ease-out ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
        <DuplicateControl sectionId={section.id} label={entry.label} disabled={overlay} />
        <DeleteControl sectionId={section.id} label={entry.label} />
      </div>

      {expanded ? (
        <div id={bodyId} className="border-t border-line bg-surface px-3 py-4">
          <Form section={section} />
        </div>
      ) : null}
    </>
  );

  if (overlay) {
    return (
      <div className="w-full rotate-[3deg] overflow-hidden rounded-panel border border-accent bg-surface-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]">
        {body}
      </div>
    );
  }

  return body;
}
