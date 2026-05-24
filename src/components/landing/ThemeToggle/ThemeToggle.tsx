"use client";

import { FunctionComponent } from "react";
import { Button } from "@monocircuit/monolithium/components";
import { useTheme } from "@/hooks/useTheme";
import SunIcon from "@/assets/images/svg/sun.svg";
import MoonIcon from "@/assets/images/svg/moon.svg";
import scss from "./ThemeToggle.module.scss";

const ThemeToggle: FunctionComponent = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    
      <Button

      className="flex items-center justify-center h-full aspect-square p-0"
      classNameButton="[&_svg]:!h-6 [&_svg]:!w-6"
      onClick={() => toggleTheme()}
      onlyClickAnimation
      vibrate
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>

  );
};

export default ThemeToggle;
