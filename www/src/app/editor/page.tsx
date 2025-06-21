"use client";

import DynamicView from "@/components/features/editor/DynamicView/DynamicView";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect } from "react";

interface Props {}

const Page = (props: Props) => {
  useEffect(() => {
    const getUser = async () => {
      const client = createClient();
      console.log(await client.auth.getSession());
    };

    getUser();
  }, []);

  return (
    <div className="size-full">
      <ChronicleSelect></ChronicleSelect>
    </div>
  );
};

export default Page;
