"use client";

import { FunctionComponent } from "react";
import { Button } from "@monocircuit/monolithium/components";
import TimelineAmbient from "@/components/landing/TimelineAmbient";
import GridOverlay from "@/components/landing/GridOverlay";
import Reveal from "@/components/landing/_shared/Reveal";
import { openAuthModal } from "@/shared/auth-modal";

const CtaFooterSection: FunctionComponent = () => {
  return (
    <>
      <section className="relative overflow-hidden px-[max(40px,calc((100vw-1100px)/2))] py-[120px] max-md:py-20">
        <div className="absolute inset-0" style={{ color: "var(--l-ambient-color)" }}>
          <TimelineAmbient opacity="var(--l-ambient-opacity-cta)" blur={10} speed={110} variant="dense" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--l-haze-radial)" }} />
        <div style={{ color: "var(--l-ambient-color)" }}>
          <GridOverlay opacity={0.06} size={40} />
        </div>

        <div className="relative z-[5] text-center max-w-[900px] mx-auto">
          <Reveal>
            <div className="font-[Fira_Code,monospace] text-[11px] uppercase tracking-[0.3em] text-highlight mb-8">
              // begin_vita
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2
              className="font-[Fira_Sans,system-ui,sans-serif] font-[200] m-0"
              style={{ fontSize: "clamp(44px, 6vw, 88px)", letterSpacing: "-0.03em", lineHeight: 1.02 }}
            >
              The first event
              <br />
              <span
                className="font-[Fira_Code,monospace] font-bold text-highlight"
                style={{ letterSpacing: "0.04em" }}
              >
                is on us.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={260}>
            <p className="mt-7 font-[Fira_Sans,system-ui,sans-serif] text-lg text-[var(--l-para)] font-light max-w-[520px] mx-auto">
              Your account takes thirty seconds. Your first chronicle takes thirty more.
            </p>
          </Reveal>
          <Reveal delay={380}>
            <div className="mt-12 flex gap-4 justify-center flex-wrap">
              <Button
                className="h-[64px] min-w-[280px] p-0 font-[Fira_Code,monospace] text-base font-bold tracking-widest bg-highlight text-text-highlight border-none contain-[paint] hover:shadow-[0_0_32px_rgba(255,209,0,0.35)] transition-shadow"
                classNameFlap="opacity-20 bg-black"
                classNameDrop="bg-black/30"
                text="SIGN UP FREE →"
                onClick={() => openAuthModal("signup")}
                capslock
                vibrate
              />
            </div>
          </Reveal>
          <Reveal delay={500}>
            <div className="mt-14 flex justify-center gap-10 font-[Fira_Code,monospace] text-[10px] uppercase tracking-[0.3em] text-[var(--l-muted)] flex-wrap">
              <span>NO CREDIT CARD</span>
              <span style={{ color: "var(--l-divider)" }}>·</span>
              <span>EXPORT ANYTIME</span>
              <span style={{ color: "var(--l-divider)" }}>·</span>
              <span>OPEN FORMAT</span>
            </div>
          </Reveal>
        </div>
      </section>
      <footer className="px-[max(40px,calc((100vw-1100px)/2))] py-7 border-t border-solid border-[var(--l-divider)] flex justify-between font-[Fira_Code,monospace] text-[10px] uppercase tracking-[0.25em] text-[var(--l-muted)] max-md:flex-col max-md:gap-2 max-md:text-center">
        <span>VITA v0.4 · MONOCIRCUIT</span>
        <span>© 2026 · MAP YOUR STORY</span>
      </footer>
    </>
  );
};

export default CtaFooterSection;
