"use client";

import Profile from "@/components/common/Profile";
import { Button } from "@monocircuit/monolithium/components";
import { useRouter } from "next/navigation";

const ProfileButton = () => {
  const router = useRouter();

  return (
    <Button
      aria-label="Profile"
      className="h-full aspect-square border-solid border-border border-l-(length:--stroke) ml-auto overflow-hidden"
      onClick={() => router.push("/dashboard")}
    >
      <div className="size-full p-1">
        <Profile />
      </div>
    </Button>
  );
};

export default ProfileButton;
