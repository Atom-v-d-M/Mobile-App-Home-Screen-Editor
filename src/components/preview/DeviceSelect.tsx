"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { DEVICES } from "@/lib/devices";
import { useUi } from "@/state/UiContext";

export function DeviceSelect({ scale }: { scale: number }) {
  const id = useId();
  const { selectedDeviceId, setSelectedDeviceId } = useUi();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        Device
      </label>
      <div className="relative">
        <select
          id={id}
          value={selectedDeviceId}
          onChange={(event) => setSelectedDeviceId(event.target.value)}
          className="h-9 min-h-[36px] appearance-none rounded-control border border-line bg-surface-2 pl-3 pr-8 text-[13px] text-text transition-colors duration-150 ease-out hover:border-[#3A3E44] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:h-11 max-md:min-h-[44px]"
        >
          {DEVICES.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-muted"
        />
      </div>
      <span className="font-mono text-[11px] tabular-nums text-text-muted" aria-label={`Preview scale ${Math.round(scale * 100)} percent`}>
        {Math.round(scale * 100)}%
      </span>
    </div>
  );
}
