export type TimelineTick = {
  /** Unique key for React (e.g. "2024" or "2024-01") */
  id: string;
  /** Display text (e.g. "2024" or "Jan 2024") */
  label: string;
  /** PIXI world X of the period start */
  worldX: number;
  /** PIXI world X of the period end */
  worldEndX: number;
  /** true = center label in band, false = left-align at period start */
  centered: boolean;
  /** true = this tick sits at a Jan 1st boundary — render a year separator */
  isYearBoundary?: boolean;
};

type Listener = () => void;

let ticks: TimelineTick[] = [];
const listeners = new Set<Listener>();

export function setTimelineTicks(next: TimelineTick[]): void {
  ticks = next;
  listeners.forEach(l => l());
}

export function subscribeTimelineTicks(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getTimelineTicksSnapshot(): TimelineTick[] {
  return ticks;
}
