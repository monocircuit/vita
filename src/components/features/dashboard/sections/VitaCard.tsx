import { useNavigate } from "@tanstack/react-router";
import { mono, sans, relativeTime } from "./utils";

type Vita = {
  id: number;
  name: string;
  type: string;
  updatedAt: string | Date | null;
  createdAt: string | Date;
};

type Props = {
  vita: Vita;
  chronicleCount: number;
  entityCount: number;
};

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col gap-1">
    <div style={{ ...mono, fontSize: 20, fontWeight: 700, color: "var(--color-fg)" }}>
      {value}
    </div>
    <div
      style={{
        ...mono,
        fontSize: 9,
        textTransform: "uppercase",
        letterSpacing: "0.25em",
        color: "#606060",
      }}
    >
      {label}
    </div>
  </div>
);

const VitaCard = ({ vita, chronicleCount, entityCount }: Props) => {
  const navigate = useNavigate();

  const open = () => {
    navigate({ to: "/editor/$vitaId", params: { vitaId: vita.id } });
  };

  const updated = vita.updatedAt ?? vita.createdAt;

  return (
    <div
      className="flex flex-col transition-colors cursor-pointer"
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#121212",
        padding: "22px 22px 18px",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#161616")}
      onMouseLeave={e => (e.currentTarget.style.background = "#121212")}
      onClick={open}
    >
      <div className="flex items-center justify-end">
        <span style={{ ...mono, color: "#606060", fontSize: 16 }}>···</span>
      </div>

      <div
        style={{
          ...sans,
          fontSize: 22,
          fontWeight: 400,
          color: "var(--color-fg)",
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          marginTop: 18,
        }}
      >
        {vita.name}
      </div>
      <div
        style={{
          ...mono,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.25em",
          color: "#8a8a8a",
          marginTop: 6,
        }}
      >
        {vita.type.toUpperCase()}
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0,
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Stat value={String(chronicleCount)} label="Chronicles" />
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 16 }}>
          <Stat value={String(entityCount)} label="Entities" />
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 16 }}>
          <Stat value="—" label="Span" />
        </div>
      </div>

      <div
        className="flex items-center justify-between"
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{
            ...mono,
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "#606060",
          }}
        >
          Edited {relativeTime(updated)}
        </span>
        <span
          style={{
            ...mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "var(--color-accent)",
          }}
        >
          OPEN →
        </span>
      </div>
    </div>
  );
};

export default VitaCard;
