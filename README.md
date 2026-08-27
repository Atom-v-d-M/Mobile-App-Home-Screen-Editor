# Home Screen Editor

A two-panel tool for building a mobile app home screen: a live device preview on one side, an editor
on the other, split by a draggable divider. Sections (media carousel, text block, CTA button) are
added, reordered, edited, and exported as JSON.

## Run

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test     # vitest run
```

Import `examples/sample-screen.json` from the toolbar (or drop it on the preview) to see a populated
screen without exporting first.

## Approach

**One source of truth.** A single `ScreenConfig` object describes the screen completely: version,
meta, screen background, and an ordered list of sections. The preview is a pure function of it — no
preview-local state, no duplicated copies. The editor is the only thing that mutates it. Export
serialises it; import replaces it.

**Reducer plus context.** `src/state/configReducer.ts` is a plain function with zero React imports,
so the whole mutation surface is unit-testable without rendering anything. `ConfigContext` wraps it
in `useReducer` and exposes `useConfigActions()` — thin action creators, so no component ever
hand-writes an action object. Every reducer branch is immutable and identity-preserving: an unknown
action, a missing id, or an out-of-range reorder returns the *same state object*, so React skips the
render entirely.

**UI state is separate.** Selected device, panel ratio, fullscreen target, which section is expanded,
toasts, and the import error live in `UiContext`. None of it is serialisable, so none of it can leak
into an export.

**zod defines the types.** Schemas are written once in `src/lib/schema.ts`; TypeScript types are
inferred from them (`z.infer`). The same definition validates imported files at runtime, so a type
and its validator cannot drift apart.

**Sections render through registries, not switch statements.** Two maps keyed by section type:
`src/components/preview/registry.ts` (type → preview renderer) and
`src/components/editor/registry.tsx` (type → label, icon, form, one-line summary). The shell code
iterates; it never enumerates types.

## Adding a fourth section type

Say the new type is `banner`. Four files:

1. `src/lib/schema.ts` — add `bannerSectionSchema`, add it to the `sectionSchema` discriminated union
   and `"banner"` to `sectionTypeSchema`. The `Section` union and every dependent type update
   themselves.
2. `src/lib/defaults.ts` — add a `case "banner"` to `createSection()` returning sensible starting
   content.
3. `src/components/preview/sections/BannerPreview.tsx` — a component taking `{ section: BannerSection }`,
   registered as one line in `preview/registry.ts`.
4. `src/components/editor/forms/BannerForm.tsx` — the same shape, registered as one entry in
   `editor/registry.tsx` with its label, icon and summary function.

Nothing in the workspace shell, the panel layout, the accordion list, the drag-and-drop wiring, or
the import/export pipeline changes. TypeScript's exhaustiveness checks on the registry maps and the
`createSection` switch will point at anything missed.

## Assumptions

- One screen per document. No multi-screen or multi-app management.
- No backend and no accounts. Persistence is `localStorage` plus JSON file export.
- Carousel media is referenced by http(s) URL. Each item has an explicit `kind` (`image` or
  `video`); there is no upload pipeline, and no YouTube/HLS embeds.
- Modern evergreen browsers. No polyfills, no legacy Safari fallbacks.
- English only. No i18n scaffolding, no RTL layout handling.
- The tool chrome is dark-only by design; the *app screen* background inside the device is
  user-configurable, and the status bar and home indicator derive their contrast from it.

## Tradeoffs

**Next.js instead of Vite.** The brief suggests Vite, and for a single client-rendered route Vite
would be the lighter choice. I chose Next because due to familiarity with the framework, and the decision costs nothing at runtime here: there is one route, no server components
doing real work, no data fetching, no API routes. The cost is paid in ceremony rather than
performance — `"use client"` boundaries on effectively the whole tree, a mount guard so
`localStorage` hydration can't mismatch server markup, and Swiper needing a `next/dynamic`
`ssr: false` wrapper because it measures layout on init.

**Plain `<img>` and `<video>` instead of `next/image`.** Users paste arbitrary media URLs.
`next/image` requires every host to be declared in `remotePatterns`, which makes user input a
config change. Optimisation is worth less here than accepting any URL that loads.

**Drag-only reordering, with the keyboard as a first-class path.** There are no up/down buttons, so
dnd-kit's `KeyboardSensor` isn't a nicety — it is the accessible reordering mechanism. Handles are
real `<button>` elements, drags are announced ("Text block moved to position 2 of 4"), and the
reorder test drives the keyboard path specifically. Touch drags are press-and-hold (180ms) because
the list scrolls on the same axis as the drag.

**The CTA doesn't navigate in the preview.** Clicking it raises a toast reading "Would open
https://…". A real navigation would unload the page and discard unsaved edits, which is a worse
failure than not demonstrating the link.

**zod as the shared source of types and validation.** Slightly more verbose than hand-written
interfaces, and it puts a runtime dependency in the type layer. In exchange, imported files are
validated by the same definition the compiler uses, and zod's issue paths map directly to
user-facing errors like `sections[2].titleColor — Use 3 or 6 hex digits, like #FF6B2C`.

## What I'd do next

- **Undo/redo.** The reducer is pure and every action is serialisable, so this is a wrapper reducer
  holding past/present/future arrays — roughly 40 lines plus a keyboard shortcut. It was cut for
  scope, not difficulty.

## Layout

```
src/lib/          schema, constants, ids, arrayMove, devices, defaults, media, colour maths, io, download
src/state/        configReducer (pure), ConfigContext, UiContext
src/hooks/        useMediaQuery, useMounted, useElementSize, useConfigIo
src/components/
  workspace/      Workspace, Toolbar, PanelShell, ResizeHandle, skeleton
  preview/        DeviceFrame, DeviceSelect, PreviewScreen, registry, section renderers
  editor/         EditorPanel, ScreenSettings, AddBar, SectionList (dnd), SectionCard, registry, forms
  fields/         TextField, TextAreaField, ColorField, UrlField, SegmentedControl, ToggleField
examples/         sample-screen.json
```

Autosave writes `home-screen-editor:v1` 300ms after the last change; the panel ratio and selected
device persist under their own keys. Storage is only ever read inside effects. Preview updates are
never debounced — only the write is.
