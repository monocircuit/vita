"use client";

import { useEffect, RefObject } from "react";
import { Application } from "pixi.js";
import { useTheme } from "@/hooks/useTheme";
import {
  setGlobalConfig,
  getGlobalConfig,
  LIGHT_THEME,
  DARK_THEME,
} from "../styleApi";

/**
 * Bridges the CSS theme system to the PixiJS canvas.
 *
 * Listens to `resolvedTheme` from next-themes, swaps the canvas theme
 * colors in the global styleApi, and updates the renderer background.
 * All draw functions that read from `getGlobalConfig().theme` will
 * automatically pick up the new palette on next frame.
 */
export function useCanvasTheme(appRef: RefObject<Application | null>, isReady: boolean) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!isReady) return;

    const isDark = resolvedTheme === "dark";
    const theme = isDark ? DARK_THEME : LIGHT_THEME;

    // Update branch/connection colors to match the theme foreground
    setGlobalConfig({
      branchColor: isDark ? 0xededed : 0x000000,
      connectionColor: isDark ? 0xededed : 0x000000,
      theme,
    });

    // Update canvas background
    const app = appRef.current;
    if (app?.renderer) {
      app.renderer.background.color = theme.canvasBg;
    }
  }, [resolvedTheme, isReady, appRef]);
}
