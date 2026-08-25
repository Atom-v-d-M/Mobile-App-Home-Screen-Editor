"use client";

import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/**
 * Shared sensor setup.
 * - distance 6: a click on the handle isn't a zero-length drag.
 * - touch delay 180ms: the list scrolls on the same axis as the drag, so
 *   touch drags must be press-and-hold or scrolling becomes impossible.
 */
export function useSortableSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

/** Screen-reader instructions shared by both sortable lists. */
export const DND_INSTRUCTIONS = {
  draggable:
    "Press space to lift. Use the up and down arrow keys to move it, space to drop, escape to cancel.",
};

/** Announcement set built from a live list of item names. */
export function buildAnnouncements(getName: (id: string) => string, getIndex: (id: string) => number, count: () => number) {
  const position = (id: string) => `${getIndex(id) + 1} of ${count()}`;

  return {
    onDragStart({ active }: { active: { id: string | number } }) {
      const id = String(active.id);
      if (count() < 2) return `${getName(id)} is the only item, so it can't be moved.`;
      return `Picked up ${getName(id)}. It is in position ${position(id)}.`;
    },
    onDragOver({ active, over }: { active: { id: string | number }; over: { id: string | number } | null }) {
      if (!over) return undefined;
      const id = String(active.id);
      return `${getName(id)} moved to position ${position(String(over.id))}.`;
    },
    onDragEnd({ active, over }: { active: { id: string | number }; over: { id: string | number } | null }) {
      const id = String(active.id);
      if (!over) return `${getName(id)} was dropped where it started.`;
      return `${getName(id)} dropped at position ${position(String(over.id))}.`;
    },
    onDragCancel({ active }: { active: { id: string | number } }) {
      return `Reordering cancelled. ${getName(String(active.id))} returned to position ${position(String(active.id))}.`;
    },
  };
}
