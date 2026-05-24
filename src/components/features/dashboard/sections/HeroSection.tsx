"use client";

import useOwnProfileReader from "@/shared/data/tables/profiles/read/useOwnProfileReader";
import { useOwnChroniclesReader } from "@/shared/data/tables/chronicles";
import { mono, sans, relativeTime, toTimestamp } from "./utils";

const HeroSection = () => {
  const { data: profile } = useOwnProfileReader();
  const { data: chronicles } = useOwnChroniclesReader();

  const lastEdit = chronicles
    ?.map(c => c.updatedAt ?? c.createdAt ?? null)
    .filter(Boolean)
    .sort((a, b) => (toTimestamp(a) ?? 0) - (toTimestamp(b) ?? 0))
    .slice(-1)[0] ?? null;

  const firstName = profile?.firstName ?? "";

  return (
    <section
      id="hero"
      className="relative"
      style={{
        padding: "56px max(32px,5%) 48px",
        background:
          "var(--color-bg) " +
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px) 0 0 / 40px 40px, " +
          "linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px) 0 0 / 40px 40px",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          right: "max(32px,5%)",
          ...mono,
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#606060",
        }}
      >
        [ 00 · OVERVIEW ]
      </div>

      <div
        className="grid items-end"
        style={{ gridTemplateColumns: "1.1fr 1fr", gap: 64 }}
      >
        <div>
          <div
            className="flex items-center gap-3"
            style={{
              ...mono,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "#606060",
              marginBottom: 24,
            }}
          >
            <span style={{ width: 24, height: 1, background: "#606060" }} />
            Status · Session 0142
          </div>
          <h1
            style={{
              ...sans,
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 200,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "var(--color-fg)",
              margin: 0,
            }}
          >
            {firstName ? `${firstName}, your life, in ` : "Your life, in "}
            <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>
              layers.
            </span>
          </h1>
          <p
            style={{
              ...sans,
              fontSize: 16,
              fontWeight: 300,
              color: "#8a8a8a",
              maxWidth: 520,
              marginTop: 24,
              lineHeight: 1.5,
            }}
          >
            Track chronicles, entities, and branches across every vita you
            maintain. The dashboard is your home base.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <MetaRow label="Sessions" value="0142" />
          <MetaRow label="Last Edit" value={relativeTime(lastEdit)} />
          <MetaRow
            label="Version"
            value={`v${process.env.NEXT_PUBLIC_APP_VERSION ?? "0.4.2"}`}
          />
        </div>
      </div>
    </section>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex items-center gap-6"
    style={{
      ...mono,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.2em",
    }}
  >
    <span style={{ color: "#606060" }}>{label}</span>
    <span style={{ color: "var(--color-fg)", fontWeight: 500 }}>{value}</span>
  </div>
);

export default HeroSection;
