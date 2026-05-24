"use client";

import { FunctionComponent, ReactNode } from "react";
import Reveal from "@/components/landing/_shared/Reveal";
import SectionKicker from "@/components/landing/_shared/SectionKicker";

const panelStyle = {
  background: "var(--l-panel-bg)",
  backdropFilter: "blur(8px)",
} as const;

const VisualChronicle = () => (
  <div
    className="relative overflow-hidden p-5 h-[280px] border border-[var(--l-panel-border)]"
    style={panelStyle}
  >
    <div className="font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.25em] text-highlight">
      // CHRONICLE_ENTRY · 2018.09
    </div>
    <div className="mt-4 font-[Fira_Sans,sans-serif] text-[22px] font-light">Moved to Berlin</div>
    <div className="mt-3 flex gap-2 flex-wrap">
      {["place:berlin", "type:move", "mood:hopeful", "people:anna"].map((t) => (
        <span
          key={t}
          className="font-[Fira_Code,monospace] text-[10px] px-[7px] py-[3px] border border-[var(--l-panel-border)] text-[var(--l-para)]"
        >
          {t}
        </span>
      ))}
    </div>
    <div
      className="mt-[18px] pt-[14px] font-[Fira_Sans,sans-serif] text-xs text-[var(--l-para)] font-light leading-[1.5] border-t"
      style={{ borderTopColor: "var(--l-panel-border-softer)" }}
    >
      Two suitcases, a deposit on Weinbergsweg, rain the whole first week. The kind of fresh start that sticks.
    </div>
    <div className="absolute bottom-3.5 left-5 right-5 flex gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-1 h-8 border"
          style={{ background: "var(--l-subtle)", borderColor: "var(--l-panel-border-softer)" }}
        />
      ))}
    </div>
  </div>
);

const VisualTimelineFeature = () => (
  <div
    className="overflow-hidden h-[280px] relative border border-[var(--l-panel-border)]"
    style={panelStyle}
  >
    <div
      className="px-5 py-3.5 font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.25em] text-[var(--l-muted)] border-b"
      style={{ borderBottomColor: "var(--l-panel-border-softer)" }}
    >
      // BRANCHING_VIEW · 1998 → 2024
    </div>
    <svg viewBox="0 0 480 220" style={{ width: "100%", height: "calc(100% - 40px)" }}>
      {[50, 90, 130, 170].map((y) => (
        <line key={y} x1="20" y1={y} x2="460" y2={y} stroke="var(--l-grid-subtle)" strokeWidth="1" />
      ))}
      <path
        d="M 20 90 C 60 90, 90 70, 120 70 S 180 110, 220 110 S 300 70, 340 70 S 420 90, 460 90"
        stroke="#FFD100"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 120 70 C 160 70, 180 40, 220 40 S 280 50, 340 70"
        stroke="rgba(125, 211, 252, 0.6)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 3"
      />
      <path
        d="M 220 110 C 260 110, 280 150, 340 150"
        stroke="rgba(196, 181, 253, 0.6)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="3 3"
      />
      {(
        [
          [120, 70, "#FFD100"],
          [220, 110, "#FFD100"],
          [220, 40, "#7DD3FC"],
          [340, 70, "#FFD100"],
          [340, 150, "#C4B5FD"],
          [460, 90, "#FFD100"],
        ] as Array<[number, number, string]>
      ).map(([x, y, c], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill={c} />
          <circle cx={x} cy={y} r="3" fill="var(--l-bg)" />
        </g>
      ))}
      <text x="20" y="210" fill="var(--l-year)" fontSize="9" fontFamily="'Fira Code', monospace">
        1998
      </text>
      <text
        x="220"
        y="210"
        fill="var(--l-year)"
        fontSize="9"
        fontFamily="'Fira Code', monospace"
        textAnchor="middle"
      >
        2011
      </text>
      <text
        x="460"
        y="210"
        fill="var(--l-year)"
        fontSize="9"
        fontFamily="'Fira Code', monospace"
        textAnchor="end"
      >
        2024
      </text>
    </svg>
  </div>
);

const VisualEntities = () => (
  <div
    className="p-5 h-[280px] relative overflow-hidden border border-[var(--l-panel-border)]"
    style={panelStyle}
  >
    <div className="font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.25em] text-highlight">
      // ENTITY_GRAPH · ANNA
    </div>
    <svg viewBox="0 0 400 210" style={{ width: "100%", height: "calc(100% - 20px)", marginTop: 8 }}>
      <line x1="200" y1="100" x2="80" y2="50" stroke="var(--l-entity-line)" />
      <line x1="200" y1="100" x2="320" y2="50" stroke="var(--l-entity-line)" />
      <line x1="200" y1="100" x2="80" y2="170" stroke="var(--l-entity-line)" />
      <line x1="200" y1="100" x2="320" y2="170" stroke="var(--l-entity-line)" />
      <line x1="80" y1="50" x2="80" y2="170" stroke="var(--l-entity-line-soft)" strokeDasharray="2 2" />
      {(
        [
          [200, 100, "ANNA", "#FFD100", 24, true],
          [80, 50, "BERLIN", "#7DD3FC", 16, false],
          [320, 50, "CIRCUS CO.", "#C4B5FD", 16, false],
          [80, 170, "TOM", "#FFD100", 16, false],
          [320, 170, "2018", "#FCA5A5", 16, false],
        ] as Array<[number, number, string, string, number, boolean]>
      ).map(([x, y, l, c, r, big], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="var(--l-card-bg)" stroke={c} strokeWidth={big ? 2 : 1} />
          <text
            x={x}
            y={y + 3}
            textAnchor="middle"
            fill={c}
            fontSize={big ? 10 : 8}
            fontFamily="'Fira Code', monospace"
            fontWeight="700"
            letterSpacing="1"
          >
            {l}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

const VisualShare = () => {
  const rows = [
    { f: ".html", n: "Standalone interactive", s: "4.2 MB", active: false },
    { f: ".pdf", n: "Flat print layout", s: "1.8 MB", active: false },
    { f: ".json", n: "Open source format", s: "210 KB", active: true },
    { f: ".svg", n: "Vector snapshot", s: "640 KB", active: false },
  ];
  return (
    <div
      className="p-5 h-[280px] overflow-hidden flex flex-col gap-2.5 border border-[var(--l-panel-border)]"
      style={panelStyle}
    >
      <div className="font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.25em] text-highlight">
        // EXPORT · choose format
      </div>
      {rows.map((r) => (
        <div
          key={r.f}
          className="flex items-center px-3.5 py-2.5 gap-3.5 font-[Fira_Code,monospace]"
          style={{
            border: `1px solid ${r.active ? "#FFD100" : "var(--l-panel-border-soft)"}`,
            background: r.active ? "rgba(255,209,0,0.08)" : "transparent",
          }}
        >
          <span
            className="text-xs font-bold"
            style={{
              color: r.active ? "#FFD100" : "var(--l-para)",
              letterSpacing: "0.1em",
              minWidth: 44,
            }}
          >
            {r.f}
          </span>
          <span
            className="text-[11px] flex-1 font-[Fira_Sans,sans-serif]"
            style={{ color: "var(--l-para)" }}
          >
            {r.n}
          </span>
          <span className="text-[9px]" style={{ color: "var(--l-year)", letterSpacing: "0.15em" }}>
            {r.s}
          </span>
        </div>
      ))}
    </div>
  );
};

type RowProps = {
  number: string;
  name: string;
  title: string;
  desc: string;
  visual: ReactNode;
  reverse?: boolean;
};

const FeatureRow = ({ number, name, title, desc, visual, reverse = false }: RowProps) => (
  <Reveal>
    <div
      className={`grid grid-cols-2 gap-16 items-center max-md:grid-cols-1 max-md:gap-8 ${
        reverse ? "max-md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className={reverse ? "md:order-2" : "md:order-1"}>
        <div className="flex items-baseline gap-4">
          <span
            className="font-[Fira_Code,monospace] text-[48px] font-bold text-highlight leading-none"
            style={{ WebkitTextStroke: "1px var(--l-stroke-bg)", paintOrder: "stroke fill" }}
          >
            {number}
          </span>
          <span className="font-[Fira_Code,monospace] text-xs uppercase tracking-[0.3em] text-[var(--l-para-3)]">
            {name}
          </span>
        </div>
        <h3
          className="font-[Fira_Sans,system-ui,sans-serif] text-[32px] font-normal mt-5 leading-[1.15]"
          style={{ letterSpacing: "-0.01em" }}
        >
          {title}
        </h3>
        <p className="font-[Fira_Sans,system-ui,sans-serif] text-base leading-[1.6] text-[var(--l-para-2)] mt-5 font-light max-w-[460px]">
          {desc}
        </p>
      </div>
      <div className={reverse ? "md:order-1" : "md:order-2"}>{visual}</div>
    </div>
  </Reveal>
);

const FeaturesSection: FunctionComponent = () => {
  return (
    <section className="px-[max(40px,calc((100vw-1100px)/2))] py-[88px] border-b border-solid border-[var(--l-divider)] max-md:py-14">
      <Reveal>
        <SectionKicker number="01">Features</SectionKicker>
      </Reveal>
      <Reveal delay={100}>
        <h2
          className="font-[Fira_Sans,system-ui,sans-serif] font-light mt-6 max-w-[900px]"
          style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.02em" }}
        >
          The toolkit your life{" "}
          <span className="text-highlight font-medium">already had a shape for</span>.
        </h2>
      </Reveal>
      <div className="mt-[72px] flex flex-col gap-20">
        <FeatureRow
          number="01"
          name="CHRONICLES"
          title="Events, rich enough to hold a life."
          desc="Every chronicle carries date, category, metadata, media anchors and freeform notes. Tag a birth, a breakup, a late-night chapter. Whatever matters."
          visual={<VisualChronicle />}
        />
        <FeatureRow
          number="02"
          name="TIMELINE"
          title="A living, branching canvas."
          desc="Lanes for parallel threads. Connections between causes and consequences. Zoom from a single morning to a whole century. The editor never loses its place."
          visual={<VisualTimelineFeature />}
          reverse
        />
        <FeatureRow
          number="03"
          name="ENTITIES"
          title="The people. The places. The organizations."
          desc="Link the humans who showed up, the cities you passed through, the companies and creeds that shaped the story. Every entity has its own page, its own thread."
          visual={<VisualEntities />}
        />
        <FeatureRow
          number="04"
          name="SHARE"
          title="Export to anywhere. Keep the source."
          desc="Ship a standalone interactive web page, a flat PDF, or the raw JSON. Your data stays yours — the format is open."
          visual={<VisualShare />}
          reverse
        />
      </div>
    </section>
  );
};

export default FeaturesSection;
