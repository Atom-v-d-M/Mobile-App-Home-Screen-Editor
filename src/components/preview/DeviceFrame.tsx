"use client";

import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { contrastInk, isDark } from "@/lib/color";
import type { Device } from "@/lib/devices";

const BEZEL = 10;

function StatusBar({ ink, notch }: { ink: string; notch: Device["notch"] }) {
  const tall = notch !== "none";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6"
      style={{ height: tall ? 48 : 24, color: ink, paddingTop: tall ? 10 : 0 }}
    >
      <span className="text-[13px] font-semibold tabular-nums">9:41</span>
      <span className="flex items-center gap-1.5">
        <Signal aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
        <Wifi aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
        <BatteryFull aria-hidden="true" className="size-4" strokeWidth={2} />
      </span>
    </div>
  );
}

function Notch({ notch }: { notch: Device["notch"] }) {
  if (notch === "none") return null;

  if (notch === "island") {
    return (
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-2.5 z-30 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black"
      />
    );
  }

  return <span aria-hidden="true" className="absolute left-1/2 top-2.5 z-30 size-[11px] -translate-x-1/2 rounded-full bg-black" />;
}

interface DeviceFrameProps {
  device: Device;
  screenBackground: string;
  scale: number;
  children: ReactNode;
}

export function DeviceFrame({ device, screenBackground, scale, children }: DeviceFrameProps) {
  const ink = contrastInk(screenBackground);
  const dark = isDark(screenBackground);
  const shellWidth = device.width + BEZEL * 2;
  const shellHeight = device.height + BEZEL * 2;

  return (
    <div style={{ width: shellWidth * scale, height: shellHeight * scale }}>
      <div
        style={{
          width: shellWidth,
          height: shellHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          padding: BEZEL,
          borderRadius: device.radius + BEZEL,
          background: "#0B0B0C",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06), 0 1px 0 0 rgba(255,255,255,0.04) inset, 0 30px 60px -20px rgba(0,0,0,0.85), 0 8px 24px -12px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ borderRadius: device.radius, backgroundColor: screenBackground }}
        >
          <Notch notch={device.notch} />
          <StatusBar ink={ink} notch={device.notch} />

          <div
            className="no-scrollbar h-full w-full overflow-y-auto overscroll-contain"
            style={{ paddingTop: device.notch === "none" ? 24 : 48 }}
          >
            {children}
          </div>

          <span
            aria-hidden="true"
            className="absolute bottom-2 left-1/2 z-20 h-[5px] w-[120px] -translate-x-1/2 rounded-full"
            style={{ backgroundColor: dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.35)" }}
          />
        </div>
      </div>
    </div>
  );
}

export const DEVICE_BEZEL = BEZEL;
