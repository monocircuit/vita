import * as PIXI from "pixi.js";
import { isMobile } from "../config";
import { getGlobalConfig } from "../styleApi";

export type TimelineMode = "years" | "months" | "days";

export interface TimeLineProps {
  y: number;
  screenWidth: number;
  screenHeight: number;
  minYear: number;
  maxYear: number;
  mode: TimelineMode;
  visibleStartMs: number;
  visibleEndMs: number;
  getScreenXFromMs: (ms: number) => number;
  style?: {
    width?: number;
    tickHeight?: number;
  };
}

export interface TimeLineHandle {
  update: (props: TimeLineProps) => void;
  destroy: () => void;
}

export const MONTH_NAMES = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
];

/**
 * Creates a persistent timeline renderer with alternating year/month/day bands.
 *
 * Two containers are used for correct z-ordering:
 * - `bgContainer` (zIndex 0) — bands sit behind branches
 * - `fgContainer` (zIndex 100) — month/day labels, today marker sit on top
 *
 * Year labels are rendered by the React TimelineLabelsOverlay, not here.
 * Text labels are pooled to avoid expensive PIXI.Text create/destroy churn.
 */
export function createTimeLine(
  bgContainer: PIXI.Container,
  fgContainer: PIXI.Container = bgContainer,
): TimeLineHandle {
  const bandGfx = new PIXI.Graphics();
  bgContainer.addChild(bandGfx);

  const lineGfx = new PIXI.Graphics();
  fgContainer.addChild(lineGfx);

  // ── Text pool ────────────────────────────────────────────────────────────────
  const textPool: PIXI.Text[] = [];
  let textActive = 0;

  const acquireText = (
    content: string,
    style: PIXI.TextStyleOptions,
    anchorX: number,
    anchorY: number,
    x: number,
    y: number,
  ): void => {
    let t: PIXI.Text;
    if (textActive < textPool.length) {
      t = textPool[textActive];
      if (t.text !== content) t.text = content;
      Object.assign(t.style, style);
      t.visible = true;
    } else {
      t = new PIXI.Text({ text: content, style });
      fgContainer.addChild(t);
      textPool.push(t);
    }
    t.anchor.set(anchorX, anchorY);
    t.x = x;
    t.y = y;
    textActive++;
  };

  const hideUnused = () => {
    for (let i = textActive; i < textPool.length; i++) {
      textPool[i].visible = false;
    }
  };

  // ── Update ───────────────────────────────────────────────────────────────────
  const update = (props: TimeLineProps) => {
    const {
      y,
      screenWidth,
      screenHeight,
      minYear,
      maxYear,
      mode,
      visibleStartMs,
      visibleEndMs,
      getScreenXFromMs,
    } = props;

    const mobile = isMobile();
    const theme = getGlobalConfig().theme;
    const BAND_A = theme.timelineBandA;
    const BAND_B = theme.timelineBandB;

    bandGfx.clear();
    lineGfx.clear();
    textActive = 0;

    if (mode === "days") {
      // ── Day-level bands ───────────────────────────────────────────────────────
      // Start from the first day of the visible start month for clean alternation
      const startDate = new Date(visibleStartMs);
      startDate.setDate(1);
      // Epoch-based day index for consistent alternation across month/year boundaries
      const EPOCH = new Date(2000, 0, 1).getTime();
      const MS_PER_DAY = 1000 * 60 * 60 * 24;

      const cursor = new Date(startDate);
      // Iterate until we're past the visible end plus one month buffer
      const endLimit = visibleEndMs + 32 * MS_PER_DAY;

      while (cursor.getTime() <= endLimit) {
        const dayStartMs = cursor.getTime();
        cursor.setDate(cursor.getDate() + 1);
        const dayEndMs = cursor.getTime();

        const sx = getScreenXFromMs(dayStartMs);
        const ex = getScreenXFromMs(dayEndMs);
        if (ex < 0 || sx > screenWidth) continue;

        const dayIndex = Math.round((dayStartMs - EPOCH) / MS_PER_DAY);
        const bandColor = dayIndex % 2 === 0 ? BAND_A : BAND_B;
        bandGfx.rect(sx, 0, ex - sx, screenHeight);
        bandGfx.fill({ color: bandColor });

        // Day-of-month label inside band when wide enough
        if (ex - sx > 18) {
          const dayOfMonth = new Date(dayStartMs).getDate();
          acquireText(
            dayOfMonth.toString(),
            { fontFamily: "Arial", fontSize: mobile ? 9 : 11, fill: theme.timelineMonthLabelColor },
            0.5, 1,
            (sx + ex) / 2, y - 4,
          );
        }
      }
    } else if (mode === "months") {
      // ── Month-level bands ─────────────────────────────────────────────────────
      for (let year = minYear - 1; year <= maxYear + 1; year++) {
        for (let month = 0; month < 12; month++) {
          const sx = getScreenXFromMs(new Date(year, month, 1).getTime());
          const ex = getScreenXFromMs(new Date(year, month + 1, 1).getTime());
          if (ex < 0 || sx > screenWidth) continue;

          const bandColor = (year * 12 + month) % 2 === 0 ? BAND_A : BAND_B;
          bandGfx.rect(sx, 0, ex - sx, screenHeight);
          bandGfx.fill({ color: bandColor });

          // Month label centered in band
          if (ex - sx > 25) {
            acquireText(
              MONTH_NAMES[month],
              { fontFamily: "Arial", fontSize: mobile ? 9 : 11, fill: theme.timelineMonthLabelColor },
              0.5, 1,
              (sx + ex) / 2, y - 4,
            );
          }
        }
      }
    } else {
      // ── Year-level bands ──────────────────────────────────────────────────────
      for (let year = minYear - 1; year <= maxYear + 1; year++) {
        const sx = getScreenXFromMs(new Date(year, 0, 1).getTime());
        const ex = getScreenXFromMs(new Date(year + 1, 0, 1).getTime());
        if (ex < 0 || sx > screenWidth) continue;

        const bandColor = year % 2 === 0 ? BAND_A : BAND_B;
        bandGfx.rect(sx, 0, ex - sx, screenHeight);
        bandGfx.fill({ color: bandColor });
      }
    }

    // ── Today marker ─────────────────────────────────────────────────────────
    const todayX = getScreenXFromMs(Date.now());
    if (todayX >= 0 && todayX <= screenWidth) {
      lineGfx.moveTo(todayX, 0);
      lineGfx.lineTo(todayX, screenHeight);
      lineGfx.stroke({ width: 2, color: theme.timelineTodayColor, alpha: 0.3 });

      lineGfx.moveTo(todayX, y - 50);
      lineGfx.lineTo(todayX, y + 25);
      lineGfx.stroke({ width: 2, color: theme.timelineTodayColor });

      acquireText(
        "Heute",
        { fontFamily: "Arial", fontSize: 14, fill: theme.timelineTodayColor, fontWeight: "bold" },
        0.5, 1,
        todayX, y - 52,
      );
    }

    hideUnused();
  };

  // ── Destroy ──────────────────────────────────────────────────────────────────
  const destroy = () => {
    for (const gfx of [bandGfx, lineGfx]) {
      if (!gfx.destroyed) {
        if (gfx.parent) gfx.parent.removeChild(gfx);
        gfx.destroy();
      }
    }
    for (const t of textPool) {
      if (!t.destroyed) {
        if (t.parent) t.parent.removeChild(t);
        t.destroy();
      }
    }
    textPool.length = 0;
    textActive = 0;
  };

  return { update, destroy };
}
