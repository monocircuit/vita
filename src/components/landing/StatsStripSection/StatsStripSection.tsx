import { FunctionComponent } from "react";

type Stat = {
  k: string;
  v: string;
  deskBorderL: boolean;
};

const stats: Stat[] = [
  { k: "INFINITE", v: "event types", deskBorderL: false },
  { k: "3D", v: "branching timeline", deskBorderL: true },
  { k: "100%", v: "yours to export", deskBorderL: true },
  { k: "0€", v: "forever plan", deskBorderL: true },
];

const StatsStripSection: FunctionComponent = () => {
  return (
    <section
      className="grid grid-cols-4 border-b border-solid border-[var(--l-divider)] max-md:grid-cols-2"
      style={{ background: "var(--l-stats-bg)" }}
    >
      {stats.map((s) => (
        <div
          key={s.k}
          className="px-7 py-9 text-center"
          style={{
            borderLeft: s.deskBorderL ? "1px solid var(--l-divider)" : "none",
          }}
        >
          <div
            className="font-[Fira_Code,monospace] text-[32px] font-bold text-highlight"
            style={{
              WebkitTextStroke: "1px var(--l-stroke-bg)",
              paintOrder: "stroke fill",
              letterSpacing: "0.02em",
            }}
          >
            {s.k}
          </div>
          <div className="mt-1.5 font-[Fira_Code,monospace] text-[10px] uppercase tracking-[0.3em] text-[var(--l-muted)]">
            {s.v}
          </div>
        </div>
      ))}
    </section>
  );
};

export default StatsStripSection;
