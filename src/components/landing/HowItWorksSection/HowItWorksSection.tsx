"use client";

import { FunctionComponent } from "react";
import TimelineAmbient from "@/components/landing/TimelineAmbient";
import Reveal from "@/components/landing/_shared/Reveal";
import SectionKicker from "@/components/landing/_shared/SectionKicker";

const steps = [
  { n: "01", t: "CREATE", d: "Sign up, name your vita. The canvas is blank — the first event is yours." },
  { n: "02", t: "CHRONICLE", d: "Drop events, tag entities, draw connections. Messy thinking welcome." },
  { n: "03", t: "VISUALIZE", d: "Branch timelines, theme colors, publish a link. Loop or export the JSON." },
];

const HowItWorksSection: FunctionComponent = () => {
  return (
    <section id="how-it-works" className="relative overflow-hidden px-[max(40px,calc((100vw-1100px)/2))] py-[88px] border-b border-solid border-[var(--l-divider)] max-md:py-14">
      <div className="absolute inset-0" style={{ color: "var(--l-ambient-color)" }}>
        <TimelineAmbient opacity="var(--l-ambient-opacity-work)" blur={14} speed={180} variant="dense" />
      </div>
      <div className="relative z-[3]">
        <Reveal>
          <SectionKicker number="02">How it works</SectionKicker>
        </Reveal>
        <Reveal delay={100}>
          <h2
            className="font-[Fira_Sans,system-ui,sans-serif] font-light mt-6"
            style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.02em" }}
          >
            From blank to <span className="text-highlight font-medium">biography</span> in three moves.
          </h2>
        </Reveal>
        <div className="mt-16 relative">
          <div
            className="absolute left-0 right-0 max-md:hidden"
            style={{
              top: 42,
              height: 1,
              background:
                "linear-gradient(90deg, #FFD100 0%, #FFD100 56.6%, var(--l-divider) 71.6%)",
            }}
          />
          <div className="grid grid-cols-3 gap-8 relative max-md:grid-cols-1 max-md:gap-12">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={120 * i}>
                <div>
                  <div
                    className="w-10 h-10 flex items-center justify-center font-[Fira_Code,monospace] text-base font-bold relative z-[2]"
                    style={{
                      background: i === 2 ? "var(--l-bg)" : "#FFD100",
                      border: i === 2 ? "1px solid var(--l-divider)" : "none",
                      color: i === 2 ? "var(--l-fg)" : "#000",
                    }}
                  >
                    {s.n}
                  </div>
                  <div className="mt-6 font-[Fira_Code,monospace] text-sm font-bold tracking-[0.25em]">
                    {s.t}
                  </div>
                  <p className="mt-3 font-[Fira_Sans,system-ui,sans-serif] text-[15px] leading-[1.55] text-[var(--l-para-2)] font-light max-w-[340px]">
                    {s.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
