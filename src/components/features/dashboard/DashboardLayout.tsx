"use client";

import DashboardSidebar from "./DashboardSidebar";

const MAIN_SCROLL_ID = "dashboard-main-scroll";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="dark w-full h-full grid"
      style={{ gridTemplateColumns: "220px 1fr", background: "var(--color-bg)" }}
    >
      <DashboardSidebar />
      <main
        id={MAIN_SCROLL_ID}
        className="min-h-0 overflow-y-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
