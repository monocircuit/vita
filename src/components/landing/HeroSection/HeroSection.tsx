"use client";

import { FunctionComponent } from "react";
import { Button } from "@monocircuit/monolithium/components";
import TimelineAmbient from "@/components/landing/TimelineAmbient";
import GridOverlay from "@/components/landing/GridOverlay";
import TimelineDemo from "@/components/landing/TimelineDemo";
import Reveal from "@/components/landing/_shared/Reveal";
import Coords from "@/components/landing/_shared/Coords";
import { openAuthModal } from "@/shared/auth-modal";

const scrollToHowItWorks = () => {
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const HeroSection: FunctionComponent = () => {
  return (
    <section className="relative overflow-hidden border-b border-solid border-[var(--l-divider)]">
      <div className="absolute inset-0" style={{ color: "var(--l-ambient-color)" }}>
        <TimelineAmbient opacity="var(--l-ambient-opacity-hero)" blur={10} speed={150} variant="sparse" />
      </div>
      <div style={{ color: "var(--l-ambient-color)" }}>
        <GridOverlay opacity={0.08} size={40} />
      </div>
      <Coords />

      <div className="relative z-[5] pt-[88px] pb-[72px] px-[max(40px,calc((100vw-1100px)/2))] text-center max-md:pt-14 max-md:pb-12">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 font-[Fira_Code,monospace] text-[10px] uppercase tracking-[0.3em] text-[var(--l-muted)] mb-8">
            <span className="w-6 h-px bg-highlight" />
            THE INTERACTIVE BIOGRAPHY
            <span className="w-6 h-px bg-highlight" />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <h1
            className="font-[Fira_Sans,system-ui,sans-serif] font-[200] leading-none m-0 max-w-[1000px] mx-auto"
            style={{ fontSize: "clamp(48px, 7vw, 104px)", letterSpacing: "-0.03em" }}
          >
            Every life is a{" "}
            <span className="font-[Fira_Code,monospace] font-bold text-highlight" style={{ letterSpacing: "0.02em" }}>
              timeline
            </span>
            .
            <br />
            Now it&rsquo;s editable.
          </h1>
        </Reveal>
        <Reveal delay={260}>
          <p className="font-[Fira_Sans,system-ui,sans-serif] text-[19px] leading-[1.5] text-[var(--l-para)] max-w-[620px] mx-auto mt-7 font-light">
            VITA turns memories, milestones and the people who shaped you into an interactive timeline you can zoom, branch and share.
          </p>
        </Reveal>
        <Reveal delay={380}>
          <div className="flex gap-4 mt-10 justify-center flex-wrap">
            <Button
              className="h-[52px] w-[240px] max-w-[240px] p-0 font-[Fira_Code,monospace] text-sm font-bold tracking-widest bg-highlight text-text-highlight border-none contain-[paint] hover:shadow-[0_0_32px_rgba(255,209,0,0.35)] transition-shadow"
              classNameFlap="opacity-20 bg-black"
              classNameDrop="bg-black/30"
              text="CREATE YOUR VITA →"
              onClick={() => openAuthModal("signup")}
              capslock
              vibrate
            />
            <Button
              className="h-[52px] w-[200px] max-w-[200px] p-0 font-[Fira_Code,monospace] text-sm tracking-widest bg-transparent text-[var(--l-fg)] border-(length:--stroke) border-solid border-[var(--l-divider)] contain-[paint]"
              text="SEE HOW IT WORKS"
              type="secondary"
              onClick={scrollToHowItWorks}
              capslock
              vibrate
            />
          </div>
        </Reveal>
        <Reveal delay={500}>
          <div className="mt-8 font-[Fira_Code,monospace] text-[10px] uppercase tracking-[0.25em] text-[var(--l-muted)]">
            FREE · NO CC · EXPORT ANYWHERE
          </div>
        </Reveal>
      </div>

      <div className="relative z-[5] px-[max(40px,calc((100vw-1100px)/2))] pb-[72px]">
        <Reveal delay={200} y={48}>
          <div className="relative">
            <div className="absolute -left-2 -top-5 font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.25em] text-highlight">
              ↓ editor.v0.4
            </div>
            <div className="absolute -right-2 -top-5 font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.25em] text-[var(--l-muted)]">
              tap any node
            </div>
            <TimelineDemo />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
