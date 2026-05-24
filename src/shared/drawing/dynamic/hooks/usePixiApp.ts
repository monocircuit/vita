import { useEffect, useRef, useState, RefObject } from "react";
import { Application, Container } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { rescaleAll } from "../lineScaleManager";

interface PixiAppResult {
  appRef: RefObject<Application | null>;
  viewportRef: RefObject<Viewport | null>;
  uiContainerRef: RefObject<Container | null>;
  isReady: boolean;
  containerHeight: number;
}

export function usePixiApp(
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
): PixiAppResult {
  const appRef = useRef<Application | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const uiContainerRef = useRef<Container | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    if (appRef.current) return;

    let isMounted = true;
    const el = containerRef.current;

    const app = new Application();
    appRef.current = app;

    const init = async () => {
      await app.init({
        resizeTo: el,
        backgroundColor: 0xffffff,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });

      if (!isMounted) {
        app.destroy();
        return;
      }

      el.appendChild(app.canvas);

      const viewport = new Viewport({
        screenWidth: el.clientWidth,
        screenHeight: el.clientHeight,
        worldWidth: el.clientWidth || 1000,
        worldHeight: 2000,
        events: app.renderer.events,
      });
      viewportRef.current = viewport;
      viewport.zIndex = 1;
      app.stage.addChild(viewport);

      viewport.drag({ direction: "x" }).decelerate({ friction: 0.93 });

      // ── Wheel / trackpad handler ──────────────────────────────────────────
      //
      // ctrlKey/metaKey (pinch or ctrl+mousewheel) → zoom, anchored at pointer
      // No modifier + deltaX/deltaY                → horizontal pan
      //
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        const isPinch = e.ctrlKey || e.metaKey;

        if (isPinch) {
          // ── Zoom (pinch or ctrl+mousewheel) ───────────────────────────
          const delta = e.deltaY;
          if (delta === 0) return;

          const zoomFactor = Math.pow(2, -delta * 0.005);

          // Anchor at pointer so the point under the cursor stays fixed
          const rect = el.getBoundingClientRect();
          const pointerScreenX = e.clientX - rect.left;
          const worldX = viewport.left + pointerScreenX / viewport.scale.x;

          viewport.scale.x = viewport.scale.x * zoomFactor;
          viewport.left = worldX - pointerScreenX / viewport.scale.x;
        } else {
          // ── Pan (two-finger scroll or mousewheel) ─────────────────────
          // deltaX → horizontal pan directly
          // deltaY → also mapped to horizontal pan (vertical scroll = scrub timeline)
          const panX = (e.deltaX || 0) + (e.deltaY || 0);
          if (panX !== 0) {
            viewport.left += panX / viewport.scale.x;
          }
        }
      };
      el.addEventListener("wheel", handleWheel, { passive: false });

      // Zoom-compensated line thickness + sticky label repositioning
      let lastScale = viewport.scale.x;
      let lastLeft = viewport.left;
      app.ticker.add(() => {
        // Enforce scale.y = 1 (safety net for plugins like clampZoom)
        if (viewport.scale.y !== 1) viewport.scale.y = 1;
        const s = viewport.scale.x;
        const left = viewport.left;
        if (s !== lastScale || left !== lastLeft) {
          lastScale = s;
          lastLeft = left;
          rescaleAll(s);
        }
      });

      // UI layer
      const uiContainer = new Container();
      uiContainer.zIndex = 100;
      app.stage.addChild(uiContainer);
      app.stage.sortableChildren = true;
      uiContainerRef.current = uiContainer;

      // Resize handler
      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        // Immediate: pixi renderer + viewport must track size instantly
        app.renderer.resize(w, h);
        viewport.resize(w, h);
        // Debounced: trigger branch re-render for new centerY
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => setContainerHeight(h), 150);
      };
      window.addEventListener("resize", onResize);

      // Store handlers for cleanup
      (app as any)._cleanup = () => {
        el.removeEventListener("wheel", handleWheel);
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimer);
      };

      setContainerHeight(el.clientHeight);
      setIsReady(true);
    };

    init();

    return () => {
      isMounted = false;
      (appRef.current as any)?._cleanup?.();
      if (appRef.current) {
        appRef.current.destroy(true, true);
        appRef.current = null;
        viewportRef.current = null;
        uiContainerRef.current = null;
        setIsReady(false);
      }
    };
  }, [enabled]);

  return { appRef, viewportRef, uiContainerRef, isReady, containerHeight };
}
