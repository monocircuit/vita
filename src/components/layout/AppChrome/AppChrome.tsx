import { FunctionComponent, ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

import Navbar from "@/components/layout/Navbar";

interface AppChromeProps {
  children: ReactNode;
}

const AppChrome: FunctionComponent<AppChromeProps> = ({ children }) => {
  const pathname = useLocation({ select: (l) => l.pathname });
  const hideNavbar = pathname?.startsWith("/editor");

  if (hideNavbar) {
    return <div className="w-dvw h-dvh">{children}</div>;
  }

  return (
    <div className="flex flex-col w-dvw h-dvh">
      <div className="w-full h-[60px] shrink-0">
        <Navbar />
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
};

export default AppChrome;
