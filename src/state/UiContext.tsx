"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AUTOSAVE_DELAY_MS, STORAGE_KEY_DEVICE, STORAGE_KEY_PANEL } from "@/lib/constants";
import { DEFAULT_DEVICE_ID, DEVICES } from "@/lib/devices";
import { readStoredString, writeStoredString } from "@/lib/storage";

export type FullscreenTarget = "none" | "preview" | "editor";

export interface Toast {
  id: string;
  message: string;
  tone: "info" | "error";
}

export interface ImportError {
  message: string;
  details: string[];
}

interface UiContextValue {
  selectedDeviceId: string;
  setSelectedDeviceId: (id: string) => void;
  panelRatio: number;
  setPanelRatio: (ratio: number) => void;
  fullscreen: FullscreenTarget;
  setFullscreen: (target: FullscreenTarget) => void;
  expandedSectionId: string | null;
  setExpandedSectionId: (id: string | null) => void;
  toast: Toast | null;
  showToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: () => void;
  importError: ImportError | null;
  setImportError: (error: ImportError | null) => void;
}

/** UI state. Deliberately separate from ScreenConfig — never serialised to JSON. */
const UiContext = createContext<UiContextValue | null>(null);

export const DEFAULT_PANEL_RATIO = 55;

export function UiProvider({ children }: { children: ReactNode }) {
  const [selectedDeviceId, setSelectedDeviceIdState] = useState(DEFAULT_DEVICE_ID);
  const [panelRatio, setPanelRatioState] = useState(DEFAULT_PANEL_RATIO);
  const [fullscreen, setFullscreen] = useState<FullscreenTarget>("none");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [importError, setImportError] = useState<ImportError | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const storedDevice = readStoredString(STORAGE_KEY_DEVICE);
    if (storedDevice && DEVICES.some((device) => device.id === storedDevice)) {
      setSelectedDeviceIdState(storedDevice);
    }
    const storedRatio = Number(readStoredString(STORAGE_KEY_PANEL));
    if (Number.isFinite(storedRatio) && storedRatio >= 10 && storedRatio <= 90) {
      setPanelRatioState(storedRatio);
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const timer = window.setTimeout(() => {
      writeStoredString(STORAGE_KEY_PANEL, String(panelRatio));
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [panelRatio]);

  const setSelectedDeviceId = useCallback((id: string) => {
    setSelectedDeviceIdState(id);
    writeStoredString(STORAGE_KEY_DEVICE, id);
  }, []);

  const setPanelRatio = useCallback((ratio: number) => setPanelRatioState(ratio), []);

  const dismissToast = useCallback(() => setToast(null), []);
  const showToast = useCallback((message: string, tone: Toast["tone"] = "info") => {
    setToast({ id: `${Date.now()}`, message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo(
    () => ({
      selectedDeviceId,
      setSelectedDeviceId,
      panelRatio,
      setPanelRatio,
      fullscreen,
      setFullscreen,
      expandedSectionId,
      setExpandedSectionId,
      toast,
      showToast,
      dismissToast,
      importError,
      setImportError,
    }),
    [
      selectedDeviceId,
      setSelectedDeviceId,
      panelRatio,
      setPanelRatio,
      fullscreen,
      expandedSectionId,
      toast,
      showToast,
      dismissToast,
      importError,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <UiProvider>");
  return ctx;
}
