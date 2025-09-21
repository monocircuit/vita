"use client";

import ChronicleSelect from "@/components/ChronicleSelect/chronicleSelect";
import DynamicView from "@/components/features/editor/DynamicView/DynamicView";
import { useOwnChroniclesData } from "@/utils/supabase/api/chronicles/readOwnChronicles";
import inferDynamicVita from "@/utils/supabase/api/vitas/dynamic/inferDynamicVita";
import Engine from "@/utils/processing/engines/dynamic/Engine";
import { createClient } from "@/utils/supabase/client";
import { Button, Popover } from "@monolithium/next/components";
import React, { useEffect, useState } from "react";

interface Props {}

const Page = (props: Props) => {
  const { ownChronicles } = useOwnChroniclesData();

  useEffect(() => {
    if (ownChronicles) {
      const engine = new Engine(ownChronicles);
      console.log(engine.getFullStack());
    }
  }, [ownChronicles]);

  return <div className="size-full"></div>;
};

export default Page;
