import ChronicleCreateForm from "@/components/forms/domains/chronicle/create";
import { Button, Popover } from "@monocircuit/monolithium/components";
import React, { useState } from "react";

interface Props {}

const ChronicleTab = (_props: Props) => {
  /** ANCHOR: State */
  const [isAddPopoverActive, setIsAddPopoverActive] = useState(false);

  return (
    <div id="chronicle-tab" className="size-full">
      <Popover
        content={<ChronicleCreateForm />}
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
