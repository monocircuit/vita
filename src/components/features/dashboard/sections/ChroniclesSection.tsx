"use client";

import { useChroniclesReader } from "@/shared/data/local";
import SectionHead from "./SectionHead";
import { mono, sans, formatDateStamp, pad2, toTimestamp } from "./utils";

type Chronicle = {
  id: number;
  title: string;
  scope: string;
  category: string | null;
  createdAt: string | Date | null;
};

const ScopePill = ({ scope }: { scope: string }) => {
  const isPersonal = scope.toLowerCase() === "personal";
  return (
    <span
      style={{
        ...mono,
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.25em",
        padding: "3px 7px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: isPersonal ? "rgba(255,209,0,0.08)" : "transparent",
        color: isPersonal ? "var(--color-accent)" : "#8a8a8a",
      }}
    >
      {scope}
    </span>
  );
};

const ChronicleRow = ({ c }: { c: Chronicle }) => (
  <div
    className="grid items-center group cursor-pointer"
    style={{
      gridTemplateColumns: "auto 1fr auto auto",
      gap: 16,
      padding: "14px 4px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <div style={{ ...mono, fontSize: 11, color: "#b8b8b8", minWidth: 82 }}>
      {formatDateStamp(c.createdAt)}
    </div>
    <div className="flex flex-col gap-1.5 min-w-0">
      <div
        style={{
          ...sans,
          fontSize: 15,
          fontWeight: 400,
          color: "var(--color-fg)",
        }}
        className="truncate"
      >
        {c.title}
      </div>
      {c.category && (
        <div className="flex gap-1.5">
          <span
            style={{
              ...mono,
              fontSize: 9,
              padding: "2px 6px",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#8a8a8a",
            }}
          >
            type:{c.category}
          </span>
        </div>
      )}
    </div>
    <ScopePill scope={c.scope} />
    <span
      style={{ ...mono, color: "#606060" }}
      className="group-hover:!text-[var(--color-accent)]"
    >
      →
    </span>
  </div>
);

const AccountCard = () => {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 24,
        background: "#121212",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            border: "1px solid rgba(255,255,255,0.08)",
            ...mono,
            fontWeight: 700,
            fontSize: 20,
            color: "var(--color-accent)",
          }}
        >
          ·
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div style={{ ...sans, fontSize: 18, color: "var(--color-fg)" }} className="truncate">
            Local
          </div>
          <div
            style={{
              ...mono,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#606060",
            }}
            className="truncate"
          >
            DESKTOP · SINGLE-USER
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-6">
        {[
          ["Plan", "Free"],
          ["Storage", "—"],
          ["Devices", "—"],
          ["API Key", "—"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between"
            style={{
              ...mono,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "#606060" }}>{k}</span>
            <span style={{ color: "var(--color-fg)" }}>{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 text-right">
        <a
          href="/dashboard/settings"
          style={{
            ...mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          Manage Account →
        </a>
      </div>
    </div>
  );
};

const ChroniclesSection = () => {
  const { data: chronicles } = useChroniclesReader();
  const total = chronicles?.length ?? 0;

  const recent = (chronicles ?? [])
    .slice()
    .sort((a, b) => (toTimestamp(b.createdAt) ?? 0) - (toTimestamp(a.createdAt) ?? 0))
    .slice(0, 8);

  return (
    <section id="sec-chron" style={{ background: "#0e0e0e", position: "relative" }}>
      <SectionHead
        number="02"
        kicker="SECTION · CHRONICLES"
        title="Recent activity."
        metaValue={pad2(total)}
        metaLabel="Chronicles · Total"
      />
      <div
        className="grid"
        style={{
          padding: "32px max(32px,5%) 48px",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 48,
        }}
      >
        <div>
          {recent.length === 0 ? (
            <div
              style={{
                ...sans,
                color: "#8a8a8a",
                padding: "24px 0",
              }}
            >
              No chronicles yet.{" "}
              <a
                href="/dashboard/chronicles"
                style={{
                  ...mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                  marginLeft: 8,
                }}
              >
                Create one →
              </a>
            </div>
          ) : (
            <>
              {recent.map(c => (
                <ChronicleRow key={c.id} c={c as unknown as Chronicle} />
              ))}
              <div className="mt-4">
                <a
                  href="/dashboard/chronicles"
                  style={{
                    ...mono,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "var(--color-accent)",
                  }}
                >
                  View All →
                </a>
              </div>
            </>
          )}
        </div>
        <AccountCard />
      </div>
    </section>
  );
};

export default ChroniclesSection;
