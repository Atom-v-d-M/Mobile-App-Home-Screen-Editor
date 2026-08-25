"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MD_BREAKPOINT } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { Section } from "@/lib/schema";
import { useConfig, useConfigActions } from "@/state/ConfigContext";
import { useUi } from "@/state/UiContext";
import { DragHandle } from "./DragHandle";
import { DND_INSTRUCTIONS, buildAnnouncements, useSortableSensors } from "./dndConfig";
import { EDITOR_REGISTRY } from "./registry";
import { SectionCard } from "./SectionCard";

function SortableSectionCard({ section }: { section: Section }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`overflow-hidden rounded-panel border border-line bg-surface-2 ${isDragging ? "opacity-40" : ""}`}
    >
      <SectionCard
        section={section}
        handle={
          <DragHandle
            label={`Reorder ${EDITOR_REGISTRY[section.type].label}`}
            handleRef={setActivatorNodeRef}
            {...attributes}
            {...listeners}
          />
        }
      />
    </li>
  );
}

export function SectionList() {
  const { config } = useConfig();
  const { reorderSections } = useConfigActions();
  const { expandedSectionId, setExpandedSectionId } = useUi();
  const sensors = useSortableSensors();
  const isDesktop = useMediaQuery(MD_BREAKPOINT);
  const [activeId, setActiveId] = useState<string | null>(null);
  const collapsed = useRef<string | null>(null);

  const sections = config.sections;
  const ids = sections.map((section) => section.id);
  const active = sections.find((section) => section.id === activeId) ?? null;

  const announcements = buildAnnouncements(
    (id) => EDITOR_REGISTRY[sections.find((s) => s.id === id)?.type ?? "text"].label,
    (id) => ids.indexOf(id),
    () => sections.length,
  );

  // A layout swap mid-drag remounts the tree; cancel rather than finish.
  useEffect(() => {
    if (!activeId) return;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  }, [isDesktop]); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreExpanded = () => {
    if (collapsed.current) {
      setExpandedSectionId(collapsed.current);
      collapsed.current = null;
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    // Dragging a 400px open form around a scrolling list is miserable.
    if (expandedSectionId === id) {
      collapsed.current = id;
      setExpandedSectionId(null);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    restoreExpanded();
    const { active: dragged, over } = event;
    if (!over || dragged.id === over.id) return;
    reorderSections(ids.indexOf(String(dragged.id)), ids.indexOf(String(over.id)));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{ announcements, screenReaderInstructions: DND_INSTRUCTIONS }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        restoreExpanded();
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {sections.map((section) => (
            <SortableSectionCard key={section.id} section={section} />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay>{active ? <SectionCard section={active} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}
