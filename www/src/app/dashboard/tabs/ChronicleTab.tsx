import ChronicleForm from "@/components/ChronicleForm/ChronicleForm";
import { Button, Popover } from "@monolithium/next/components";
import React, { useState } from "react";

interface Props {}

const ChronicleTab = (props: Props) => {
  /** ANCHOR: State */
  const [isAddPopoverActive, setIsAddPopoverActive] = useState(false);

  return (
    <div id="chronicle-tab" className="size-full">
      <Popover
        content={<ChronicleForm />}
        className="w-[300px] h-[500px] border-solid border-secondary border-(length:--stroke) bg-primary"
        config={{
          isConnected: true,
          isClosableByEmptyClick: true,
          isDraggable: true,
        }}
        shouldRender={isAddPopoverActive}
      >
        <Button
          text="add"
          className="h-[30px] w-[30px] border-solid border-secondary border-(length:--stroke) m-[5px]"
          onClick={() => setIsAddPopoverActive(!isAddPopoverActive)}
        />
      </Popover>
    </div>
  );
};

export default ChronicleTab;
