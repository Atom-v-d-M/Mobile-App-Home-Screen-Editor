"use client";

import { useState } from "react";
import { useConfigIo } from "@/hooks/useConfigIo";
import { useElementSize } from "@/hooks/useElementSize";
import { getDevice } from "@/lib/devices";
import { useConfig } from "@/state/ConfigContext";
import { useUi } from "@/state/UiContext";
import { PanelShell } from "@/components/workspace/PanelShell";
import { DeviceFrame, DEVICE_BEZEL } from "./DeviceFrame";
import { DeviceSelect } from "./DeviceSelect";
import { PreviewScreen } from "./PreviewScreen";

export function PreviewPanel() {
  const { config } = useConfig();
  const { selectedDeviceId } = useUi();
  const { importFile } = useConfigIo();
  const device = getDevice(selectedDeviceId);
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const [dropping, setDropping] = useState(false);

  const shellWidth = device.width + DEVICE_BEZEL * 2;
  const shellHeight = device.height + DEVICE_BEZEL * 2;
  const measured = width > 0 && height > 0;
  const scale = measured ? Math.min(1, (width - 48) / shellWidth, (height - 88) / shellHeight) : 1;
  const safeScale = Math.max(scale, 0.1);

  return (
    <PanelShell title="Preview" target="preview">
      <div
        ref={ref}
        className="relative h-full w-full overflow-hidden"
        onDragOver={(event) => {
          event.preventDefault();
          setDropping(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDropping(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDropping(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void importFile(file);
        }}
      >
        <div className="flex h-full w-full justify-center px-6 pb-[72px] pt-6">
          {measured ? (
            <DeviceFrame device={device} screenBackground={config.screen.backgroundColor} scale={safeScale}>
              <PreviewScreen />
            </DeviceFrame>
          ) : null}
        </div>

        {dropping ? (
          <div className="pointer-events-none absolute inset-2 z-40 grid place-items-center rounded-panel border-2 border-dashed border-accent bg-ink/70 text-[13px] text-text">
            Drop a screen JSON file to import
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 flex justify-center border-t border-line bg-surface/90 px-4 py-3 backdrop-blur">
          <DeviceSelect scale={safeScale} />
        </div>
      </div>
    </PanelShell>
  );
}
