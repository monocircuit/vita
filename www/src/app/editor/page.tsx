"use client";

import DynamicView from "@/components/features/editor/DynamicView/DynamicView";
import { useOwnChroniclesData } from "@/utils/supabase/api/chronicle/readOwnChronicles";
import inferDynamicVita from "@/utils/supabase/api/vitas/dynamic/inferDynamicVita";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect } from "react";

interface Props {}

const Page = (props: Props) => {
  const { ownChronicles } = useOwnChroniclesData();

  useEffect(() => {
    if (ownChronicles) inferDynamicVita(ownChronicles);
  }, [ownChronicles]);

  return (
    <div className="size-full">
      <DynamicView></DynamicView>
    </div>
  );
};

export default Page;
