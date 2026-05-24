"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import arrowIcon from "@/assets/images/png/sharp_line/Tailless-Line-Arrow-Right-1--Streamline-Sharp.png";
import ChronicleCreateForm from "@/components/forms/domains/chronicle/create";
import { useEditorFeature } from "./EditorFeatureContext";

const EditorFeatureManager = () => {
  const { activeFeature, toggleFeature } = useEditorFeature();

  const params = useParams();
  const vitaId = useMemo(() => {
    const raw = params?.vitaId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }, [params]);

  const FEATURES: Record<string, { title: string; content: React.ReactNode }> =
    {
      "chronicle-add": {
        title: "Add Chronicle",
        content: <ChronicleCreateForm vitaId={vitaId} />,
      },
    };

  const isVisible = !!activeFeature;

  // Keep the last active feature visible until the close animation finishes.
  const [displayedFeature, setDisplayedFeature] = useState<string | null>(activeFeature);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeFeature) {
      setDisplayedFeature(activeFeature);
    } else {
      timerRef.current = setTimeout(() => setDisplayedFeature(null), 300);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeFeature]);

  const feature = displayedFeature ? FEATURES[displayedFeature] : null;

  return (
    <>
      <div
        className={`h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${isVisible ? "w-[300px]" : "w-0"}`}
        aria-hidden={!isVisible}
      >
        <aside
          className={`w-[300px] h-full flex flex-col border-r-(length:--stroke) border-solid border-border transition-transform duration-300 ease-in-out ${isVisible ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Header — same height as editor toolbar (h-12) */}
          <div className="h-12 shrink-0 flex items-center px-3 border-b-(length:--stroke) border-solid border-border overflow-hidden">
            <span className="flex-1 text-sm text-fg">
              {feature?.title ?? "\u00A0"}
            </span>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {feature ? feature.content : null}
          </div>
        </aside>
      </div>

      {/* Close tab — outside overflow-hidden so it overlaps the canvas/toolbar.
          w-6 + -mr-6 = 24px wide but contributes 0 to flex layout,
          so the right column starts directly at the panel border.
          pointer-events-none on the container ensures only exact clicks
          on the SVG shape (pointer-events: fill) trigger the close action. */}
      {activeFeature ? (
        <div className="shrink-0 w-6 -mr-6 h-full relative flex items-center justify-center z-10 pointer-events-none">
          <svg
            className="absolute top-1/2 -translate-y-1/2 left-0 w-full"
            viewBox="0 0 24 80"
            style={{ height: "80px" }}
          >
            <g
              className="cursor-pointer group/tab"
              onClick={() => toggleFeature(activeFeature)}
            >
              <path
                d="M 0,0 C 0,20 24,20 24,40 C 24,60 0,60 0,80 Z"
                className="text-error/20 group-hover/tab:text-error/40 transition-colors"
                fill="currentColor"
                style={{ pointerEvents: "fill" }}
              />
            </g>
          </svg>
          {/* Icon — rotated 180° to point left (inward), masked to error color */}
          <div
            className="absolute w-3 h-3 rotate-180 pointer-events-none bg-error"
            style={{
              maskImage: `url(${arrowIcon.src})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        </div>
      ) : null}
    </>
  );
};

export default EditorFeatureManager;
