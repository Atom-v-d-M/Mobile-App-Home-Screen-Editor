"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { AUTOSAVE_DELAY_MS, STORAGE_KEY_CONFIG } from "@/lib/constants";
import { createDefaultConfig } from "@/lib/defaults";
import { readStoredConfig, writeStoredConfig } from "@/lib/storage";
import type { CarouselImage, ScreenConfig, Section, SectionType } from "@/lib/schema";
import { configReducer, type ConfigAction } from "./configReducer";

interface ConfigContextValue {
  config: ScreenConfig;
  dispatch: Dispatch<ConfigAction>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, dispatch] = useReducer(configReducer, undefined, createDefaultConfig);
  const hydrated = useRef(false);

  // Hydrate after mount only — never read localStorage during render.
  useEffect(() => {
    const stored = readStoredConfig(STORAGE_KEY_CONFIG);
    if (stored) dispatch({ type: "config/load", payload: stored });
    hydrated.current = true;
  }, []);

  // Debounced persistence. The preview itself is never debounced.
  useEffect(() => {
    if (!hydrated.current) return;
    const timer = window.setTimeout(() => {
      writeStoredConfig(STORAGE_KEY_CONFIG, config);
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [config]);

  const value = useMemo(() => ({ config, dispatch }), [config]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used inside <ConfigProvider>");
  return ctx;
}

/** Thin action creators so components never hand-write action objects. */
export function useConfigActions() {
  const { dispatch } = useConfig();

  const loadConfig = useCallback((payload: ScreenConfig) => dispatch({ type: "config/load", payload }), [dispatch]);
  const resetConfig = useCallback(() => dispatch({ type: "config/reset" }), [dispatch]);

  const updateTheme = useCallback(
    (payload: Partial<ScreenConfig["theme"]>) => dispatch({ type: "theme/update", payload }),
    [dispatch],
  );
  const updateScreen = useCallback(
    (payload: Partial<ScreenConfig["screen"]>) => dispatch({ type: "screen/update", payload }),
    [dispatch],
  );

  const addSection = useCallback(
    (sectionType: SectionType, index?: number) => dispatch({ type: "section/add", payload: { sectionType, index } }),
    [dispatch],
  );
  const duplicateSection = useCallback(
    (id: string) => dispatch({ type: "section/duplicate", payload: { id } }),
    [dispatch],
  );
  const removeSection = useCallback((id: string) => dispatch({ type: "section/remove", payload: { id } }), [dispatch]);
  const reorderSections = useCallback(
    (from: number, to: number) => dispatch({ type: "section/reorder", payload: { from, to } }),
    [dispatch],
  );
  const updateSection = useCallback(
    (id: string, patch: Partial<Section>) => dispatch({ type: "section/update", payload: { id, patch } }),
    [dispatch],
  );

  const addImage = useCallback(
    (sectionId: string, url: string) => dispatch({ type: "image/add", payload: { sectionId, url } }),
    [dispatch],
  );
  const updateImage = useCallback(
    (sectionId: string, imageId: string, patch: Partial<CarouselImage>) =>
      dispatch({ type: "image/update", payload: { sectionId, imageId, patch } }),
    [dispatch],
  );
  const removeImage = useCallback(
    (sectionId: string, imageId: string) => dispatch({ type: "image/remove", payload: { sectionId, imageId } }),
    [dispatch],
  );
  const reorderImages = useCallback(
    (sectionId: string, from: number, to: number) =>
      dispatch({ type: "image/reorder", payload: { sectionId, from, to } }),
    [dispatch],
  );

  return useMemo(
    () => ({
      loadConfig,
      resetConfig,
      updateTheme,
      updateScreen,
      addSection,
      duplicateSection,
      removeSection,
      reorderSections,
      updateSection,
      addImage,
      updateImage,
      removeImage,
      reorderImages,
    }),
    [
      loadConfig,
      resetConfig,
      updateTheme,
      updateScreen,
      addSection,
      duplicateSection,
      removeSection,
      reorderSections,
      updateSection,
      addImage,
      updateImage,
      removeImage,
      reorderImages,
    ],
  );
}
