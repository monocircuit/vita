"use client";

import DynamicView from "@/components/DynamicView/DynamicView";
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
      <DynamicView></DynamicView>
    </div>
  );
};

export default Page;
