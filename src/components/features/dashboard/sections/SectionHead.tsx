import { mono, sans } from "./utils";

type Props = {
  number: string;
  kicker: string;
  title: string;
  metaValue: string;
  metaLabel: string;
};

const SectionHead = ({ number, kicker, title, metaValue, metaLabel }: Props) => {
  return (
    <div
      className="grid items-end"
      style={{
        gridTemplateColumns: "auto 1fr auto",
        gap: 32,
        padding: "40px max(32px,5%) 28px",
        borderBottom: "1px solid rgba(255,255,255,0.14)",
      }}
    >
      <div
        style={{
          ...mono,
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1,
          color: "var(--color-accent)",
          WebkitTextStroke: "1px #0a0a0a",
          paintOrder: "stroke fill" as const,
        }}
      >
        {number}
      </div>
      <div className="flex flex-col gap-3">
        <div
          style={{
            ...mono,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "#606060",
          }}
        >
          —— · {kicker}
        </div>
        <h2
          style={{
            ...sans,
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: "var(--color-fg)" }}>
          {metaValue}
        </div>
        <div
          style={{
            ...mono,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#606060",
          }}
        >
          {metaLabel}
        </div>
      </div>
    </div>
  );
};

export default SectionHead;
