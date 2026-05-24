import { useEffect, RefObject, MutableRefObject } from "react";
import { Application, Container } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { NormalizedRowFor } from "@/shared/data/tanstack";
import { computeWorldScale, PIXELS_PER_YEAR } from "../worldScale";
import { createTimeLine, TimeLineHandle, TimelineMode, MONTH_NAMES } from "../components/drawTimeLine";
import { VIEWPORT, TIMELINE, BRANCH, isMobile } from "../config";
import { getGlobalConfig, subscribeGlobal } from "../styleApi";
import { setTimelineTicks, TimelineTick } from "../timelineTickStore";
import { setTimelineState } from "../timelineStateStore";

export function useTimeline(
  appRef: RefObject<Application | null>,
  viewportRef: RefObject<Viewport | null>,
  uiContainerRef: RefObject<Container | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  chronicles: NormalizedRowFor<"chronicles">[] | undefined,
  isReady: boolean,
  fitViewFnRef: MutableRefObject<(() => void) | null>,
) {
  useEffect(() => {
    if (
      !isReady ||
      !uiContainerRef.current ||
      !viewportRef.current ||
      !containerRef.current
    )
      return;

    const uiContainer = uiContainerRef.current;
    const viewport = viewportRef.current;
    const app = appRef.current;
    if (!app || !chronicles || chronicles.length === 0) return;

    const scale = computeWorldScale(chronicles);
    if (!scale) return;

    const { minMs, worldWidth: targetWorldWidth, pixelsPerMs } = scale;
    const padding = VIEWPORT.PADDING;

    viewport.clamp({
      left: -padding,
      right: targetWorldWidth + padding,
      top: null,
      bottom: null,
      underflow: "center",
    });

    viewport.clampZoom({
      minWidth: (TIMELINE.MIN_ZOOM_DAYS / 365.25) * PIXELS_PER_YEAR,
      maxWidth: targetWorldWidth + padding * 2,
    });

    // ── Persistent timeline renderer with pooled text objects ────────────────
    // Bands must be behind the viewport (branches), labels/axis in UI layer.
    const timelineBgLayer = new Container();
    timelineBgLayer.zIndex = 0;
    app.stage.addChildAt(timelineBgLayer, 0);
    const timeline: TimeLineHandle = createTimeLine(timelineBgLayer, uiContainer);

    const renderTimeline = () => {
      const screenWidth = app.screen.width;
      const screenHeight = app.screen.height;

      const visibleStartMs = minMs + viewport.left / pixelsPerMs;
      const visibleEndMs = minMs + viewport.right / pixelsPerMs;

      const minYear = new Date(visibleStartMs).getFullYear();
      const maxYear = new Date(visibleEndMs).getFullYear();
      const yearRange = maxYear - minYear;

      const idealStep = yearRange / TIMELINE.TARGET_TICK_COUNT;
      const step = TIMELINE.ALLOWED_STEPS.find(s => s >= idealStep) || 1000;

      const smoothStart = Math.floor(minYear / step) * step;
      const smoothEnd = Math.ceil(maxYear / step) * step;

      const getScreenXFromMs = (ms: number) => {
        const worldX = (ms - minMs) * pixelsPerMs;
        return (worldX - viewport.left) * viewport.scale.x;
      };

      const mobile = isMobile();
      const offset = mobile ? TIMELINE.OFFSET_FROM_BOTTOM_MOBILE : TIMELINE.OFFSET_FROM_BOTTOM;

      // ── Determine display mode ────────────────────────────────────────────────
      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const visibleDays = (visibleEndMs - visibleStartMs) / MS_PER_DAY;
      const visibleYears = visibleDays / 365.25;

      let mode: TimelineMode;
      if (visibleDays < TIMELINE.DAY_MODE_MAX_DAYS) {
        mode = "days";
      } else if (visibleYears < TIMELINE.MONTH_MODE_MAX_YEARS) {
        mode = "months";
      } else {
        mode = "years";
      }

      // ── Emit tick positions for the React label overlay ───────────────────────
      const ticksToEmit: TimelineTick[] = [];

      if (mode === "days") {
        // Month labels at each month boundary
        const startDate = new Date(visibleStartMs);
        const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endLimit = visibleEndMs + 32 * MS_PER_DAY;
        while (cursor.getTime() <= endLimit) {
          const worldX = (cursor.getTime() - minMs) * pixelsPerMs;
          const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
          const worldEndX = (nextMonth.getTime() - minMs) * pixelsPerMs;
          const sx = (worldX - viewport.left) * viewport.scale.x;
          const ex = (worldEndX - viewport.left) * viewport.scale.x;
          if (ex >= 0 && sx <= screenWidth) {
            const id = `${cursor.getFullYear()}-${cursor.getMonth()}`;
            const label = `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;
            const isYearBoundary = cursor.getMonth() === 0;
            ticksToEmit.push({ id, label, worldX, worldEndX, centered: true, isYearBoundary });
          }
          cursor.setMonth(cursor.getMonth() + 1);
        }
      } else if (mode === "months") {
        // Year labels at each Jan 1st, left-aligned
        for (let year = minYear; year <= maxYear + 1; year++) {
          const worldX = (new Date(year, 0, 1).getTime() - minMs) * pixelsPerMs;
          const worldEndX = (new Date(year + 1, 0, 1).getTime() - minMs) * pixelsPerMs;
          const screenX = (worldX - viewport.left) * viewport.scale.x;
          if (screenX > -100 && screenX < screenWidth + 100) {
            ticksToEmit.push({ id: `${year}`, label: `${year}`, worldX, worldEndX, centered: false, isYearBoundary: true });
          }
        }
      } else {
        // Year labels spaced by step, centered in each step-wide range
        for (let year = smoothStart; year <= smoothEnd; year += step) {
          const worldX = (new Date(year, 0, 1).getTime() - minMs) * pixelsPerMs;
          const worldEndX = (new Date(year + step, 0, 1).getTime() - minMs) * pixelsPerMs;
          const sx = (worldX - viewport.left) * viewport.scale.x;
          const ex = (worldEndX - viewport.left) * viewport.scale.x;
          if (ex >= 0 && sx <= screenWidth) {
            ticksToEmit.push({ id: `${year}`, label: `${year}`, worldX, worldEndX, centered: true });
          }
        }
      }

      setTimelineTicks(ticksToEmit);
      setTimelineState({ mode, minMs, pixelsPerMs });

      const branchLineWidth = getGlobalConfig().branchThickness / BRANCH.LINE_THICKNESS_DIVISOR;

      timeline.update({
        y: screenHeight - offset,
        screenWidth,
        screenHeight,
        minYear: smoothStart,
        maxYear: smoothEnd,
        mode,
        visibleStartMs,
        visibleEndMs,
        getScreenXFromMs,
        style: {
          width: branchLineWidth,
          tickHeight: mobile ? 10 : 18,
        },
      });
    };

    fitViewFnRef.current = () => {
      const w = containerRef.current!.clientWidth;
      const h = containerRef.current!.clientHeight;
      const fitScale = w / (targetWorldWidth + padding * 2);

      viewport.plugins.get("decelerate")?.reset();
      // Ensure viewport knows the current screen size before centering
      viewport.resize(w, h);
      viewport.scale.x = fitScale;
      viewport.scale.y = 1;
      viewport.moveCenter(targetWorldWidth / 2, h / 2);
      renderTimeline();
    };

    renderTimeline();

    // ── RAF-throttled viewport listener ─────────────────────────────────────
    // Cap timeline redraws to one per animation frame. During fast panning
    // the "moved" event can fire dozens of times between frames — without
    // throttling every single one triggers a full graphics.clear() + redraw.
    let cancelled = false;
    let rafId: number | null = null;
    const throttledRender = () => {
      if (cancelled || rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (cancelled) return;
        renderTimeline();
      });
    };

    viewport.on("moved", throttledRender);
    let resizeRafId: number | null = null;
    const handleResize = () => {
      if (cancelled || resizeRafId !== null) return;
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        if (cancelled) return;
        fitViewFnRef.current?.();
      });
    };
    window.addEventListener("resize", handleResize);
    // Re-render timeline when global config changes (e.g. theme switch)
    const unsubGlobal = subscribeGlobal(throttledRender);

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      viewport.off("moved", throttledRender);
      window.removeEventListener("resize", handleResize);
      unsubGlobal();
      setTimelineTicks([]);
      setTimelineState(null);
      timeline.destroy();
      if (!timelineBgLayer.destroyed) {
        if (timelineBgLayer.parent) timelineBgLayer.parent.removeChild(timelineBgLayer);
        timelineBgLayer.destroy();
      }
    };
  }, [chronicles, isReady]);
}
