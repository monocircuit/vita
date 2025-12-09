import EditorToolbar from "@/components/features/editor/EditorToolbar";
import React from "react";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  return (
    <>
      <EditorToolbar />
      <div className="">{props.children}</div>
    </>
  );
};

export default Layout;
