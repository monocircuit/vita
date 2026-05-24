/**
 * Manages the selection halo for clicked branches.
 *
 * drawChronicleBranch registers show/hide callbacks per chronicle ID.
 * Renderer calls showHalo / hideActiveHalo when the active popup changes.
 * Multiple segments of the same chain share a chronicle ID and all light up.
 */

interface HaloControls {
  show: () => void;
  hide: () => void;
}

// chronicleId → set of segment controls (chains have multiple segments)
const halos = new Map<string, Set<HaloControls>>();
let activeId: string | null = null;

export function registerHalo(
  chronicleId: string,
  controls: HaloControls,
): () => void {
  if (!halos.has(chronicleId)) halos.set(chronicleId, new Set());
  halos.get(chronicleId)!.add(controls);
  return () => {
    const set = halos.get(chronicleId);
    if (set) {
      set.delete(controls);
      if (set.size === 0) halos.delete(chronicleId);
    }
  };
}

export function showHalo(chronicleId: string) {
  // Hide the previously active halo first
  if (activeId && activeId !== chronicleId) {
    halos.get(activeId)?.forEach(c => c.hide());
  }
  halos.get(chronicleId)?.forEach(c => c.show());
  activeId = chronicleId;
}

export function hideActiveHalo() {
  if (activeId) {
    halos.get(activeId)?.forEach(c => c.hide());
    activeId = null;
  }
}

export function clearHalos() {
  halos.forEach(set => set.forEach(c => c.hide()));
  halos.clear();
  activeId = null;
}
