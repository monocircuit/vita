"use client";

import NewChronicleTool from "./tools/NewChronicleTool";
import ProfileButton from "./ProfileButton";

const EditorToolbar = () => {
  return (
    <div className="w-full h-12 monolithium-border-b grid grid-cols-[auto_1fr_auto] items-stretch">
      <div className="h-full w-12 self-stretch shrink-0 min-h-0 overflow-hidden">
        <NewChronicleTool />
      </div>
      <div />
      <ProfileButton />
    </div>
  );
};

export default EditorToolbar;
