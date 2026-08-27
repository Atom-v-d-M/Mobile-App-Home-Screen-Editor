"use client";

import { Film, Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
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
import { ASPECT_LABELS } from "@/lib/constants";
import type { CarouselItem, CarouselSection } from "@/lib/schema";
import { useConfigActions } from "@/state/ConfigContext";
import { RatioGlyph, SegmentedControl } from "@/components/fields/SegmentedControl";
import { ToggleField } from "@/components/fields/ToggleField";
import { inputClass } from "@/components/fields/FieldShell";
import { DragHandle } from "../DragHandle";
import { DND_INSTRUCTIONS, buildAnnouncements, useSortableSensors } from "../dndConfig";

const ASPECT_OPTIONS = [
  { value: "portrait" as const, label: ASPECT_LABELS.portrait, glyph: <RatioGlyph ratio={3 / 4} /> },
  { value: "landscape" as const, label: ASPECT_LABELS.landscape, glyph: <RatioGlyph ratio={16 / 9} /> },
  { value: "square" as const, label: ASPECT_LABELS.square, glyph: <RatioGlyph ratio={1} /> },
];

const KIND_OPTIONS = [
  { value: "image" as const, label: "Image" },
  { value: "video" as const, label: "Video" },
];

function Thumbnail({ item }: { item: CarouselItem }) {
  const [broken, setBroken] = useState(false);
  const previewUrl = item.kind === "video" ? item.poster : item.url;
  useEffect(() => setBroken(false), [previewUrl]);

  if (item.kind === "video" && (!previewUrl || broken)) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-dashed border-line text-text-muted">
        <Film aria-hidden="true" className="size-4" />
      </span>
    );
  }

  if (broken || !previewUrl) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-dashed border-line text-[9px] text-text-muted">
        n/a
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={previewUrl}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="size-10 shrink-0 rounded-[8px] border border-line object-cover"
    />
  );
}

function ItemRowBody({
  sectionId,
  item,
  handle,
  interactive = true,
}: {
  sectionId: string;
  item: CarouselItem;
  handle?: React.ReactNode;
  interactive?: boolean;
}) {
  const { updateItem, removeItem } = useConfigActions();
  const urlId = useId();
  const altId = useId();
  const posterId = useId();

  return (
    <>
      {handle ?? <span aria-hidden="true" className="w-6 shrink-0" />}
      <Thumbnail item={item} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className={interactive ? undefined : "pointer-events-none"}>
          <SegmentedControl
            label="Type"
            value={item.kind}
            options={KIND_OPTIONS}
            onChange={(kind) => updateItem(sectionId, item.id, { kind })}
          />
        </div>
        <label htmlFor={urlId} className="sr-only">
          {item.kind === "video" ? "Video URL" : "Image URL"}
        </label>
        <input
          id={urlId}
          type="url"
          value={item.url}
          spellCheck={false}
          placeholder="https://"
          disabled={!interactive}
          onChange={(event) => updateItem(sectionId, item.id, { url: event.target.value })}
          className={inputClass}
        />
        <label htmlFor={altId} className="sr-only">
          Alt text
        </label>
        <input
          id={altId}
          type="text"
          value={item.alt}
          placeholder="Alt text"
          disabled={!interactive}
          onChange={(event) => updateItem(sectionId, item.id, { alt: event.target.value })}
          className={inputClass}
        />
        {item.kind === "video" ? (
          <>
            <label htmlFor={posterId} className="sr-only">
              Poster URL
            </label>
            <input
              id={posterId}
              type="url"
              value={item.poster ?? ""}
              spellCheck={false}
              placeholder="Poster URL (optional)"
              disabled={!interactive}
              onChange={(event) => updateItem(sectionId, item.id, { poster: event.target.value })}
              className={inputClass}
            />
          </>
        ) : null}
      </div>
      <button
        type="button"
        disabled={!interactive}
        onClick={() => removeItem(sectionId, item.id)}
        aria-label="Remove media"
        className="grid size-9 shrink-0 place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </>
  );
}

function SortableItemRow({ sectionId, item }: { sectionId: string; item: CarouselItem }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-2 rounded-control border border-line bg-surface p-2 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <ItemRowBody
        sectionId={sectionId}
        item={item}
        handle={
          <DragHandle
            label="Reorder media"
            handleRef={setActivatorNodeRef}
            className="mt-0.5"
            {...attributes}
            {...listeners}
          />
        }
      />
    </li>
  );
}

function AddItemRow({ sectionId }: { sectionId: string }) {
  const { addItem } = useConfigActions();
  const [draft, setDraft] = useState("");
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);

  const commit = () => {
    const value = draft.trim();
    if (!value) return;
    addItem(sectionId, value);
    setDraft("");
    ref.current?.focus();
  };

  return (
    <li className="flex items-center gap-2 pl-8">
      <label htmlFor={id} className="sr-only">
        Add media URL
      </label>
      <input
        id={id}
        ref={ref}
        type="url"
        value={draft}
        spellCheck={false}
        placeholder="Paste an image or video URL"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        className={inputClass}
      />
      <button
        type="button"
        onClick={commit}
        aria-label="Add media"
        className="grid size-9 shrink-0 place-items-center rounded-control border border-line bg-surface-2 text-text-muted transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}

/** Item sorting owns its own context, scoped to this section's ids only. */
function ItemList({ section }: { section: CarouselSection }) {
  const { reorderItems } = useConfigActions();
  const sensors = useSortableSensors();
  const [activeId, setActiveId] = useState<string | null>(null);

  const ids = section.items.map((item) => item.id);
  const active = section.items.find((item) => item.id === activeId) ?? null;

  const announcements = buildAnnouncements(
    (id) => {
      const index = ids.indexOf(id);
      const item = section.items[index];
      const kind = item?.kind === "video" ? "Video" : "Image";
      return `${kind} ${index + 1}`;
    },
    (id) => ids.indexOf(id),
    () => ids.length,
  );

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active: dragged, over } = event;
    if (!over || dragged.id === over.id) return;
    reorderItems(section.id, ids.indexOf(String(dragged.id)), ids.indexOf(String(over.id)));
  };

  return (
    <DndContext
      id={`media-${section.id}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{ announcements, screenReaderInstructions: DND_INSTRUCTIONS }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {section.items.map((item) => (
            <SortableItemRow key={item.id} sectionId={section.id} item={item} />
          ))}
          <AddItemRow sectionId={section.id} />
        </ul>
      </SortableContext>

      <DragOverlay>
        {active ? (
          <div className="flex w-full items-start gap-2 rotate-[3deg] rounded-control border border-accent bg-surface p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]">
            <ItemRowBody sectionId={section.id} item={active} interactive={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function CarouselForm({ section }: { section: CarouselSection }) {
  const { updateSection } = useConfigActions();

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label="Aspect ratio"
        value={section.aspect}
        options={ASPECT_OPTIONS}
        onChange={(aspect) => updateSection(section.id, { aspect })}
      />
      <div className="flex flex-col gap-3">
        <ToggleField
          label="Show pagination"
          checked={section.showPagination}
          onChange={(showPagination) => updateSection(section.id, { showPagination })}
        />
        <ToggleField label="Loop" checked={section.loop} onChange={(loop) => updateSection(section.id, { loop })} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Media</span>
        <ItemList section={section} />
      </div>
    </div>
  );
}
