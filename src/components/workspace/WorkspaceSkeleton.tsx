export function WorkspaceSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-ink" aria-busy="true" aria-label="Loading editor">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
        <div className="size-7 rounded-[8px] bg-surface-2" />
        <div className="h-3 w-52 rounded-full bg-surface-2" />
        <div className="ml-auto flex gap-2">
          <div className="h-9 w-24 rounded-control bg-surface-2" />
          <div className="h-9 w-24 rounded-control bg-surface-2" />
          <div className="h-9 w-9 rounded-control bg-surface-2" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-px bg-line md:flex-row">
        <div className="min-h-0 flex-1 bg-surface" />
        <div className="min-h-0 flex-1 bg-surface" />
      </div>
    </div>
  );
}
