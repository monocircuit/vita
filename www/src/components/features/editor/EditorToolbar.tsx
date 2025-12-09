"use client";

import Image from "next/image";
import { Button, Popover } from "@monolithium/next/components";

import Add from "@/assets/images/png/sharp_line/add.png";
import { useState } from "react";
import ChronicleForm from "@/components/common/ChronicleForm/ChronicleForm";

interface Props {}

const EditorToolbar = (props: Props) => {
  /* ANCHOR: State */
  const [shouldPopoverRender, setShouldPopoverRender] = useState(false);

  return (
    <div className="w-full h-15 monolithium-border-b grid grid-cols-[auto_1fr]">
      <div className="aspect-square monolithium-border m-0.5 overflow-hidden">
        <Popover
          className="w-[300px] h-[400px] monolithium-border bg-primary"
          content={<ChronicleForm />}
          shouldRender={shouldPopoverRender}
          config={{ isConnected: true }}
        >
          <Button
            className="size-full"
            onClick={() => setShouldPopoverRender(!shouldPopoverRender)}
          >
            <Image src={Add} alt="add" width={100} height={100} />
          </Button>
        </Popover>
      </div>
    </div>
  );
};

export default EditorToolbar;
