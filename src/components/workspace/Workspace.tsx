"use client";

import { Panel, PanelGroup } from "react-resizable-panels";
import { MD_BREAKPOINT } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMounted } from "@/hooks/useMounted";
import { ConfigProvider } from "@/state/ConfigContext";
import { UiProvider, useUi } from "@/state/UiContext";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { PreviewPanel } from "@/components/preview/PreviewPanel";
import { ResizeHandle } from "./ResizeHandle";
import { Toolbar } from "./Toolbar";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";

export function Workspace() {
  const mounted = useMounted();
  if (!mounted) return <WorkspaceSkeleton />;

  return (
    <ConfigProvider>
      <UiProvider>
        <WorkspaceLayout />
      </UiProvider>
    </ConfigProvider>
  );
}

function WorkspaceLayout() {
  const isDesktop = useMediaQuery(MD_BREAKPOINT);
  const { panelRatio, setPanelRatio, fullscreen, toast, dismissToast } = useUi();

  const direction = isDesktop ? "horizontal" : "vertical";
  const minSize = isDesktop ? 25 : 20;
  const defaultSize = isDesktop ? panelRatio : 50;

  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-none bg-ink">
      <Toolbar />

      <div className="min-h-0 flex-1 p-2">
        {fullscreen === "preview" ? (
          <PreviewPanel />
        ) : fullscreen === "editor" ? (
          <EditorPanel />
        ) : (
          <PanelGroup
            key={direction}
            direction={direction}
            onLayout={(sizes) => setPanelRatio(sizes[0])}
            className="h-full overflow-hidden rounded-panel border border-line"
          >
            <Panel defaultSize={defaultSize} minSize={minSize} className="min-h-0">
              <PreviewPanel />
            </Panel>
            <ResizeHandle direction={direction} ratio={panelRatio} />
            <Panel defaultSize={100 - defaultSize} minSize={minSize} className="min-h-0">
              <EditorPanel />
            </Panel>
          </PanelGroup>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {toast?.message ?? ""}
      </div>
      {toast ? (
        <div className="pointer-events-auto fixed bottom-4 left-1/2 z-[60] -translate-x-1/2">
          <button
            type="button"
            onClick={dismissToast}
            className={`rounded-control border px-3 py-2 text-[13px] shadow-lg transition-colors duration-150 ease-out ${
              toast.tone === "error"
                ? "border-danger/50 bg-surface-2 text-danger"
                : "border-line bg-surface-2 text-text"
            }`}
          >
            {toast.message}
          </button>
        </div>
      ) : null}
    </div>
  );
}
