import {
  RefObject,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Viewport } from "pixi-viewport";
import { LABEL } from "../config";
import { subscribeLabels, getLabelsSnapshot } from "../labelStore";
import type { BranchLabelEntity } from "../helpers";
import { useLogoImage } from "@/shared/logo";

const PILL_START_OFFSET_PX = 12;

// ── Entity logo pill ──────────────────────────────────────────────────────────

function EntityLogo({ entity }: { entity: BranchLabelEntity }) {
  const [failed, setFailed] = useState(false);

  const { data: logo } = useLogoImage(entity.name);
  const src = logo?.svg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(logo.svg)}`
    : (logo?.imageUrl ?? entity.avatar ?? null);

  const initials = entity.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? "")
    .join("");

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        width={16}
        height={16}
        className="shrink-0 object-cover"
        style={{ width: 16, height: 16, borderRadius: 3 }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className="shrink-0 flex items-center justify-center bg-muted/20 text-muted"
      style={{ width: 16, height: 16, borderRadius: 3, fontSize: 8, lineHeight: 1 }}
    >
      {initials || "?"}
    </div>
  );
}

// ── Overlay ────────────────────────────────────────────────────────────────────

interface BranchLabelOverlayProps {
  viewportRef: RefObject<Viewport | null>;
  /** Chronicle ID of the branch whose label should be hidden (popup is open). */
  hiddenChronicleId?: string;
}

/**
 * Renders branch labels as DOM elements positioned over the Pixi canvas.
 *
 * Label *data* lives in the external labelStore (written by drawChronicleBranch).
 * This component reads it reactively via useSyncExternalStore to add/remove DOM
 * nodes, then imperatively updates screen positions on every viewport move/zoom
 * for jank-free 60 fps tracking — no React re-renders on pan or zoom.
 */
export default function BranchLabelOverlay({
  viewportRef,
  hiddenChronicleId,
}: BranchLabelOverlayProps) {
  const labels = useSyncExternalStore(
    subscribeLabels,
    getLabelsSnapshot,
    getLabelsSnapshot,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const elsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const widthsRef = useRef<Map<string, number>>(new Map());
  // Ref so the "moved" listener always reads the current value without re-subscribing
  const hiddenChronicleIdRef = useRef(hiddenChronicleId);
  hiddenChronicleIdRef.current = hiddenChronicleId;
  const updateRef = useRef<(() => void) | null>(null);

  // ── Track element widths via ResizeObserver ──────────────────────────────────
  useEffect(() => {
    const widths = widthsRef.current;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.labelId;
        if (id) {
          widths.set(
            id,
            entry.contentBoxSize[0]?.inlineSize ?? entry.target.clientWidth,
          );
        }
      }
      // Width changed (e.g. font size updated by zoom) — re-apply positions
      // so sticky clamping uses the fresh width immediately.
      updateRef.current?.();
    });

    elsRef.current.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [labels]);

  // ── Imperative position sync — runs every RAF frame to stay in sync with Pixi ──
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || labels.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const scaleX = viewport.scale.x;
      const scaleY = viewport.scale.y;
      const left = viewport.left;
      const top = viewport.top;
      const containerWidth = container.clientWidth;

      const fontSize = LABEL.FONT_SIZE;

      for (const label of labels) {
        const el = elsRef.current.get(label.id);
        if (!el) continue;

        // Set font size first so em-based children and the cached width stay valid
        el.style.fontSize = `${fontSize}px`;

        const screenStartX = (label.worldStartX - left) * scaleX;
        const screenEndX = (label.worldEndX - left) * scaleX;
        const branchScreenY = (label.worldY - top) * scaleY;
        const branchScreenWidth = screenEndX - screenStartX;

        const elWidth = widthsRef.current.get(label.id) ?? el.offsetWidth;

        // Sticky: anchor to branch start with offset, but clamp to left viewport
        // edge so the label stays visible when the branch start scrolls off-screen.
        let x = Math.max(screenStartX + PILL_START_OFFSET_PX, LABEL.SCREEN_PADDING);
        x = Math.min(x, screenEndX - elWidth);

        // Hide when branch is off-screen, too narrow, or its popup is open
        const isPopupOpen =
          hiddenChronicleIdRef.current !== undefined &&
          label.chronicleId === hiddenChronicleIdRef.current;
        const visible =
          !isPopupOpen &&
          branchScreenWidth > elWidth * 0.5 &&
          screenEndX > 0 &&
          screenStartX < containerWidth;

        el.style.transform = `translate3d(${x}px,${branchScreenY}px,0) translateY(-50%)`;
        el.style.opacity = visible ? "1" : "0";
      }
    };

    updateRef.current = update;

    // Use a RAF loop instead of viewport events so positions are always in sync
    // with the Pixi frame, even when zoom/pan mutate viewport state directly
    // (bypassing "moved"/"zoomed" events).
    let rafId: number;
    const loop = () => {
      update();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      updateRef.current = null;
    };
  }, [labels, viewportRef]);

  // When the popup opens/closes, re-apply opacity without re-subscribing to "moved"
  useEffect(() => {
    updateRef.current?.();
  }, [hiddenChronicleId]);

  if (labels.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {labels.map(label => (
        <div
          key={label.id}
          data-label-id={label.id}
          ref={el => {
            if (el) {
              elsRef.current.set(label.id, el);
              // Invalidate cached width when the element remounts
              widthsRef.current.delete(label.id);
            } else {
              elsRef.current.delete(label.id);
              widthsRef.current.delete(label.id);
            }
          }}
          className="absolute top-0 left-0 whitespace-nowrap select-none will-change-transform flex items-center"
          style={{
            background: "var(--color-bg)",
            border: "0.5px solid var(--color-border)",
            borderRadius: 9999,
            padding: "3px 8px",
            fontFamily: "Arial, sans-serif",
            fontWeight: 500,
            color: "var(--color-fg)",
            lineHeight: 1,
            gap: 6,
            opacity: 0,
          }}
        >
          {label.entities.length > 0 && (
            <div className="flex items-center" style={{ gap: 3 }}>
              {label.entities.slice(0, 3).map(entity => (
                <EntityLogo key={entity.id} entity={entity} />
              ))}
            </div>
          )}
          <span>{label.text}</span>
        </div>
      ))}
    </div>
  );
}
