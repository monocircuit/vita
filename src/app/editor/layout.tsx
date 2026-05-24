import EditorToolbar from "@/components/features/editor/EditorToolbar";
import { EditorFeatureProvider } from "@/components/features/editor/EditorFeatureContext";
import EditorFeatureManager from "@/components/features/editor/EditorFeatureManager";
import { ChronicleDetailProvider } from "@/components/features/editor/ChronicleDetailContext";
import ChronicleDetailPanel from "@/components/features/editor/ChronicleDetailPanel";
import React from "react";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  return (
    <EditorFeatureProvider>
      <ChronicleDetailProvider>
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
          <EditorFeatureManager />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%" }}>
            <EditorToolbar />
            <div style={{ flex: 1, minHeight: 0 }}>{props.children}</div>
          </div>
          <ChronicleDetailPanel />
        </div>
      </ChronicleDetailProvider>
    </EditorFeatureProvider>
  );
};

export default Layout;
