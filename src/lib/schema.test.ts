import { describe, expect, it } from "vitest";
import { DEFAULT_COLOR_PALETTE } from "@/lib/color";
import { createDefaultConfig } from "@/lib/defaults";
import { hexColorSchema, mediaUrlSchema, screenConfigSchema } from "@/lib/schema";

describe("schema", () => {
  it("accepts 3 and 6 digit hex, rejects the rest with a fixable message", () => {
    expect(hexColorSchema.safeParse("#FFF").success).toBe(true);
    expect(hexColorSchema.safeParse("#FF6B2C").success).toBe(true);
    const bad = hexColorSchema.safeParse("FF6B2C");
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message).toBe("Use 3 or 6 hex digits, like #FF6B2C");
  });

  it("accepts http(s) URLs only", () => {
    expect(mediaUrlSchema.safeParse("https://picsum.photos/seed/a/800/800").success).toBe(true);
    expect(mediaUrlSchema.safeParse("https://cdn.example/clip.mp4").success).toBe(true);
    expect(mediaUrlSchema.safeParse("data:image/png;base64,AAAA").success).toBe(false);
    expect(mediaUrlSchema.safeParse("ftp://example.com/a.png").success).toBe(false);
  });

  it("round-trips the seed config through JSON", () => {
    const parsed = screenConfigSchema.safeParse(JSON.parse(JSON.stringify(createDefaultConfig())));
    expect(parsed.success).toBe(true);
  });

  it("rejects an unknown section type", () => {
    const config = createDefaultConfig() as unknown as { sections: unknown[] };
    config.sections = [{ id: "1", type: "video" }];
    expect(screenConfigSchema.safeParse(config).success).toBe(false);
  });

  it("rejects four-digit hex and non-hex letters", () => {
    for (const bad of ["#GGG", "#FFFF"]) {
      const result = hexColorSchema.safeParse(bad);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues[0].message).toBe("Use 3 or 6 hex digits, like #FF6B2C");
    }
  });

  it("applies defaults for omitted optional fields", () => {
    const parsed = screenConfigSchema.parse({
      version: 1,
      meta: { name: "Minimal" },
      screen: { backgroundColor: "#FFF" },
      sections: [
        { id: "c1", type: "carousel", items: [{ id: "i1", kind: "image", url: "https://x.dev/a.png" }] },
        {
          id: "t1",
          type: "text",
          title: "T",
          description: "D",
          titleColor: "#000",
          descriptionColor: "#111",
        },
        {
          id: "b1",
          type: "cta",
          label: "Go",
          href: "https://www.reactiv.ai",
          backgroundColor: "#FF6B2C",
          labelColor: "#FFF",
        },
      ],
    });

    const [carousel, text, cta] = parsed.sections;
    if (carousel.type === "carousel") {
      expect(carousel).toMatchObject({ aspect: "square", showPagination: true, loop: false });
      expect(carousel.items[0]).toMatchObject({ kind: "image", alt: "" });
    }
    if (text.type === "text") expect(text.align).toBe("left");
    if (cta.type === "cta") {
      expect(cta.fullWidth).toBe(true);
      expect(cta.align).toBe("center");
    }
    expect(parsed.theme.palette).toEqual(DEFAULT_COLOR_PALETTE);
  });

  it("rejects a palette entry that is not hex", () => {
    const config = createDefaultConfig();
    const result = screenConfigSchema.safeParse({ ...config, theme: { palette: ["#FF6B2C", "red"] } });
    expect(result.success).toBe(false);
  });

  it("accepts an empty palette", () => {
    const config = createDefaultConfig();
    const result = screenConfigSchema.safeParse({ ...config, theme: { palette: [] } });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.theme.palette).toEqual([]);
  });

  it("defaults video alt and keeps poster optional", () => {
    const parsed = screenConfigSchema.parse({
      version: 1,
      meta: { name: "Minimal" },
      screen: { backgroundColor: "#FFF" },
      sections: [
        {
          id: "c1",
          type: "carousel",
          items: [{ id: "v1", kind: "video", url: "https://x.dev/a.mp4" }],
        },
      ],
    });
    const [carousel] = parsed.sections;
    if (carousel.type === "carousel") {
      expect(carousel.items[0]).toEqual({ id: "v1", kind: "video", url: "https://x.dev/a.mp4", alt: "" });
    }
  });

  it("rejects a carousel item that is missing kind", () => {
    const config = createDefaultConfig();
    const carousel = config.sections[0];
    if (carousel.type !== "carousel") throw new Error("expected carousel");
    const broken = {
      ...config,
      sections: [{ ...carousel, items: [{ id: "i1", url: "https://x.dev/a.png" }] }],
    };
    expect(screenConfigSchema.safeParse(broken).success).toBe(false);
  });
});
