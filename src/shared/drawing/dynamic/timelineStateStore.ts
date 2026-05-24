import type { TimelineMode } from "./components/drawTimeLine";

export type TimelineState = {
  mode: TimelineMode;
  minMs: number;
  pixelsPerMs: number;
};

let state: TimelineState | null = null;

export function setTimelineState(next: TimelineState | null): void {
  state = next;
}

export function getTimelineState(): TimelineState | null {
  return state;
}
