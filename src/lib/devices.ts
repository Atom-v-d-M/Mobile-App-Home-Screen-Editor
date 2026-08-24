export type NotchStyle = "none" | "island" | "punch";

export interface Device {
  id: string;
  name: string;
  width: number;
  height: number;
  radius: number;
  notch: NotchStyle;
}

export const DEVICES: readonly Device[] = [
  { id: "iphone-se", name: "iPhone SE", width: 375, height: 667, radius: 44, notch: "none" },
  { id: "iphone-15", name: "iPhone 15", width: 393, height: 852, radius: 56, notch: "island" },
  { id: "iphone-15-pm", name: "iPhone 15 Pro Max", width: 430, height: 932, radius: 60, notch: "island" },
  { id: "pixel-8", name: "Pixel 8", width: 412, height: 915, radius: 42, notch: "punch" },
  { id: "galaxy-s24", name: "Galaxy S24", width: 360, height: 780, radius: 40, notch: "punch" },
];

export const DEFAULT_DEVICE_ID = "iphone-15";

export function getDevice(id: string): Device {
  return DEVICES.find((device) => device.id === id) ?? DEVICES[1];
}
