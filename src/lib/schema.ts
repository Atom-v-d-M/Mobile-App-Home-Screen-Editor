import { z } from "zod";
import { DEFAULT_COLOR_PALETTE } from "./color";

/** Shared primitives. Messages are user-facing: say what's wrong and how to fix it. */
export const hexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use 3 or 6 hex digits, like #FF6B2C");

export const mediaUrlSchema = z.string().regex(/^https?:\/\//, "Must be an http(s) URL");

export const carouselImageItemSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("image"),
  url: mediaUrlSchema,
  alt: z.string().default(""),
});

export const carouselVideoItemSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("video"),
  url: mediaUrlSchema,
  alt: z.string().default(""),
  poster: mediaUrlSchema.optional(),
});

export const carouselItemSchema = z.discriminatedUnion("kind", [
  carouselImageItemSchema,
  carouselVideoItemSchema,
]);

export const carouselSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("carousel"),
  items: z.array(carouselItemSchema).default([]),
  aspect: z.enum(["portrait", "landscape", "square"]).default("square"),
  showPagination: z.boolean().default(true),
  loop: z.boolean().default(false),
});

export const alignSchema = z.enum(["left", "center", "right"]);

export const textSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("text"),
  title: z.string(),
  description: z.string(),
  titleColor: hexColorSchema,
  descriptionColor: hexColorSchema,
  align: alignSchema.default("left"),
});

export const ctaSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("cta"),
  label: z.string(),
  href: z.string().url("Must be a full URL, like https://www.example.com"),
  backgroundColor: hexColorSchema,
  labelColor: hexColorSchema,
  fullWidth: z.boolean().default(true),
  align: alignSchema.default("center"),
});

export const sectionSchema = z.discriminatedUnion("type", [
  carouselSectionSchema,
  textSectionSchema,
  ctaSectionSchema,
]);

export const sectionTypeSchema = z.enum(["carousel", "text", "cta"]);

export const themeSchema = z.object({
  palette: z.array(hexColorSchema).default(() => [...DEFAULT_COLOR_PALETTE]),
});

export const screenConfigSchema = z.object({
  version: z.literal(1),
  meta: z.object({
    name: z.string(),
    updatedAt: z.string().optional(),
  }),
  theme: themeSchema.default(() => ({ palette: [...DEFAULT_COLOR_PALETTE] })),
  screen: z.object({
    backgroundColor: hexColorSchema,
  }),
  sections: z.array(sectionSchema).default([]),
});

export type Align = z.infer<typeof alignSchema>;
export type CarouselItem = z.infer<typeof carouselItemSchema>;
export type CarouselImageItem = z.infer<typeof carouselImageItemSchema>;
export type CarouselVideoItem = z.infer<typeof carouselVideoItemSchema>;
export type CarouselSection = z.infer<typeof carouselSectionSchema>;
export type TextSection = z.infer<typeof textSectionSchema>;
export type CtaSection = z.infer<typeof ctaSectionSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type SectionType = z.infer<typeof sectionTypeSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type ScreenConfig = z.infer<typeof screenConfigSchema>;

/** Narrow helper: a patch that is valid for a given section type. */
export type SectionPatch<T extends Section = Section> = Partial<Omit<T, "id" | "type">>;
