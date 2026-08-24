import { describe, expect, it } from "vitest";
import { createDefaultConfig } from "@/lib/defaults";
import { hexColorSchema, imageUrlSchema, screenConfigSchema } from "@/lib/schema";

describe("schema", () => {
  it("accepts 3 and 6 digit hex, rejects the rest with a fixable message", () => {
    expect(hexColorSchema.safeParse("#FFF").success).toBe(true);
    expect(hexColorSchema.safeParse("#FF6B2C").success).toBe(true);
    const bad = hexColorSchema.safeParse("FF6B2C");
    expect(bad.success).toBe(false);
    if (!bad.success) expect(bad.error.issues[0].message).toBe("Use 3 or 6 hex digits, like #FF6B2C");
  });

  it("accepts http(s) and data:image URLs only", () => {
    expect(imageUrlSchema.safeParse("https://picsum.photos/seed/a/800/800").success).toBe(true);
    expect(imageUrlSchema.safeParse("data:image/png;base64,AAAA").success).toBe(true);
    expect(imageUrlSchema.safeParse("ftp://example.com/a.png").success).toBe(false);
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
        { id: "c1", type: "carousel", images: [{ id: "i1", url: "https://x.dev/a.png" }] },
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
      expect(carousel.images[0].alt).toBe("");
    }
    if (text.type === "text") expect(text.align).toBe("left");
    if (cta.type === "cta") expect(cta.fullWidth).toBe(true);
  });
});
