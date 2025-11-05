import Profile from "@/components/common/Profile";
import React, { useEffect } from "react";
import { Button } from "@monolithium/next/components";
import useOwnProfile from "@/shared/supabase/tables/profiles/read/useOwnProfile";

interface Props {}

const DashboardHeader = (props: Props) => {
  const { data: ownProfile } = useOwnProfile();

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
