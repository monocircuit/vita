import * as PIXI from "pixi.js";

interface TimeLineProps {
  // Geometrie
  y: number;
  screenWidth: number;

  // Daten (Glatte Werte)
  minYear: number;
  maxYear: number;
  step: number;

  // Mapping Funktion: Wandelt ein Jahr in Screen-X-Koordinaten um
  getScreenX: (year: number) => number;

  style?: {
    color?: number;
    labelColor?: number;
    width?: number;
    tickHeight?: number;
  };
}

export const drawTimeLine = (
  container: PIXI.Container,
  props: TimeLineProps
) => {
  const { y, screenWidth, minYear, maxYear, step, getScreenX, style = {} } = props;
  
  const color = style.color ?? 0x333333;
  const labelColor = style.labelColor ?? 0x555555;
  const tickHeight = style.tickHeight ?? 10;

  const graphics = new PIXI.Graphics();
  container.addChild(graphics);

  // 1. Zeichne die horizontale Linie (Volle Breite)
  graphics.moveTo(0, y);
  graphics.lineTo(screenWidth, y);
  graphics.stroke({ width: 2, color });

  // 2. Zeichne Ticks und Labels
  for (let year = minYear; year <= maxYear; year += step) {
    const x = getScreenX(year);

    // Performance: Zeichne nur, wenn innerhalb des Screens (+ Buffer)
    if (x < -50 || x > screenWidth + 50) continue;

    // Tick
    graphics.moveTo(x, y - tickHeight / 2);
    graphics.lineTo(x, y + tickHeight / 2);
    graphics.stroke({ width: 2, color });

    // Label
    const text = new PIXI.Text({
      text: year.toString(),
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fill: labelColor,
        fontWeight: "bold",
      }
    });
    text.anchor.set(-2, 0);
    text.x = x;
    text.y = y + tickHeight / 2 + 5;
    
    container.addChild(text);
  }

  return graphics;
};