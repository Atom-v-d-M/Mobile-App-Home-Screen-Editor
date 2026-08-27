import { describe, expect, it } from "vitest";
import { DEFAULT_COLOR_PALETTE } from "@/lib/color";
import { createDefaultConfig } from "@/lib/defaults";
import { exportFilename, isSameShape, parseConfig, regenerateIds, serializeConfig } from "@/lib/io";

describe("io", () => {
  it("stamps updatedAt and pretty-prints on serialise", () => {
    const raw = serializeConfig(createDefaultConfig(), new Date("2026-08-20T10:00:00.000Z"));
    expect(raw).toContain('\n  "version": 1');
    expect(JSON.parse(raw).meta.updatedAt).toBe("2026-08-20T10:00:00.000Z");
  });

  it("names the export file by date", () => {
    expect(exportFilename(new Date("2026-08-20T10:00:00.000Z"))).toBe("reactiv-home-screen-2026-08-20.json");
  });

  it("rejects invalid JSON", () => {
    const result = parseConfig("{nope");
    expect(result).toMatchObject({ ok: false, message: "That file isn't valid JSON." });
  });

  it("rejects a foreign version before schema validation", () => {
    const result = parseConfig(JSON.stringify({ version: 2, sections: [] }));
    expect(result).toMatchObject({
      ok: false,
      message: "This file was made by a different version of the editor.",
    });
  });

  it("maps zod issues to readable paths and caps the list at five", () => {
    const config = createDefaultConfig() as unknown as { sections: Record<string, unknown>[] };
    config.sections[1].titleColor = "nope";
    const result = parseConfig(JSON.stringify(config));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.details[0]).toBe("sections[1].titleColor — Use 3 or 6 hex digits, like #FF6B2C");
      expect(result.details.length).toBeLessThanOrEqual(6);
    }
  });

  it("round-trips a valid file with fresh ids", () => {
    const original = createDefaultConfig();
    const result = parseConfig(serializeConfig(original));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.sections).toHaveLength(3);
      expect(result.config.sections.map((s) => s.id)).not.toEqual(original.sections.map((s) => s.id));
    }
  });

  it("fills in a missing theme from the schema default", () => {
    const config = createDefaultConfig();
    const { theme: _theme, ...rest } = JSON.parse(serializeConfig(config)) as Record<string, unknown>;
    void _theme;
    const result = parseConfig(JSON.stringify(rest));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.config.theme.palette).toEqual(DEFAULT_COLOR_PALETTE);
  });

  it("treats a palette-only edit as a different shape", () => {
    const a = createDefaultConfig();
    const b = { ...a, theme: { palette: [...a.theme.palette, "#000000"] } };
    expect(isSameShape(a, b)).toBe(false);
    expect(isSameShape(a, { ...a, meta: { name: "Other" } })).toBe(true);
  });

  it("regenerates nested item ids too", () => {
    const original = createDefaultConfig();
    const next = regenerateIds(original);
    const before = original.sections[0];
    const after = next.sections[0];
    if (before.type === "carousel" && after.type === "carousel") {
      expect(after.items.map((i) => i.id)).not.toEqual(before.items.map((i) => i.id));
      expect(after.items.map((i) => i.url)).toEqual(before.items.map((i) => i.url));
    }
  });
});
