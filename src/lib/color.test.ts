import { describe, expect, it } from "vitest";
import { DEFAULT_COLOR_PALETTE, nextPaletteColor } from "./color";

describe("nextPaletteColor", () => {
  it("returns the first seed colour not already in the palette", () => {
    expect(nextPaletteColor([])).toBe("#FF6B2C");
    expect(nextPaletteColor(["#FF6B2C"])).toBe("#C2501F");
  });

  it("falls back to black once every seed colour is present", () => {
    expect(nextPaletteColor(DEFAULT_COLOR_PALETTE)).toBe("#000000");
  });
});
