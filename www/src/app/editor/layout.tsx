import React from "react";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  return (
    <>
      <div className="w-full h-15 monolithium-border-b"></div>
      <div className="">{props.children}</div>
    </>
  );
};

export default Layout;
