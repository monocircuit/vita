import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import React from "react";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  return <DashboardLayout>{props.children}</DashboardLayout>;
};

export default Layout;
