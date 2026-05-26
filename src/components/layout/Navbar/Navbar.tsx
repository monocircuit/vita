import { FunctionComponent } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

import { Button } from "@monocircuit/monolithium/components";
import { LayoutDashboard, FileText } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";
import { PulsatingDot } from "@monocircuit/monolithium/components";

const dashboardSectionFromPath = (pathname: string) => {
  if (pathname.startsWith("/dashboard/vitas")) return "vitas";
  if (pathname.startsWith("/dashboard/chronicles")) return "chronicles";
  return "overview";
};

const Navbar: FunctionComponent = () => {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;
  const dashboardSection = dashboardSectionFromPath(pathname ?? "");

  return (
    <div className="flex w-full h-full border-b border-secondary relative z-50">
      <Button
        className="flex overflow-hidden h-full aspect-square [&_svg]:text-secondary"
        classNameDrop="!bg-[var(--primary-color)] opacity-30"
        onClick={() => navigate({ to: "/dashboard" })}
        onlyClickAnimation
        vibrate
      >
        <img src="/static/icons/monocircuit.svg" alt="" className="w-full h-full" />
      </Button>
      <div className="bg-secondary w-px" />

      <div className="flex items-center h-full">
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard" })}
          className="nav-bracket-link relative flex items-center gap-2 px-5 h-full text-xs font-medium uppercase tracking-wider text-secondary"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard/vitas" })}
          className="nav-bracket-link relative flex items-center gap-2 px-5 h-full text-xs font-medium uppercase tracking-wider text-secondary"
        >
          <FileText className="h-3.5 w-3.5" />
          my vitas
        </button>
      </div>

      {isDashboard ? (
        <>
          <div
            className="flex items-center px-5 text-secondary"
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 11,
              letterSpacing: "0.08em",
              opacity: 0.7,
            }}
          >
            dashboard /
            <span style={{ marginLeft: 6, opacity: 1 }}>{dashboardSection}</span>
          </div>
          <div className="flex-1" />
          <div
            className="flex items-center gap-2 px-4 text-secondary"
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            <PulsatingDot />
            <span>Local</span>
          </div>
          <div className="bg-secondary w-px" />
          <button
            onClick={() => navigate({ to: "/dashboard/vitas" })}
            className="flex items-center px-5 transition-colors"
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "var(--color-accent)",
              color: "#0a0a0a",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#ffdd2e")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--color-accent)")}
          >
            + New Vita
          </button>
          <div className="bg-secondary w-px" />
        </>
      ) : (
        <div className="grid grid-cols-[100%] grid-rows-[100%] place-items-center flex-1" />
      )}

      <div className="h-full flex items-center justify-center px-4">
        <ThemeToggle />
      </div>

    </div>
  );
};

export default Navbar;
