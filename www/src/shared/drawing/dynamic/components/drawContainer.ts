import * as PIXI from "pixi.js";

interface BranchProps {
  x: number;
  y: number;
  origin?: "center-top" | "center-bottom";
  height?: number;
  width: number;
  title?: string;
  content: string;
  contentType: "text" | "image";
  animate?: boolean;
  styles?: {
    backgroundColor?: number;
    textColor?: number;
    padding?: number;
  };
}

export const drawContainer = async (
  container: PIXI.Container,
  {
    x,
    y,
    origin = "center-top",
    height = 100,
    width,
    title,
    content,
    contentType,
    animate = true,
    styles = {},
  }: BranchProps,
): Promise<void> => {
  // 1. Setup Styles
  const padding = styles.padding ?? 20;
  const bgColor = styles.backgroundColor ?? 0xffffff;
  const textColor = styles.textColor ?? 0x000000;
  // 2. Position Container
  container.x = x;
  container.y = y;
  container.removeChildren();
  // IMPORTANT: Ensure container scale is reset (we are not scaling it anymore)
  container.scale.set(1, 1);
  container.pivot.set(0, 0);

  // 3. Create Layers
  // We need separate layers: Background (visible box) and Content (text/img)
  const bg = new PIXI.Graphics();
  const contentContainer = new PIXI.Container();
  // The mask ensures text doesn't "float" outside the box while it's growing
  const contentMask = new PIXI.Graphics();

  container.addChild(bg);
  container.addChild(contentContainer);
  container.addChild(contentMask);

  // Apply mask to content
  contentContainer.mask = contentMask;

  // 4. Render Content (Into contentContainer)
  let currentY = padding;

  if (title) {
    const titleText = new PIXI.Text({
      text: title,
      style: {
        fontFamily: "Arial",
        fontWeight: "bold",
        fontSize: 18,
        fill: textColor,
        wordWrap: true,
        wordWrapWidth: width - padding * 2,
        align: "center",
      },
    });
    titleText.anchor.set(0.5, 0);
    titleText.x = width / 2;
    titleText.y = currentY;
    contentContainer.addChild(titleText);
    currentY += titleText.height + 10;
  }

  if (contentType === "text") {
    const contentText = new PIXI.Text({
      text: content,
      style: {
        fontFamily: "Arial",
        fontSize: 14,
        fill: 0x000000,
        wordWrap: true,
        wordWrapWidth: width - padding * 2,
        align: "left",
      },
    });
    contentText.x = padding;
    contentText.y = currentY;
    contentContainer.addChild(contentText);
    currentY += contentText.height;
  } else if (contentType === "image") {
    try {
      const texture = await PIXI.Assets.load(content);
      const sprite = new PIXI.Sprite(texture);
      const availableWidth = width - padding * 2;
      const scale = availableWidth / sprite.width;
      sprite.width = availableWidth;
      sprite.height = sprite.height * scale;
      sprite.x = padding;
      sprite.y = currentY;
      contentContainer.addChild(sprite);
      currentY += sprite.height;
    } catch (e) {
      console.error(e);
    }
  }

  // 5. Calculate Final Dimensions
  const finalHeight = Math.max(height, currentY + padding);

  // 6. Define the Drawing Function
  // We use this to draw the box at any specific height (h)
  const drawBox = (targetGraphics: PIXI.Graphics, h: number) => {
    try {
      targetGraphics.clear();

      // Logic for growing direction
      if (origin === "center-top") {
        // Grows DOWN from y=0
        // Pivot is Top-Center (handled by container pivot later)
        targetGraphics.rect(0, 0, width, h);
      } else {
        // Grows UP from Bottom
        // The content goes from y=0 to y=finalHeight.
        // If we are at partial height 'h', we want to show the BOTTOM part of the box.
        // That means drawing from (finalHeight - h) to finalHeight.
        targetGraphics.rect(0, finalHeight - h, width, h);
      }

      targetGraphics.fill({ color: bgColor, alpha: 1 });
      // Only draw stroke on background, not mask
      if (targetGraphics === bg) {
        targetGraphics.stroke({ width: 2, color: 0x000000 });
      }
    } catch (e) {
    }
  };

  // 7. Set Pivot
  // This places the container correctly relative to the mouse click
  if (origin === "center-top") {
    container.pivot.set(width / 2, 0);
  } else {
    container.pivot.set(width / 2, finalHeight);
  }

  // 8. Animation Loop
  if (animate) {
    const duration = 400;
    const startTime = Date.now();

    //Coolest Animation Easing Function Ever
    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Calculate eased progress
      const ease = easeInOutCubic(progress);

      const currentHeight = finalHeight * ease;

      // Redraw Background and Mask to the new height
      if (!!bg.clear) {
        drawBox(bg, currentHeight);
      }
      drawBox(contentMask, currentHeight);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Ensure final state is crisp
        drawBox(bg, finalHeight);
        drawBox(contentMask, finalHeight);
      }
    };
    requestAnimationFrame(tick);
  } else {
    // No animation, just draw full size
    drawBox(bg, finalHeight);
    drawBox(contentMask, finalHeight);
  }
};
