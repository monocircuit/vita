/**
 * Lightweight registry for zoom-compensated line restrokes.
 * Each drawBranch/drawConnection call registers a restroke function
 * that is called by the Pixi ticker when the zoom level changes.
 */
type RestrokeFn = (scale: number) => void;

const restrokes = new Set<RestrokeFn>();

export const registerRestroke = (fn: RestrokeFn) => {
  restrokes.add(fn);
  return () => restrokes.delete(fn);
};

export const clearRestrokes = () => restrokes.clear();

export const rescaleAll = (scale: number) => {
  restrokes.forEach(fn => fn(scale));
};
