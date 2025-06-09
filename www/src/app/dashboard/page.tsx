"use client";

import { getOwnProfile } from "@/utils/supabase/api/profiles/getOwnProfile";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";



const Page = () => {

  async function showProfile() {
    const profile = await getOwnProfile();
    console.log(profile);
  }

  showProfile();

  console.log()

  return <div className="size-full">Dashboard</div>;
};

export default Page;
