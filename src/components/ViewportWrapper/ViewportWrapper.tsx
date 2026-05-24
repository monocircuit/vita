import { useApplication } from "@pixi/react";
import React from "react";

interface Props {
  children?: React.ReactNode[];
}

const Viewport = (props: Props) => {
  /** ANCHOR: PixiJS Application */
  const application = useApplication();

  return (
    <>
      {application.app.renderer && (
        <viewport events={application.app.renderer.events}>
          {props.children}
        </viewport>
      )}
    </>
  );
};

export default Viewport;
