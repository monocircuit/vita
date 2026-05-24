/**
 * Central rendering configuration.
 * Every magic number in the drawing pipeline should live here.
 */

export const VIEWPORT = {
  /** World-space padding around the content bounds */
  PADDING: 100,
  /** Minimum visible range in years when zoomed in */
  MIN_ZOOM_YEARS: 5,
  /** Padding multiplier for maximum zoom-out extent */
  MAX_ZOOM_PADDING_FACTOR: 4,
} as const;

/** Mobile breakpoint in pixels */
export const MOBILE_BREAKPOINT = 1000;

export const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

export const TIMELINE = {
  /** Offset from bottom of screen in pixels */
  OFFSET_FROM_BOTTOM: 70,
  /** Mobile offset from bottom */
  OFFSET_FROM_BOTTOM_MOBILE: 40,
  /** Number of sub-ticks between major ticks */
  SUB_TICKS_PER_INTERVAL: 9,
  /** Extra pixels beyond screen edge for tick clipping */
  CLIPPING_MARGIN: 50,
  /** Allowed year step sizes for tick intervals */
  ALLOWED_STEPS: [
    1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
  ] as readonly number[],
  /** Target number of major ticks visible at once */
  TARGET_TICK_COUNT: 10,
  /** Switch to month bands when fewer than this many years are visible */
  MONTH_MODE_MAX_YEARS: 4,
  /** Switch to day bands when fewer than this many days are visible */
  DAY_MODE_MAX_DAYS: 90,
  /** Minimum visible days at maximum zoom */
  MIN_ZOOM_DAYS: 10,
} as const;

export const ANIMATION = {
  /** Chain hover transition duration in ms */
  CHAIN_HOVER_MS: 200,
  /** Popup open/close duration in ms */
  POPUP_MS: 400,
} as const;

export const CONNECTION = {
  /** Fraction of branch length used for connection endpoints */
  ENDPOINT_RATIO: 0.25,
  /** Maximum endpoint offset in pixels */
  ENDPOINT_CAP_PX: 25,
} as const;

export const BRANCH = {
  /** Vertical offset for popup from branch line */
  POPUP_Y_OFFSET: 15,
  /** Default popup width */
  POPUP_WIDTH: 200,
  /** Dot radius = thickness * DOT_RADIUS_FACTOR / scale */
  DOT_RADIUS_FACTOR: 0.6,
  /** Line width = thickness / (scale * LINE_THICKNESS_DIVISOR) */
  LINE_THICKNESS_DIVISOR: 3,
} as const;

export const HALO = {
  /** Fill color — amber-400 */
  COLOR: 0xFBBF24,
  /** Fill opacity */
  ALPHA: 0.3,
  /** Horizontal padding beyond branch endpoints, in screen pixels */
  PADDING_X: 10,
  /**
   * Constant gap between the branch edge and the halo edge, in screen pixels.
   * The halo half-height is derived as branchThickness/2 + GAP so the distance
   * stays identical regardless of zoom level or hover state.
   */
  GAP: 4,
} as const;

export const LABEL = {
  /** Base font size in pixels (at 1:1 zoom) */
  FONT_SIZE: 13,
  /** Vertical offset from branch line in screen pixels */
  OFFSET_Y: 10,
  /** Left-edge padding in screen pixels for sticky labels */
  SCREEN_PADDING: 11,
  /** Cap for label scale factor — prevents text from getting too large when zoomed out */
  MAX_WORLD_SCALE: 2,
} as const;
