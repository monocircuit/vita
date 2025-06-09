"use client";

import { getChronicles } from "@/utils/supabase/api/chronicle/getChronicles";
import { getOwnProfile } from "@/utils/supabase/api/profiles/getOwnProfile";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";



const Page = () => {

  async function showProfile() {
    const profile = await getOwnProfile();
    console.log(profile);
  }
  const showChronicles = async () => {
    const chronicles = await getChronicles();
    return chronicles
  }

  showProfile();

  const test = showChronicles();
  console.log(test)

  return <div className="size-full">Dashboard</div>;
};

export default Page;
