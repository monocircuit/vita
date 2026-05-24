import { mono, sans } from "./utils";

type Props = {
  number: string;
  kicker: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

const PageHead = ({ number, kicker, title, subtitle, right }: Props) => {
  return (
    <div
      className="grid items-end relative"
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
        <h1
          style={{
            ...sans,
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            style={{
              ...sans,
              fontSize: 14,
              fontWeight: 300,
              color: "#8a8a8a",
              maxWidth: 560,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {right && <div className="flex items-end">{right}</div>}
    </div>
  );
};

export default PageHead;
