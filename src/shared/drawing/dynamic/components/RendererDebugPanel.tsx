"use client";

import { useEffect, useState } from "react";
import Engine from "@/shared/processing/engines/dynamic/Engine";

// ─── Snapshot ────────────────────────────────────────────────────────────────

interface CellInfo {
  x: number;
  id: unknown;
  start: number;
  end: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface LayerSnapshot {
  y: number;
  cells: CellInfo[];
}

interface EngineSnapshot {
  loaded: boolean;
  version: number;
  positiveScore: number;
  negativeScore: number;
  totalLayers: number;
  totalCells: number;
  layers: LayerSnapshot[];
}

function fmtMs(ms: number): string {
  if (!Number.isFinite(ms) || ms === 0) return ms === 0 ? "0" : "∞";
  const days = Math.round(ms / 86_400_000);
  if (days < 365) return `${days}d`;
  const years = (ms / (365.25 * 86_400_000)).toFixed(1);
  return `${years}y`;
}

function fmtDate(ms: number): string {
  if (!Number.isFinite(ms) || ms === Infinity) return "∞";
  try {
    return new Date(ms).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return String(ms);
  }
}

function takeSnapshot(engine: Engine): EngineSnapshot {
  const { positive, negative } = engine.yDimensions;
  const positiveScore = engine.positiveScore;
  const negativeScore = engine.negativeScore;
  const layers: LayerSnapshot[] = [];

  for (let y = positive; y >= -negative; y--) {
    const level = engine.getLevel(y);
    if (!level) continue;

    const cells: CellInfo[] = [];
    for (const { x, cell } of level) {
      const data = cell.$ as Record<string, unknown>;
      const knots = data.knots as { start: number; end: number } | undefined;
      cells.push({
        x,
        id: data.id,
        start: knots?.start ?? NaN,
        end: knots?.end ?? NaN,
        hasNext: !!cell.next,
        hasPrev: !!cell.prev,
      });
    }

    layers.push({ y, cells });
  }

  const totalCells = layers.reduce((acc, l) => acc + l.cells.length, 0);

  return {
    loaded: engine.loaded,
    version: engine.version,
    positiveScore,
    negativeScore,
    totalLayers: positive + negative + 1,
    totalCells,
    layers,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RendererDebugPanel({
  engine,
}: {
  engine: Engine | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);

  // Subscribe to engine changes
  useEffect(() => {
    if (!engine) return;
    const update = () => setSnapshot(takeSnapshot(engine));
    update();

    const unsubscribe = engine.subscribe(update);

    return () => {
      unsubscribe();
    };
  }, [engine]);

  // Ctrl+Shift+D toggles panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Toggle button — bottom left */}
      <button
        className="absolute bottom-4 left-4 z-20 px-1.5 py-0.5 text-[9px] uppercase tracking-widest border-(length:--stroke) border-solid border-secondary/30 bg-primary/80 text-secondary/40 hover:text-secondary/80 hover:border-secondary/60 transition-colors"
        onClick={() => setIsOpen(prev => !prev)}
        title="Toggle Debug Panel (Ctrl+Shift+D)"
      >
        DBG
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-12 left-4 z-20 w-[340px] max-h-[70vh] flex flex-col border-(length:--stroke) border-solid border-secondary bg-primary overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-2.5 h-8 shrink-0 border-b-(length:--stroke) border-solid border-secondary bg-primary">
            <span className="text-[10px] uppercase tracking-widest text-secondary/60 flex-1">
              Engine Debug
            </span>
            <span className={`text-[9px] uppercase tracking-wide px-1 ${snapshot?.loaded ? "text-highlight" : "text-error/70"}`}>
              {snapshot?.loaded ? "loaded" : "idle"}
            </span>
            <span className="text-[9px] text-secondary/30">
              v{snapshot?.version ?? 0}
            </span>
            <button
              className="text-[10px] text-secondary/40 hover:text-secondary ml-1"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Key stats row */}
          <div className="flex shrink-0 border-b-(length:--stroke) border-solid border-secondary">
            {[
              { label: "Pos Weight", value: fmtMs(snapshot?.positiveScore ?? 0), accent: "text-highlight" },
              { label: "Neg Weight", value: fmtMs(snapshot?.negativeScore ?? 0), accent: "text-error/70" },
              { label: "Total Layers", value: snapshot?.totalLayers ?? 0, accent: "text-secondary" },
              { label: "Total Cells", value: snapshot?.totalCells ?? 0, accent: "text-secondary" },
            ].map(({ label, value, accent }, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 border-r-(length:--stroke) border-solid border-secondary last:border-r-0"
              >
                <span className={`text-sm font-bold ${accent}`}>{value}</span>
                <span className="text-[8px] uppercase tracking-wide text-secondary/40">{label}</span>
              </div>
            ))}
          </div>

          {/* Layer breakdown — scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {!snapshot || snapshot.layers.length === 0 ? (
              <div className="px-2.5 py-2 text-[10px] text-secondary/30 italic">
                No layers
              </div>
            ) : (
              snapshot.layers.map(layer => (
                <div
                  key={layer.y}
                  className="border-b-(length:--stroke) border-solid border-secondary/40 last:border-b-0"
                >
                  {/* Layer header */}
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-primary">
                    <span
                      className={`text-[10px] font-bold w-8 shrink-0 ${layer.y > 0 ? "text-highlight" : layer.y < 0 ? "text-error/70" : "text-secondary/60"}`}
                    >
                      y={layer.y}
                    </span>
                    <span className="text-[9px] text-secondary/40 uppercase tracking-wide flex-1">
                      {layer.cells.length} {layer.cells.length === 1 ? "cell" : "cells"}
                    </span>
                    {/* Visual bar proportional to cell count */}
                    <div className="flex gap-0.5">
                      {layer.cells.map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 ${layer.y > 0 ? "bg-highlight/60" : layer.y < 0 ? "bg-error/40" : "bg-secondary/30"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cells */}
                  {layer.cells.map(cell => (
                    <div
                      key={cell.x}
                      className="flex items-center gap-2 px-2.5 py-0.5 border-t-(length:--stroke) border-solid border-secondary/20 bg-primary/50"
                    >
                      <span className="text-[9px] text-secondary/30 w-4 shrink-0">
                        x={cell.x}
                      </span>
                      <span className="text-[9px] text-secondary/70 shrink-0 font-mono">
                        #{String(cell.id)}
                      </span>
                      <span className="text-[9px] text-secondary/40 flex-1 truncate">
                        {fmtDate(cell.start)} → {fmtDate(cell.end)}
                      </span>
                      {(cell.hasPrev || cell.hasNext) && (
                        <span className="text-[8px] text-secondary/30 shrink-0">
                          {cell.hasPrev ? "←" : ""}
                          {cell.hasNext ? "→" : ""}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
