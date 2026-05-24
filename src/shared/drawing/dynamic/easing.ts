/** Interpolate between two colors (0xRRGGBB format). */
export const lerpColor = (from: number, to: number, t: number): number => {
  const fr = (from >> 16) & 0xff;
  const fg = (from >> 8) & 0xff;
  const fb = from & 0xff;
  const tr = (to >> 16) & 0xff;
  const tg = (to >> 8) & 0xff;
  const tb = to & 0xff;
  const r = Math.round(fr + (tr - fr) * t);
  const g = Math.round(fg + (tg - fg) * t);
  const b = Math.round(fb + (tb - fb) * t);
  return (r << 16) | (g << 8) | b;
};

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Ease out cubic: fast start, decelerating. */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Ease in-out cubic: smooth acceleration and deceleration. */
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
