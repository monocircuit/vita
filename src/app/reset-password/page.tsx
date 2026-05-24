"use client";

import React from "react";
import ResetPassword from "@/components/ResetPassword/ResetPassword";
import TimelineAmbient from "@/components/landing/TimelineAmbient";
import GridOverlay from "@/components/landing/GridOverlay";

function ResetPasswordPage() {
  return (
    <div className="landing relative w-full h-full overflow-hidden bg-[var(--l-bg)] text-[var(--l-fg)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ color: "var(--l-ambient-color)" }}
      >
        <TimelineAmbient
          opacity="var(--l-ambient-opacity-hero)"
          blur={10}
          speed={150}
          variant="sparse"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ color: "var(--l-ambient-color)" }}
      >
        <GridOverlay opacity={0.08} size={40} />
      </div>

      <div className="relative z-[5] w-full h-full flex items-center justify-center p-6">
        <div className="w-[min(450px,95vw)] h-[min(500px,90vh)]">
          <ResetPassword />
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
