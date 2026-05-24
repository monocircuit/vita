/**
 * External store for branch label data.
 *
 * The imperative drawing code (drawChronicleBranch) writes labels here;
 * the React overlay (BranchLabelOverlay) reads them reactively via
 * useSyncExternalStore.  Batching prevents intermediate re-renders when
 * many branches are drawn in a single pass.
 */

import type { BranchLabel } from "./helpers";

const labels = new Map<string, BranchLabel>();
const listeners = new Set<() => void>();
let snapshot: BranchLabel[] = [];
let batchDepth = 0;
let dirty = false;

function flush() {
  snapshot = Array.from(labels.values());
  listeners.forEach(fn => fn());
}

function notify() {
  if (batchDepth > 0) {
    dirty = true;
    return;
  }
  flush();
}

export function setLabel(id: string, label: BranchLabel) {
  labels.set(id, label);
  notify();
}

export function removeLabel(id: string) {
  if (!labels.has(id)) return;
  labels.delete(id);
  notify();
}

export function clearLabels() {
  if (labels.size === 0) return;
  labels.clear();
  notify();
}

/** Defer store notifications until `fn` finishes, then flush once. */
export function batchLabels(fn: () => void) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0 && dirty) {
      dirty = false;
      flush();
    }
  }
}

export function getLabelsSnapshot(): BranchLabel[] {
  return snapshot;
}

export function subscribeLabels(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
