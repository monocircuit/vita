"use client";

import { useEffect, useMemo, useState } from "react";

type Kind = "person" | "place" | "org" | "idea";
type EventItem = {
  id: number;
  x: number;
  lane: number;
  year: string;
  title: string;
  branch: "trunk" | "career" | "personal";
  type: "milestone" | "event";
  kind: Kind;
};

const kindColor: Record<Kind, string> = {
  person: "#FFD100",
  place: "#7DD3FC",
  org: "#C4B5FD",
  idea: "#FCA5A5",
};

type Props = { compact?: boolean };

const TimelineDemo = ({ compact = false }: Props) => {
  const events = useMemo<EventItem[]>(
    () => [
      { id: 0, x: 50, lane: 1, year: "2001", title: "Born", branch: "trunk", type: "milestone", kind: "person" },
      { id: 1, x: 140, lane: 1, year: "2007", title: "First school", branch: "trunk", type: "event", kind: "place" },
      { id: 2, x: 240, lane: 1, year: "2012", title: "Moved to Berlin", branch: "trunk", type: "milestone", kind: "place" },
      { id: 3, x: 330, lane: 0, year: "2014", title: "Art school", branch: "career", type: "event", kind: "org" },
      { id: 4, x: 380, lane: 2, year: "2016", title: "Met Anna", branch: "personal", type: "milestone", kind: "person" },
      { id: 5, x: 470, lane: 0, year: "2018", title: "Joined Circus Co.", branch: "career", type: "event", kind: "org" },
      { id: 6, x: 520, lane: 2, year: "2020", title: "Family", branch: "personal", type: "milestone", kind: "person" },
      { id: 7, x: 560, lane: 1, year: "2021", title: "Started VITA", branch: "trunk", type: "milestone", kind: "idea" },
      { id: 8, x: 650, lane: 0, year: "2024", title: "First exhibit", branch: "career", type: "event", kind: "place" },
    ],
    [],
  );

  const edges = useMemo<Array<[number, number]>>(
    () => [
      [0, 1],
      [1, 2],
      [2, 7],
      [2, 3],
      [3, 5],
      [5, 8],
      [2, 4],
      [4, 6],
    ],
    [],
  );

  const [selected, setSelected] = useState(2);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setSelected((s) => (s + 1) % events.length);
    }, 2800);
    return () => clearInterval(t);
  }, [playing, events.length]);

  const laneY = [70, 140, 210];
  const sel = events[selected];
  const selColor = kindColor[sel.kind];

  const branchColor: Record<EventItem["branch"], string> = {
    trunk: "#FFD100",
    career: "#C4B5FD",
    personal: "#FCA5A5",
  };

  const cardLeftPct = (sel.x / 700) * 100;
  const cardLeft = `clamp(16px, calc(${cardLeftPct}% - 100px), calc(100% - 216px))`;

  const edgePath = (a: EventItem, b: EventItem) => {
    const y1 = laneY[a.lane];
    const y2 = laneY[b.lane];
    if (a.lane === b.lane) return `M ${a.x} ${y1} L ${b.x} ${y2}`;
    const dx = b.x - a.x;
    const cpx = Math.max(30, dx * 0.45);
    return `M ${a.x} ${y1} C ${a.x + cpx} ${y1}, ${b.x - cpx} ${y2}, ${b.x} ${y2}`;
  };

  return (
    <div
      role="img"
      aria-label="Interactive life timeline showing a central trunk with parallel career and personal branches"
      onClick={() => setPlaying((p) => !p)}
      className="relative w-full overflow-hidden border border-[var(--l-divider)] cursor-pointer"
      style={{
        height: compact ? 280 : 360,
        background: "var(--l-glass-grad)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-highlight" />
      <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-highlight" />
      <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-highlight" />
      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-highlight" />

      <div className="absolute top-3 left-4 right-4 flex justify-between font-[Fira_Code,monospace] text-[10px] uppercase tracking-[0.2em] text-[var(--l-muted)]">
        <span>// TIMELINE ~ EDITOR</span>
        <span className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: playing ? "#22c55e" : "#FFD100" }}
            />
            {playing ? "LIVE" : "PAUSED"}
          </span>
          <span>⌘+K</span>
        </span>
      </div>

      <div className="absolute left-4 right-4 flex justify-between font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.25em]" style={{ top: 30 }}>
        <span style={{ color: branchColor.career }}>career ▲</span>
        <span className="text-[var(--l-muted)]">trunk —</span>
        <span style={{ color: branchColor.personal }}>personal ▼</span>
      </div>

      <svg
        viewBox="0 0 700 280"
        preserveAspectRatio="xMidYMid meet"
        className="absolute left-0 right-0"
        style={{ top: 56, bottom: 80, width: "100%", height: "calc(100% - 136px)" }}
      >
        {laneY.map((y) => (
          <line key={y} x1="20" y1={y} x2="680" y2={y} stroke="var(--l-lane-rail)" strokeWidth="1" strokeDasharray="2 4" />
        ))}

        {edges.map(([fromId, toId], i) => {
          const a = events[fromId];
          const b = events[toId];
          const active = fromId === selected || toId === selected;
          const color = a.branch === b.branch ? branchColor[a.branch] : branchColor[b.branch];
          return (
            <path
              key={`edge-${i}`}
              d={edgePath(a, b)}
              stroke={active ? color : "var(--l-conn)"}
              strokeWidth={active ? 2.5 : 1.25}
              fill="none"
              opacity={active ? 1 : 0.75}
            />
          );
        })}

        {events.map((e) => (
          <text
            key={`year-${e.id}`}
            x={e.x}
            y={258}
            textAnchor="middle"
            fill="var(--l-year)"
            fontSize="10"
            fontFamily="'Fira Code', monospace"
            letterSpacing="1"
          >
            {e.year}
          </text>
        ))}

        {events.map((e, i) => {
          const isSel = i === selected;
          const color = kindColor[e.kind];
          return (
            <g
              key={e.id}
              onClick={(ev) => {
                ev.stopPropagation();
                setSelected(i);
                setPlaying(false);
              }}
              style={{ cursor: "pointer" }}
            >
              {isSel && !reduced && (
                <circle cx={e.x} cy={laneY[e.lane]} r="16" fill="none" stroke={color} strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" from="10" to="22" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={e.x} cy={laneY[e.lane]} r={e.type === "milestone" ? 7 : 5} fill={color} />
              <circle cx={e.x} cy={laneY[e.lane]} r={e.type === "milestone" ? 4 : 3} fill="var(--l-bg)" />
              {isSel && (
                <circle cx={e.x} cy={laneY[e.lane]} r={e.type === "milestone" ? 2 : 1.5} fill={color} />
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="absolute w-[200px] px-3 py-2 font-[Fira_Code,monospace] text-[10px] pointer-events-none"
        style={{
          bottom: 14,
          left: cardLeft,
          background: "var(--l-card-bg)",
          color: "var(--l-fg)",
          border: `1px solid ${selColor}`,
          letterSpacing: "0.05em",
          transition: "left 400ms cubic-bezier(.2,.7,.2,1), border-color 200ms",
        }}
      >
        <div
          className="uppercase mb-[3px] flex justify-between"
          style={{ fontSize: 9, letterSpacing: "0.2em" }}
        >
          <span style={{ color: selColor }}>
            {sel.kind} · {sel.year}
          </span>
          <span style={{ color: branchColor[sel.branch] }}>{sel.branch}</span>
        </div>
        <div className="text-xs font-bold" style={{ letterSpacing: "0.05em" }}>
          {sel.title}
        </div>
      </div>
    </div>
  );
};

export default TimelineDemo;
