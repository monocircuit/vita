"use client";

import ChronicleSelect from "@/components/ChronicleSelect/chronicleSelect";
import DynamicView from "@/components/features/editor/DynamicView/DynamicView";
import { useOwnChroniclesData } from "@/utils/supabase/api/chronicle/readOwnChronicles";
import inferDynamicVita from "@/utils/supabase/api/vitas/dynamic/inferDynamicVita";
import { createClient } from "@/utils/supabase/client";
import { Button, Popover } from "@monolithium/next/components";
import React, { useEffect, useState } from "react";

interface Props {}

const Page = (props: Props) => {
  const { ownChronicles } = useOwnChroniclesData();

  useEffect(() => {
    if (ownChronicles) inferDynamicVita(ownChronicles);
  }, [ownChronicles]);

  return (
    <div className="size-full">
      <Popover
        content={<ChronicleSelect submitFunction={() => {}}></ChronicleSelect>}
        className="max-w-[1200px]"
        shouldRender={isSelectPopooverActiv}
        config={{
          pushTo: "right",
          isConnected: false,
          isDraggable: true,
          isClosableByEmptyClick: true,
        }}
      >
        <Button
          className="h-12 m-2 p-2 w-20"
          onClick={() => setSelectPopooverActiv(!isSelectPopooverActiv)}
          capslock
          vibrate
        >
          test
        </Button>
      </Popover>
    </div>
  );
};

export default Page;
