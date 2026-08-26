/** Expand #abc to #aabbcc. Returns null for anything unparseable. */
export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return null;

  let value = match[1];
  if (value.length === 3) value = value.split("").map((c) => c + c).join("");

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

/** Relative luminance, 0 (black) to 1 (white). Unknown colours read as light. */
export function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.4;
}

/** Ink colour that reads on top of the given background. */
export function contrastInk(hex: string): string {
  return isDark(hex) ? "#FFFFFF" : "#111111";
}

/** WCAG contrast ratio, 1–21. Unparseable colours return 21 so we don't nag. */
export function contrastRatio(a: string, b: string): number {
  if (!parseHex(a) || !parseHex(b)) return 21;
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Accepts "f00", "#F00", "ff0000". Returns "#FF0000", or null if unparseable. */
export function normaliseHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#/, "");
  if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return null;
  const full = trimmed.length === 3 ? trimmed.split("").map((c) => c + c).join("") : trimmed;
  return `#${full.toUpperCase()}`;
}

/** Seed palette for new screens. Colour fields read the live theme array, not this. */
export const DEFAULT_COLOR_PALETTE = ["#FF6B2C", "#C2501F", "#111111", "#5A5F66", "#F4F1EA", "#FFFFFF"];

/** First seed colour not already in `palette`, otherwise black. */
export function nextPaletteColor(palette: string[]): string {
  const existing = new Set(palette.map((color) => normaliseHex(color)).filter((color): color is string => color !== null));
  for (const candidate of DEFAULT_COLOR_PALETTE) {
    if (!existing.has(candidate)) return candidate;
  }
  return "#000000";
}
