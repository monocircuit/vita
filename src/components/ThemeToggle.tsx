"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const modes = ["light", "dark", "system"] as const;

const icons: Record<(typeof modes)[number], typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="inline-flex h-9 items-center gap-0.5 border border-solid p-0.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        {modes.map((m) => (
          <span key={m} className="h-8 w-8" />
        ))}
      </div>
    );
  }

  const cycle = () => {
    const currentIndex = modes.indexOf(theme as (typeof modes)[number]);
    const next = modes[(currentIndex + 1) % modes.length];
    setTheme(next);
  };

  return (
    <div
      className="inline-flex h-9 items-center gap-0.5 border border-solid p-0.5"
      style={{ borderColor: "var(--color-border)" }}
    >
      {modes.map((m) => {
        const Icon = icons[m];
        const isActive = theme === m;

        return (
          <button
            key={m}
            type="button"
            onClick={() => setTheme(m)}
            aria-label={`Switch to ${m} theme`}
            className="relative flex h-8 w-8 items-center justify-center transition-colors"
            style={{
              backgroundColor: isActive
                ? "var(--color-accent)"
                : "transparent",
              color: isActive
                ? "var(--color-accent-fg)"
                : "var(--color-muted-fg)",
            }}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
