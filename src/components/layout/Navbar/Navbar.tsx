"use client";
import { FunctionComponent } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@monocircuit/monolithium/components";
import { LayoutDashboard, FileText } from "lucide-react";

import MonocircuitLogo from "../../../../public/static/icons/monocircuit.svg";

import ThemeToggle from "@/components/ThemeToggle";
import { PulsatingDot } from "@monocircuit/monolithium/components";

const dashboardSectionFromPath = (pathname: string) => {
  if (pathname.startsWith("/dashboard/vitas")) return "vitas";
  if (pathname.startsWith("/dashboard/chronicles")) return "chronicles";
  return "overview";
};

const Navbar: FunctionComponent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard") ?? false;
  const dashboardSection = dashboardSectionFromPath(pathname ?? "");

  return (
    <div className="flex w-full h-full border-b border-secondary relative z-50">
      <Button
        className="flex overflow-hidden h-full aspect-square [&_svg]:text-secondary"
        classNameDrop="!bg-[var(--primary-color)] opacity-30"
        onClick={() => router.push("/dashboard")}
        onlyClickAnimation
        vibrate
      >
        <MonocircuitLogo />
      </Button>
      <div className="bg-secondary w-px" />

      <div className="flex items-center h-full">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="nav-bracket-link relative flex items-center gap-2 px-5 h-full text-xs font-medium uppercase tracking-wider text-secondary"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          dashboard
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/vitas")}
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
            onClick={() => router.push("/dashboard/vitas")}
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

      <style jsx>{`
        :global(.nav-bracket-link)::before,
        :global(.nav-bracket-link)::after {
          content: "";
          position: absolute;
          top: 50%;
          color: var(--color-accent);
          font-family: "Fira Code", monospace;
          font-size: 14px;
          line-height: 1;
          opacity: 0;
          transition: opacity 0.18s ease, transform 0.18s ease;
          pointer-events: none;
        }
        :global(.nav-bracket-link)::before {
          content: "[";
          left: 6px;
          transform: translate(4px, -50%);
        }
        :global(.nav-bracket-link)::after {
          content: "]";
          right: 6px;
          transform: translate(-4px, -50%);
        }
        :global(.nav-bracket-link):hover::before,
        :global(.nav-bracket-link):hover::after {
          opacity: 1;
          transform: translate(0, -50%);
        }
      `}</style>
    </div>
  );
};

export default Navbar;
