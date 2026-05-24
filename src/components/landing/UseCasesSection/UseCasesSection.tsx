"use client";

import { FunctionComponent } from "react";
import Reveal from "@/components/landing/_shared/Reveal";
import SectionKicker from "@/components/landing/_shared/SectionKicker";

type Case = {
  n: string;
  title: string;
  emo: string;
  desc: string;
  tags: string[];
};

const cases: Case[] = [
  {
    n: "01",
    title: "FAMILIES",
    emo: "The shoebox, finally sorted.",
    desc: "Trips, moves, births, reunions. Weave generations into a map your kids can add to.",
    tags: ["TREES", "MEDIA", "PRIVATE"],
  },
  {
    n: "02",
    title: "AUTHORS",
    emo: "Worldbuilding, on a real calendar.",
    desc: "Track characters and factions on one canvas. Branch POVs. Never contradict yourself in chapter twelve again.",
    tags: ["BRANCHES", "NOTES", "POV"],
  },
  {
    n: "03",
    title: "HISTORIANS",
    emo: "Personal archive meets the record.",
    desc: "Anchor interviews and artifacts in time. Cross-reference entities. Export citations.",
    tags: ["SOURCES", "GRAPH", "CITE"],
  },
];

const UseCaseCard = ({ c }: { c: Case }) => (
  <Reveal>
    <div
      className="p-9 h-full relative overflow-hidden transition-colors duration-200 hover:bg-[var(--l-use-case-hover)]"
      style={{ background: "var(--l-use-case-bg)" }}
    >
      <div className="flex items-center gap-3">
        <span className="font-[Fira_Code,monospace] text-[11px] text-highlight" style={{ letterSpacing: "0.2em" }}>
          {c.n}
        </span>
        <span className="h-px w-6 bg-[var(--l-divider)]" />
        <span className="font-[Fira_Code,monospace] text-[13px] font-bold tracking-[0.25em]">{c.title}</span>
      </div>
      <div className="mt-6 font-[Fira_Sans,system-ui,sans-serif] text-[19px] italic font-light text-highlight leading-[1.3]">
        &ldquo;{c.emo}&rdquo;
      </div>
      <p className="mt-4 font-[Fira_Sans,system-ui,sans-serif] text-sm leading-[1.6] text-[var(--l-para-2)] font-light">
        {c.desc}
      </p>
      <div className="mt-6 flex gap-2 flex-wrap">
        {c.tags.map((t) => (
          <span
            key={t}
            className="font-[Fira_Code,monospace] text-[9px] px-2 py-1 border border-[var(--l-panel-border)] text-[var(--l-para)]"
            style={{ letterSpacing: "0.2em" }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  </Reveal>
);

const UseCasesSection: FunctionComponent = () => {
  return (
    <section className="px-[max(40px,calc((100vw-1100px)/2))] py-[88px] border-b border-solid border-[var(--l-divider)] max-md:py-14">
      <Reveal>
        <SectionKicker number="03">Use cases</SectionKicker>
      </Reveal>
      <Reveal delay={100}>
        <h2
          className="font-[Fira_Sans,system-ui,sans-serif] font-light mt-6"
          style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.02em" }}
        >
          For anyone who thinks in <span className="text-highlight font-medium">threads</span>.
        </h2>
      </Reveal>
      <div
        className="grid grid-cols-3 gap-px mt-14 max-md:grid-cols-1"
        style={{ background: "var(--l-divider)", border: "1px solid var(--l-divider)" }}
      >
        {cases.map((c) => (
          <UseCaseCard key={c.n} c={c} />
        ))}
      </div>
    </section>
  );
};

export default UseCasesSection;
