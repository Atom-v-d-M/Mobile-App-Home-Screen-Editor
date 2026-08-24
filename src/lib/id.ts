/**
 * Single indirection over crypto.randomUUID so tests can stub ids
 * (vi.mock("@/lib/id")) without touching globals.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
