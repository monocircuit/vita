"use client";

import NewChronicleTool from "./tools/NewChronicleTool";

const EditorToolbar = () => {
  return (
    <div className="w-full h-15 monolithium-border-b grid grid-cols-[auto_1fr]">
      <NewChronicleTool />
    </div>
  );
};

export default EditorToolbar;
