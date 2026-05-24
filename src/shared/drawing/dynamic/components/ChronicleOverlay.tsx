"use client";

import { RefObject, useCallback, useEffect, useState } from "react";
import { Viewport } from "pixi-viewport";
import { ActivePopup } from "../helpers";
import ChronicleBox from "./ChronicleBox";

interface ChronicleOverlayProps {
  popup: ActivePopup | null;
  viewportRef: RefObject<Viewport | null>;
  onDismiss: () => void;
  onDeleteChronicle: (chronicleId: number) => void | Promise<void>;
}

export default function ChronicleOverlay({
  popup,
  viewportRef,
  onDismiss,
  onDeleteChronicle,
}: ChronicleOverlayProps) {
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const updatePosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !popup) {
      setScreenPos(null);
      return;
    }

    const x = (popup.worldX - viewport.left) * viewport.scale.x;
    const y = (popup.worldY - viewport.top) * viewport.scale.y;
    setScreenPos({ x, y });
  }, [popup, viewportRef]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !popup) {
      setScreenPos(null);
      return;
    }

    updatePosition();

    viewport.on("moved", updatePosition);
    return () => {
      viewport.off("moved", updatePosition);
    };
  }, [popup, viewportRef, updatePosition]);

  if (!popup || !screenPos) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      onClick={onDismiss}
    >
      <div
        className="absolute"
        style={{
          left: screenPos.x,
          top: screenPos.y,
          transform: popup.isAbove
            ? "translate(-50%, -100%)"
            : "translate(-50%, 0)",
        }}
      >
        <ChronicleBox
          chronicle={popup.chronicleData}
          linkedEntities={popup.linkedEntities}
          fallbackChronicleId={popup.chronicleId}
          onDeleteChronicle={onDeleteChronicle}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  );
}
