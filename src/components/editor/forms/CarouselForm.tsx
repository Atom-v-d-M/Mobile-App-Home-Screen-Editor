"use client";

import { Plus, Trash2 } from "lucide-react";
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
import type { CarouselImage, CarouselSection } from "@/lib/schema";
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

function Thumbnail({ url }: { url: string }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);

  if (broken || !url) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] border border-dashed border-line text-[9px] text-text-muted">
        n/a
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="size-10 shrink-0 rounded-[8px] border border-line object-cover"
    />
  );
}

function ImageRowBody({
  sectionId,
  image,
  handle,
  interactive = true,
}: {
  sectionId: string;
  image: CarouselImage;
  handle?: React.ReactNode;
  interactive?: boolean;
}) {
  const { updateImage, removeImage } = useConfigActions();
  const urlId = useId();
  const altId = useId();

  return (
    <>
      {handle ?? <span aria-hidden="true" className="w-6 shrink-0" />}
      <Thumbnail url={image.url} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <label htmlFor={urlId} className="sr-only">
          Image URL
        </label>
        <input
          id={urlId}
          type="url"
          value={image.url}
          spellCheck={false}
          placeholder="https://"
          disabled={!interactive}
          onChange={(event) => updateImage(sectionId, image.id, { url: event.target.value })}
          className={inputClass}
        />
        <label htmlFor={altId} className="sr-only">
          Alt text
        </label>
        <input
          id={altId}
          type="text"
          value={image.alt}
          placeholder="Alt text"
          disabled={!interactive}
          onChange={(event) => updateImage(sectionId, image.id, { alt: event.target.value })}
          className={inputClass}
        />
      </div>
      <button
        type="button"
        disabled={!interactive}
        onClick={() => removeImage(sectionId, image.id)}
        aria-label="Remove image"
        className="grid size-9 shrink-0 place-items-center rounded-control text-text-muted transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </>
  );
}

function SortableImageRow({ sectionId, image }: { sectionId: string; image: CarouselImage }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-2 rounded-control border border-line bg-surface p-2 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <ImageRowBody
        sectionId={sectionId}
        image={image}
        handle={
          <DragHandle
            label="Reorder image"
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

function AddImageRow({ sectionId }: { sectionId: string }) {
  const { addImage } = useConfigActions();
  const [draft, setDraft] = useState("");
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);

  const commit = () => {
    const value = draft.trim();
    if (!value) return;
    addImage(sectionId, value);
    setDraft("");
    ref.current?.focus();
  };

  return (
    <li className="flex items-center gap-2 pl-8">
      <label htmlFor={id} className="sr-only">
        Add image URL
      </label>
      <input
        id={id}
        ref={ref}
        type="url"
        value={draft}
        spellCheck={false}
        placeholder="Paste an image URL"
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
        aria-label="Add image"
        className="grid size-9 shrink-0 place-items-center rounded-control border border-line bg-surface-2 text-text-muted transition-colors duration-150 ease-out hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:size-11"
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
}

/** Image sorting owns its own context, scoped to this section's ids only. */
function ImageList({ section }: { section: CarouselSection }) {
  const { reorderImages } = useConfigActions();
  const sensors = useSortableSensors();
  const [activeId, setActiveId] = useState<string | null>(null);

  const ids = section.images.map((image) => image.id);
  const active = section.images.find((image) => image.id === activeId) ?? null;

  const announcements = buildAnnouncements(
    (id) => {
      const index = ids.indexOf(id);
      return `Image ${index + 1}`;
    },
    (id) => ids.indexOf(id),
    () => ids.length,
  );

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active: dragged, over } = event;
    if (!over || dragged.id === over.id) return;
    reorderImages(section.id, ids.indexOf(String(dragged.id)), ids.indexOf(String(over.id)));
  };

  return (
    <DndContext
      id={`images-${section.id}`}
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
          {section.images.map((image) => (
            <SortableImageRow key={image.id} sectionId={section.id} image={image} />
          ))}
          <AddImageRow sectionId={section.id} />
        </ul>
      </SortableContext>

      <DragOverlay>
        {active ? (
          <div className="flex w-full items-start gap-2 rotate-[3deg] rounded-control border border-accent bg-surface p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]">
            <ImageRowBody sectionId={section.id} image={active} interactive={false} />
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
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Images</span>
        <ImageList section={section} />
      </div>
    </div>
  );
}
