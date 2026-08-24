import { describe, expect, it } from "vitest";
import { arrayMove } from "@/lib/array";

describe("arrayMove", () => {
  const list = ["a", "b", "c"];

  it("moves an item forward", () => {
    expect(arrayMove(list, 0, 2)).toEqual(["b", "c", "a"]);
  });

  it("moves an item backward", () => {
    expect(arrayMove(list, 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("does not mutate the source", () => {
    arrayMove(list, 0, 2);
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("returns the same reference when from === to", () => {
    expect(arrayMove(list, 1, 1)).toBe(list);
  });

  it("moves between first and last, and tolerates a single-element list", () => {
    const four = ["a", "b", "c", "d"];
    expect(arrayMove(four, 0, 3)).toEqual(["b", "c", "d", "a"]);
    expect(arrayMove(four, 3, 0)).toEqual(["d", "a", "b", "c"]);

    const one = ["only"];
    expect(arrayMove(one, 0, 0)).toBe(one);
    expect(arrayMove(one, 0, 1)).toBe(one);
  });

  it("returns the same reference when an index is out of range", () => {
    expect(arrayMove(list, -1, 1)).toBe(list);
    expect(arrayMove(list, 0, 3)).toBe(list);
    expect(arrayMove(list, 5, 0)).toBe(list);
  });
});
