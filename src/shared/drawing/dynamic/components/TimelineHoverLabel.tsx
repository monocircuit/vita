"use client";

import { RefObject, useEffect, useRef } from "react";
import { Viewport } from "pixi-viewport";
import { getTimelineState } from "../timelineStateStore";
import { MONTH_NAMES } from "./drawTimeLine";

interface Props {
  viewportRef: RefObject<Viewport | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

function formatExactDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()}. ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function getBandBounds(ms: number, mode: "years" | "months" | "days"): [number, number] {
  const date = new Date(ms);
  if (mode === "years") {
    const y = date.getFullYear();
    return [new Date(y, 0, 1).getTime(), new Date(y + 1, 0, 1).getTime()];
  }
  if (mode === "months") {
    return [
      new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
      new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime(),
    ];
  }
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return [dayStart, dayStart + 864e5];
}

/**
 * Renders a band highlight + exact-date pill on hover.
 *
 * Uses a RAF loop (same pattern as BranchLabelOverlay) so highlight and pill
 * stay correct during pan and zoom without any viewport event listeners.
 * The pill is a React JSX element; its content and position are updated
 * imperatively each frame to avoid React re-renders on pointer move.
 */
export default function TimelineHoverLabel({ viewportRef, containerRef }: Props) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const lastScreenX = useRef<number | null>(null);

  useEffect(() => {
    const canvas = containerRef.current;
    const highlightEl = highlightRef.current;
    const pillEl = pillRef.current;
    if (!canvas || !highlightEl || !pillEl) return;

    const compute = () => {
      const screenX = lastScreenX.current;
      if (screenX === null) return;

      const viewport = viewportRef.current;
      const state = getTimelineState();
      if (!viewport || !state) return;

      const worldX = screenX / viewport.scale.x + viewport.left;
      const ms = state.minMs + worldX / state.pixelsPerMs;

      // ── Band highlight ──────────────────────────────────────────────────────
      const [bandStartMs, bandEndMs] = getBandBounds(ms, state.mode);
      const sx = ((bandStartMs - state.minMs) * state.pixelsPerMs - viewport.left) * viewport.scale.x;
      const ex = ((bandEndMs - state.minMs) * state.pixelsPerMs - viewport.left) * viewport.scale.x;
      highlightEl.style.transform = `translate3d(${sx}px, 0, 0)`;
      highlightEl.style.width = `${Math.max(0, ex - sx)}px`;
      highlightEl.style.opacity = "1";

      // ── Pill ───────────────────────────────────────────────────────────────
      pillEl.textContent = formatExactDate(ms);
      const pillWidth = pillEl.offsetWidth;
      const containerWidth = canvas.clientWidth;
      const x = Math.min(Math.max(screenX - pillWidth / 2, 8), containerWidth - pillWidth - 8);
      pillEl.style.transform = `translate3d(${x}px, 0, 0)`;
      pillEl.style.opacity = "1";
    };

    const hide = () => {
      highlightEl.style.opacity = "0";
      pillEl.style.opacity = "0";
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      lastScreenX.current = e.clientX - rect.left;
    };

    const onLeave = () => {
      lastScreenX.current = null;
      hide();
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    let rafId: number;
    const loop = () => {
      compute();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(rafId);
    };
  }, [viewportRef, containerRef]);

  return (
    <>
      {/* Full-height band highlight */}
      <div
        ref={highlightRef}
        className="absolute inset-y-0 left-0 pointer-events-none will-change-transform"
        style={{
          background: "color-mix(in srgb, var(--color-fg) 6%, transparent)",
          opacity: 0,
        }}
      />

      {/* Exact-date pill — content set imperatively, element is React JSX */}
      <div
        ref={pillRef}
        className="absolute bottom-4 left-0 pointer-events-none select-none whitespace-nowrap will-change-transform"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-fg)",
          background: "var(--color-bg)",
          border: "0.5px solid var(--color-border)",
          borderRadius: 9999,
          padding: "3px 10px",
          lineHeight: 1.4,
          opacity: 0,
        }}
      />
    </>
  );
}
