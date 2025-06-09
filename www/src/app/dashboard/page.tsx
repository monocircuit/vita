"use client";

import ChronicleForm from "@/components/ChronicleForm/ChronicleForm";
import { Profile } from "@/utils/schemas/Profile";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@monolithium/next/components";
import { SourceSans3 } from "@monolithium/next/fonts";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChronicleTab from "./tabs/ChronicleTab";

const loadProfile = async () => {
  const supabase = createClient();

  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    console.error("User not authenticated");
  }




  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
  }

  return {
    id: data.id,
    avatarUrl: data.avatar_url,
    dayOfBirth: data.date_of_birth,
    firstName: data.first_name,
    lastName: data.last_name,
    maritalStatus: data.marital_status,
  } as Profile;
};

const Page = () => {
  /** ANCHOR: State */
  const [profile, setProfile] = useState<Profile>({ id: "Not loaded yet" });

  /** ANCHOR: Router */
  const router = useRouter();

  /** ANCHOR: SearchParams */
  const searchParams = useSearchParams();

  useEffect(() => {
    (async () => {
      const profile = await loadProfile();

      console.log(profile);
      setProfile(profile);
    })();
  });

  return (
    <div
      id="dashboard"
      className="size-full grid grid-cols-[1fr] grid-rows-[50px_1fr]"
    >
      <div
        id="dashboard__header"
        className="w-full border-secondary border-solid border-b-(length:--stroke) flex items-center justify-center"
      >
        {`${profile.firstName} ${profile.lastName} | uuid: ${profile.id}`}
      </div>
      <div
        id="dashboard__body"
        className="grid grid-cols-[200px_1fr] grid_rows-[1fr]"
      >
        <div
          id="dashboard__sidebar"
          className="border-secondary border-solid border-r-(length:--stroke) flex flex-col"
        >
          <Button
            text="Chronicles"
            className={`h-[30px] w-full border-b-(length:--stroke) border-solid border-secondary ${SourceSans3.className}`}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("tab", "chronicles");
              router.push(`dashboard?${searchParams.toString()}`);
            }}
          />
          <Button
            text="Views"
            className={`h-[30px] w-full border-b-(length:--stroke) border-solid border-secondary ${SourceSans3.className}`}
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("tab", "views");
              router.push(`dashboard?${searchParams.toString()}`);
            }}
          />
        </div>
        {searchParams.get("tab") == "chronicles" && <ChronicleTab />}
      </div>
    </div>
  );
};

export default Page;
