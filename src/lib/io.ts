import { createId } from "./id";
import { screenConfigSchema, type ScreenConfig } from "./schema";

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export type ParseResult =
  | { ok: true; config: ScreenConfig }
  | { ok: false; message: string; details: string[] };

/** Stamp the save time and pretty-print. */
export function serializeConfig(config: ScreenConfig, now: Date = new Date()): string {
  const stamped: ScreenConfig = {
    ...config,
    meta: { ...config.meta, updatedAt: now.toISOString() },
  };
  return JSON.stringify(stamped, null, 2);
}

/** Fresh ids everywhere, so importing the same file twice can't collide. */
export function regenerateIds(config: ScreenConfig): ScreenConfig {
  return {
    ...config,
    sections: config.sections.map((section) => {
      if (section.type === "carousel") {
        return {
          ...section,
          id: createId(),
          items: section.items.map((item) => ({ ...item, id: createId() })),
        };
      }
      return { ...section, id: createId() };
    }),
  };
}

function byteLength(raw: string): number {
  return new TextEncoder().encode(raw).length;
}

function describeIssues(issues: { path: (string | number)[]; message: string }[]): string[] {
  const lines = issues.map((issue) => {
    const path = issue.path.reduce<string>((acc, part) => {
      if (typeof part === "number") return `${acc}[${part}]`;
      return acc ? `${acc}.${part}` : String(part);
    }, "");
    return path ? `${path} — ${issue.message}` : issue.message;
  });

  if (lines.length <= 5) return lines;
  return [...lines.slice(0, 5), `+${lines.length - 5} more`];
}

/** Pure: no DOM, no state. Runs the checks in order and stops at the first failure. */
export function parseConfig(raw: string): ParseResult {
  if (byteLength(raw) > MAX_IMPORT_BYTES) {
    return { ok: false, message: "That file is over 2 MB. Import a smaller screen file.", details: [] };
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, message: "That file isn't valid JSON.", details: [] };
  }

  const version = (data as { version?: unknown } | null)?.version;
  if (version !== 1) {
    return {
      ok: false,
      message: "This file was made by a different version of the editor.",
      details: [],
    };
  }

  const parsed = screenConfigSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      message: "That file has fields the editor can't read.",
      details: describeIssues(parsed.error.issues.map((issue) => ({ path: [...issue.path], message: issue.message }))),
    };
  }

  return { ok: true, config: regenerateIds(parsed.data) };
}

export function exportFilename(now: Date = new Date()): string {
  const iso = now.toISOString().slice(0, 10);
  return `home-screen-${iso}.json`;
}

/** Ignores ids and timestamps: has the user actually changed anything? */
export function isSameShape(a: ScreenConfig, b: ScreenConfig): boolean {
  const strip = (config: ScreenConfig) =>
    JSON.stringify({
      theme: config.theme,
      screen: config.screen,
      sections: config.sections.map((section) =>
        section.type === "carousel"
          ? { ...section, id: "", items: section.items.map((item) => ({ ...item, id: "" })) }
          : { ...section, id: "" },
      ),
    });
  return strip(a) === strip(b);
}
