import Profile from "@/components/common/Profile";
import { Button } from "@monocircuit/monolithium/components";
import { useNavigate } from "@tanstack/react-router";

const ProfileButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      aria-label="Profile"
      className="h-full aspect-square border-solid border-border border-l-(length:--stroke) ml-auto overflow-hidden"
      onClick={() => navigate({ to: "/dashboard" })}
    >
      <div className="size-full p-1">
        <Profile />
      </div>
    </Button>
  );
};

export default ProfileButton;
