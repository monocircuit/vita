"use client";

import { RefObject, useEffect, useRef, useSyncExternalStore } from "react";
import { Viewport } from "pixi-viewport";
import {
  subscribeTimelineTicks,
  getTimelineTicksSnapshot,
} from "../timelineTickStore";

interface Props {
  viewportRef: RefObject<Viewport | null>;
}

/**
 * Renders timeline period labels (years / months) and year-boundary separators
 * as DOM elements at the bottom of the viewport.
 *
 * Tick world-positions come from the external timelineTickStore (written by
 * useTimeline on every render). Screen positions are updated imperatively in a
 * RAF loop — same pattern as BranchLabelOverlay — so pan/zoom causes no React
 * re-renders.
 */
export default function TimelineLabelsOverlay({ viewportRef }: Props) {
  const ticks = useSyncExternalStore(
    subscribeTimelineTicks,
    getTimelineTicksSnapshot,
    getTimelineTicksSnapshot,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const labelElsRef = useRef<Map<string, HTMLSpanElement>>(new Map());
  const sepElsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || ticks.length === 0) return;
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const scaleX = viewport.scale.x;
      const left = viewport.left;
      const containerWidth = container.clientWidth;

      for (const tick of ticks) {
        // ── Label ──────────────────────────────────────────────────────────────
        const labelEl = labelElsRef.current.get(tick.id);
        if (labelEl) {
          const screenX = (tick.worldX - left) * scaleX;
          const screenEndX = (tick.worldEndX - left) * scaleX;
          const bandWidth = screenEndX - screenX;

          let x: number;
          let visible: boolean;

          if (tick.centered) {
            const elWidth = labelEl.offsetWidth;
            x = (screenX + screenEndX) / 2 - elWidth / 2;
            visible = bandWidth > 48 && screenEndX > 0 && screenX < containerWidth;
          } else {
            x = screenX + 8;
            visible = screenX > -20 && screenX < containerWidth + 20;
          }

          labelEl.style.transform = `translate3d(${x}px, 0, 0)`;
          labelEl.style.opacity = visible ? "1" : "0";
        }

        // ── Year-boundary separator ────────────────────────────────────────────
        if (tick.isYearBoundary) {
          const sepEl = sepElsRef.current.get(tick.id);
          if (sepEl) {
            const screenX = (tick.worldX - left) * scaleX;
            const visible = screenX > 0 && screenX < containerWidth;
            sepEl.style.transform = `translate3d(${screenX}px, 0, 0)`;
            sepEl.style.opacity = visible ? "1" : "0";
          }
        }
      }
    };

    let rafId: number;
    const loop = () => {
      update();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [ticks, viewportRef]);

  if (ticks.length === 0) return null;

  const yearBoundaryTicks = ticks.filter(t => t.isYearBoundary);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden"
      style={{ height: 32 }}
    >
      {/* Year-boundary separator lines */}
      {yearBoundaryTicks.map(tick => (
        <div
          key={`sep-${tick.id}`}
          ref={el => {
            if (el) sepElsRef.current.set(tick.id, el);
            else sepElsRef.current.delete(tick.id);
          }}
          className="absolute bottom-0 left-0 will-change-transform"
          style={{
            width: 1,
            height: 20,
            background: "var(--color-border)",
            opacity: 0,
          }}
        />
      ))}

      {/* Period labels */}
      {ticks.map(tick => (
        <span
          key={tick.id}
          ref={el => {
            if (el) labelElsRef.current.set(tick.id, el);
            else labelElsRef.current.delete(tick.id);
          }}
          className="absolute left-0 select-none will-change-transform whitespace-nowrap"
          style={{
            bottom: 4,
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
            fontWeight: "bold",
            color: "var(--color-fg)",
            opacity: 0,
          }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}
