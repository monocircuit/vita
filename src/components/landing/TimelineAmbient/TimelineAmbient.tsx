"use client";

import { useMemo } from "react";

type Variant = "dense" | "sparse";

type Props = {
  opacity?: number | string;
  blur?: number;
  speed?: number;
  variant?: Variant;
};

type Event = { x: number; y: number; r: number; id: number; lane: number };

const TimelineAmbient = ({ opacity = 0.28, blur = 18, speed = 80, variant = "dense" }: Props) => {
  const { events, edges, ticks } = useMemo(() => {
    const seed = variant === "dense" ? 42 : 7;
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const count = variant === "dense" ? 38 : 22;
    const ev: Event[] = [];
    for (let i = 0; i < count; i++) {
      const x = (i / count) * 2400 + (rand() - 0.5) * 40;
      const lane = Math.floor(rand() * 3);
      const y = 140 + lane * 90 + (rand() - 0.5) * 20;
      const r = 3 + rand() * 5;
      ev.push({ x, y, r, id: i, lane });
    }
    const ed: Array<[Event, Event]> = [];
    for (let i = 0; i < ev.length - 1; i++) {
      if (Math.abs(ev[i].lane - ev[i + 1].lane) <= 1 && rand() > 0.25) {
        ed.push([ev[i], ev[i + 1]]);
      }
    }
    const tk: number[] = [];
    for (let x = 0; x < 2400; x += 60) tk.push(x);
    return { events: ev, edges: ed, ticks: tk };
  }, [variant]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      style={{ opacity, filter: `blur(${blur}px)` }}
    >
      <div
        className="animate-timeline-drift absolute left-0 top-1/2"
        style={{
          width: "4800px",
          height: "480px",
          transform: "translate(0, -50%)",
          animation: `timeline-drift ${speed}s linear infinite`,
        }}
      >
        <svg width="4800" height="480" viewBox="0 0 4800 480" style={{ display: "block" }}>
          {[0, 2400].map((offset) => (
            <g key={offset} transform={`translate(${offset}, 0)`}>
              {[140, 230, 320].map((y) => (
                <line key={y} x1="0" y1={y} x2="2400" y2={y} stroke="currentColor" strokeWidth="1" opacity="0.35" />
              ))}
              {ticks.map((x) => (
                <line key={x} x1={x} y1="130" x2={x} y2="330" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              ))}
              {edges.map(([a, b], i) => (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
              ))}
              {events.map((e) => (
                <g key={e.id}>
                  <circle cx={e.x} cy={e.y} r={e.r + 3} fill="currentColor" opacity="0.2" />
                  <circle cx={e.x} cy={e.y} r={e.r} fill="currentColor" opacity="0.9" />
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default TimelineAmbient;
