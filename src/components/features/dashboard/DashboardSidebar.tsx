import { PulsatingDot } from "@monocircuit/monolithium/components";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useVitasReader, useChroniclesReader } from "@/shared/data/local";
import { pad2 } from "./sections/utils";

type SectionId = "overview" | "vitas" | "chronicles";

const ROUTE_BY_SECTION: Record<SectionId, string> = {
  overview: "/dashboard",
  vitas: "/dashboard/vitas",
  chronicles: "/dashboard/chronicles",
};

const mono = { fontFamily: "'Fira Code', monospace" };

type NavItem = {
  num: string;
  label: string;
  count: string;
  section: SectionId;
};

const SideItem = ({
  left,
  label,
  right,
  active,
  onClick,
}: {
  left: string;
  label: string;
  right: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="group w-full grid items-center transition-colors text-left"
    style={{
      gridTemplateColumns: "auto 1fr auto",
      gap: 12,
      padding: "10px 16px",
      borderLeft: active ? "2px solid var(--color-accent)" : "2px solid transparent",
      background: active ? "rgba(255,209,0,0.04)" : "transparent",
    }}
    onMouseEnter={e => {
      if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
    }}
    onMouseLeave={e => {
      if (!active) e.currentTarget.style.background = "transparent";
    }}
  >
    <span
      style={{
        ...mono,
        fontSize: 10,
        fontWeight: 700,
        width: 18,
        color: active ? "var(--color-accent)" : "#606060",
      }}
    >
      {left}
    </span>
    <span
      style={{
        ...mono,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        color: active ? "var(--color-accent)" : "#8a8a8a",
      }}
      className="group-hover:!text-[var(--color-fg)]"
    >
      {label}
    </span>
    <span
      style={{
        ...mono,
        fontSize: 9,
        color: active ? "var(--color-accent)" : "#606060",
      }}
    >
      {right}
    </span>
  </button>
);

const GroupHead = ({ text }: { text: string }) => (
  <div
    style={{
      ...mono,
      fontSize: 9,
      textTransform: "uppercase",
      letterSpacing: "0.3em",
      color: "#606060",
      padding: "20px 16px 10px",
    }}
  >
    {text}
  </div>
);

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname }) ?? "";

  const effectiveActive: SectionId = pathname.startsWith("/dashboard/vitas")
    ? "vitas"
    : pathname.startsWith("/dashboard/chronicles")
    ? "chronicles"
    : "overview";
  const { data: vitas } = useVitasReader();
  const { data: chronicles } = useChroniclesReader();

  const vitasCount = vitas?.length ?? 0;
  const chroniclesCount = chronicles?.length ?? 0;
  const dashItems: NavItem[] = [
    { num: "00", label: "Overview", count: "→", section: "overview" },
    { num: "01", label: "Vitas", count: pad2(vitasCount), section: "vitas" },
    { num: "02", label: "Chronicles", count: pad2(chroniclesCount), section: "chronicles" },
  ];

  const goTo = (s: SectionId) => {
    navigate({ to: ROUTE_BY_SECTION[s] });
  };

  return (
    <aside
      className="h-full flex flex-col"
      style={{
        background: "var(--color-bg)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <GroupHead text="// Dashboard" />
      {dashItems.map(it => (
        <SideItem
          key={it.section}
          left={it.num}
          label={it.label}
          right={it.count}
          active={effectiveActive === it.section}
          onClick={() => goTo(it.section)}
        />
      ))}

      <div className="mt-auto" style={{ marginBottom: 16 }}>
        <GroupHead text="// Account" />
        <SideItem left="▸" label="Settings" right="—" onClick={() => navigate({ to: "/dashboard/settings" })} />
      </div>

      <div
        className="flex items-center justify-between"
        style={{
          ...mono,
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "#606060",
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textTransform: "uppercase",
        }}
      >
        <span>v{import.meta.env.VITE_APP_VERSION ?? "0.4.2"}</span>
        <span className="flex items-center gap-2">
          <PulsatingDot />
          Online
        </span>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
