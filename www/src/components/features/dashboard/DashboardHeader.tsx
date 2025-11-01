import { useOwnProfileData } from "@/utils/supabase/tables/profiles/getOwnProfile";
import Profile from "@/components/common/Profile";
import React from "react";
import { Button } from "@monolithium/next/components";

interface Props {}

const DashboardHeader = (props: Props) => {
  const { ownProfile, ownProfileError, isOwnProfileLoading } =
    useOwnProfileData();

  return (
    <div id="dashboard-header" className="size-full flex">
      <div id="dashboard-header__title">
        {`${ownProfile?.firstName} ${ownProfile?.lastName}`}
      </div>
      <Button className="h-full aspect-square border-solid border-secondary border-l-(length:--stroke) ml-auto">
        <div className="size-full p-1">
          <Profile />
        </div>
      </Button>
    </div>
  );
};

export default DashboardHeader;
